import { DataSource, QueryRunner } from 'typeorm';
import { IScheduleSlotRepository } from '../../../domain/repositories/schedule-slot.repository';
import { ScheduleSlot } from '../../../domain/entities/schedule-slot.entity';
import { ScheduleSlotId } from '../../../domain/value-objects/schedule-slot-id.vo';
import { ResourceId } from '../../../domain/value-objects/resource-id.vo';
import { TimeRange } from '../../../domain/value-objects/time-range.vo';
import { TypeOrmScheduleSlotEntity } from './entities/typeorm-schedule-slot.entity';

export class TypeOrmScheduleSlotRepository implements IScheduleSlotRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmScheduleSlotEntity);
  }

  async findById(id: ScheduleSlotId): Promise<ScheduleSlot | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByResourceIdAndTimeRange(resourceId: ResourceId, timeRange: TimeRange): Promise<ScheduleSlot[]> {
    const entities = await this.repository
      .createQueryBuilder('slot')
      .where('slot.resourceId = :resourceId', { resourceId: resourceId.value })
      .andWhere('slot.startsAt < :endsAt', { endsAt: timeRange.endsAt })
      .andWhere('slot.endsAt > :startsAt', { startsAt: timeRange.startsAt })
      .getMany();
      
    return entities.map(entity => this.toDomain(entity));
  }

  async save(slot: ScheduleSlot): Promise<ScheduleSlot> {
    const persisted = await this.repository.save(this.toPersistence(slot));
    return this.toDomain(persisted);
  }

  async saveMany(slots: ScheduleSlot[]): Promise<ScheduleSlot[]> {
    const persisted = await this.repository.save(slots.map(s => this.toPersistence(s)));
    return persisted.map(entity => this.toDomain(entity));
  }

  async deleteById(id: ScheduleSlotId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }

  // --- pessimistic locking for reservations ---

  async findConflictingSlotsForUpdate(
    queryRunner: QueryRunner,
    resourceId: ResourceId,
    startsAt: Date,
    endsAt: Date
  ): Promise<ScheduleSlot[]> {
    const entities = await queryRunner.manager
      .createQueryBuilder(TypeOrmScheduleSlotEntity, 'slot')
      .where('slot.resourceId = :resourceId', { resourceId: resourceId.value })
      .andWhere('slot.status IN (:...statuses)', { statuses: ['BOOKED', 'BLOCKED'] })
      .andWhere('slot.startsAt < :endsAt', { endsAt })
      .andWhere('slot.endsAt > :startsAt', { startsAt })
      .setLock('pessimistic_write')
      .getMany();

    return entities.map(entity => this.toDomain(entity));
  }
  
  async getOrCreateSlotForUpdate(
    queryRunner: QueryRunner,
    slot: ScheduleSlot
  ): Promise<ScheduleSlot> {
    // Upsert or insert ignore so we have a row to lock if it doesn't exist
    const primitive = this.toPersistence(slot);
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(TypeOrmScheduleSlotEntity)
      .values(primitive)
      .orIgnore() // If it exists (resource, startsAt, endsAt), ignore
      .execute();
      
    // Now lock the row
    const lockedEntity = await queryRunner.manager
      .createQueryBuilder(TypeOrmScheduleSlotEntity, 'slot')
      .where('slot.resourceId = :resourceId', { resourceId: slot.resourceId.value })
      .andWhere('slot.startsAt = :startsAt', { startsAt: slot.timeRange.startsAt })
      .andWhere('slot.endsAt = :endsAt', { endsAt: slot.timeRange.endsAt })
      .setLock('pessimistic_write')
      .getOne();
      
    if (!lockedEntity) {
        throw new Error('Could not acquire slot lock');
    }
    
    return this.toDomain(lockedEntity);
  }

  private toDomain(entity: TypeOrmScheduleSlotEntity): ScheduleSlot {
    return ScheduleSlot.reconstitute({
      id: entity.id,
      resourceId: entity.resourceId,
      startsAt: entity.startsAt,
      endsAt: entity.endsAt,
      status: entity.status,
      bookingId: entity.bookingId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toPersistence(slot: ScheduleSlot): TypeOrmScheduleSlotEntity {
    const primitives = slot.toPrimitives();
    const entity = new TypeOrmScheduleSlotEntity();
    entity.id = primitives.id;
    entity.resourceId = primitives.resourceId;
    entity.startsAt = primitives.startsAt;
    entity.endsAt = primitives.endsAt;
    entity.status = primitives.status;
    entity.bookingId = primitives.bookingId;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;
    return entity;
  }
}
