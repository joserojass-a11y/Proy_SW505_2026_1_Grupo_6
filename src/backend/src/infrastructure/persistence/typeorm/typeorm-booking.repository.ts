import { DataSource, QueryRunner } from 'typeorm';
import { BookingRepository } from '../../../domain/repositories/booking.repository';
import { Booking } from '../../../domain/entities/booking.entity';
import { BookingId } from '../../../domain/value-objects/booking-id.vo';
import { ServiceId } from '../../../domain/value-objects/service-id.vo';
import { TenantId } from '../../../domain/value-objects/tenant-id.vo';
import { TypeOrmBookingEntity } from './entities/typeorm-booking.entity';
import { TypeOrmScheduleSlotEntity } from './entities/typeorm-schedule-slot.entity';
import { BookingAlreadyExistsException } from '../../../domain/exceptions/booking-already-exists.exception';

export class TypeOrmBookingRepository implements BookingRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmBookingEntity);
  }

  async findById(id: BookingId): Promise<Booking | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdAndTenant(id: BookingId, tenantId: TenantId): Promise<Booking | null> {
    const entity = await this.repository.findOne({
      where: { id: id.value, tenantId: tenantId.value },
    });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Finds conflicting bookings without locking
   * Used for read-only queries
   */
  async findConflictingBookings(serviceId: ServiceId, startsAt: Date, endsAt: Date): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: {
        serviceId: serviceId.value,
      },
    });

    // Filter in memory for bookings that overlap in time
    return entities
      .filter(
        (entity) =>
          entity.status !== 'CANCELLED' && entity.status !== 'RESCHEDULED' && startsAt < entity.endsAt && endsAt > entity.startsAt,
      )
      .map((entity) => this.toDomain(entity));
  }

  /**
   * Finds conflicting bookings with pessimistic locking (SELECT FOR UPDATE)
   * CRITICAL: Used during booking creation to prevent double reservations
   *
   * This uses a transaction with pessimistic locking to ensure:
   * 1. No concurrent writes can occur to overlapping bookings
   * 2. ACID guarantees are maintained
   * 3. If a conflict is found, the entire transaction is rolled back
   */
  async findConflictingBookingsForUpdate(serviceId: ServiceId, startsAt: Date, endsAt: Date): Promise<Booking[]> {
    // Using query builder to support FOR UPDATE
    const conflictingEntities = await this.repository
      .createQueryBuilder('booking')
      .where('booking.resourceId = :resourceId', { resourceId: serviceId.value }) // THIS LOGIC MOVES TO SLOTS
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: ['CANCELLED', 'RESCHEDULED'],
      })
      .andWhere('booking.startsAt < :endsAt', { endsAt })
      .andWhere('booking.endsAt > :startsAt', { startsAt })
      .setLock('pessimistic_write')
      .getMany();

    return conflictingEntities.map((entity) => this.toDomain(entity));
  }

  async listByServiceId(serviceId: ServiceId): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: { serviceId: serviceId.value },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async listByCustomerId(customerId: string): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: { customerId },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async listByTenantId(tenantId: TenantId): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: { tenantId: tenantId.value },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Saves a new booking within a transaction with pessimistic locking
   * This method is typically called from a command handler that:
   * 1. Starts a transaction
   * 2. Calls findConflictingBookingsForUpdate to lock the rows
   * 3. If no conflicts, calls save()
   * 4. Commits the transaction
   */
  async save(booking: Booking): Promise<Booking> {
    const persisted = await this.repository.save(this.toPersistence(booking));
    return this.toDomain(persisted);
  }

  async update(booking: Booking): Promise<Booking> {
    const persisted = await this.repository.save(this.toPersistence(booking));
    return this.toDomain(persisted);
  }

  async deleteById(id: BookingId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }

  /**
   * Executes a booking creation within a transaction with pessimistic locking
   * This is the CRITICAL method that prevents double bookings
   */
  async createWithLocking(
    booking: Booking,
    onConflict?: (conflictingBookings: Booking[]) => Promise<void>,
  ): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Ensure the slot row exists to be locked
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(TypeOrmScheduleSlotEntity)
        .values({
           resourceId: booking.resourceId.value,
           startsAt: booking.startsAt,
           endsAt: booking.endsAt,
           status: 'AVAILABLE'
        })
        .orIgnore()
        .execute();

      // 2. Pessimistic write lock on the slot
      const conflictingBookings = await this.findConflictingSlotsForUpdateWithQueryRunner(
        queryRunner,
        booking.resourceId.value,
        booking.startsAt,
        booking.endsAt,
      );

      if (conflictingBookings.length > 0) {
        await queryRunner.rollbackTransaction();
        if (onConflict) {
          await onConflict(conflictingBookings);
        }
        throw new BookingAlreadyExistsException(booking.serviceId.value, booking.startsAt, booking.endsAt);
      }

      // 3. Mark the slot as BOOKED
      await queryRunner.manager
        .createQueryBuilder()
        .update(TypeOrmScheduleSlotEntity)
        .set({ status: 'BOOKED', bookingId: booking.id.value })
        .where('resource_id = :resourceId AND starts_at = :startsAt AND ends_at = :endsAt', {
           resourceId: booking.resourceId.value,
           startsAt: booking.startsAt,
           endsAt: booking.endsAt
        })
        .execute();

      // 4. Insert the booking
      const entity = await queryRunner.manager.save(TypeOrmBookingEntity, this.toPersistence(booking));

      await queryRunner.commitTransaction();

      return this.toDomain(entity);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findConflictingSlotsForUpdateWithQueryRunner(
    queryRunner: QueryRunner,
    resourceId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<any[]> {
    const entities = await queryRunner.manager
      .createQueryBuilder(TypeOrmScheduleSlotEntity, 'slot')
      .where('slot.resourceId = :resourceId', { resourceId })
      .andWhere('slot.status IN (:...statuses)', { statuses: ['BOOKED', 'BLOCKED'] })
      .andWhere('slot.startsAt < :endsAt', { endsAt })
      .andWhere('slot.endsAt > :startsAt', { startsAt })
      .setLock('pessimistic_write')
      .getMany();

    return entities;
  }

  private toDomain(entity: TypeOrmBookingEntity): Booking {
    return Booking.reconstitute({
      id: entity.id,
      tenantId: entity.tenantId,
      branchId: entity.branchId,
      serviceId: entity.serviceId,
      resourceId: entity.resourceId,
      customerId: entity.customerId,
      startsAt: entity.startsAt,
      endsAt: entity.endsAt,
      customerTimezone: entity.customerTimezone,
      status: entity.status,
      sourceChannel: entity.sourceChannel,
      notes: entity.notes,
      customData: entity.customData,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toPersistence(booking: Booking): TypeOrmBookingEntity {
    const primitives = booking.toPrimitives();
    const entity = new TypeOrmBookingEntity();

    entity.id = primitives.id;
    entity.tenantId = primitives.tenantId;
    entity.branchId = primitives.branchId;
    entity.serviceId = primitives.serviceId;
    entity.resourceId = primitives.resourceId;
    entity.customerId = primitives.customerId;
    entity.startsAt = primitives.startsAt;
    entity.endsAt = primitives.endsAt;
    entity.customerTimezone = primitives.customerTimezone;
    entity.status = primitives.status;
    entity.sourceChannel = primitives.sourceChannel;
    entity.notes = primitives.notes;
    entity.customData = primitives.customData;
    entity.createdBy = primitives.createdBy;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;

    return entity;
  }
}
