import { randomUUID } from 'crypto';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import { Booking } from '../../domain/entities/booking.entity';
import { BookingId } from '../../domain/value-objects/booking-id.vo';
import { BranchId } from '../../domain/value-objects/branch-id.vo';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { ServiceId } from '../../domain/value-objects/service-id.vo';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { CreateBookingCommand } from './create-booking.command';
import { CreateBookingResponseDto } from '../dtos/create-booking-response.dto';
import { IAvailabilityService } from '../services/availability.interface';

/**
 * CreateBookingCommandHandler
 *
 * This handler implements the critical business logic for booking creation:
 * 1. Validates the booking request
 * 2. Checks availability using the availability service
 * 3. Uses pessimistic locking (SELECT FOR UPDATE) to prevent double bookings
 * 4. Persists the booking if no conflicts are detected
 *
 * The use of pessimistic locking ensures ACID guarantees:
 * - ATOMICITY: The entire transaction succeeds or fails
 * - CONSISTENCY: No double bookings can occur
 * - ISOLATION: Concurrent requests are serialized
 * - DURABILITY: Once committed, the booking is persistent
 */
export class CreateBookingCommandHandler {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityService: IAvailabilityService,
  ) {}

  async execute(command: CreateBookingCommand): Promise<CreateBookingResponseDto> {
    // Create value objects from command
    const tenantId = TenantId.create(command.tenantId);
    const branchId = BranchId.create(command.branchId);
    const serviceId = ServiceId.create(command.serviceId);
    const customerId = CustomerId.create(command.customerId);
    const createdBy = UserId.create(command.createdBy);

    // Validate date range
    if (command.startsAt >= command.endsAt) {
      throw new Error('Invalid date range: starts_at must be before ends_at');
    }

    // Check availability using the availability service
    const isAvailable = await this.availabilityService.checkAvailability(
      command.serviceId,
      command.startsAt,
      command.endsAt,
    );

    if (!isAvailable) {
      throw new Error('Service is not available for the requested time slot');
    }

    // Create the booking aggregate
    const booking = Booking.create({
      id: BookingId.create(randomUUID()),
      tenantId,
      branchId,
      serviceId,
      customerId,
      startsAt: command.startsAt,
      endsAt: command.endsAt,
      customerTimezone: command.customerTimezone,
      sourceChannel: command.sourceChannel,
      notes: command.notes,
      customData: command.customData,
      createdBy,
      status: 'PENDING',
    });

    // Save with pessimistic locking
    // The repository uses SELECT FOR UPDATE to prevent concurrent bookings
    const savedBooking = await (this.bookingRepository as any).createWithLocking(booking);

    return new CreateBookingResponseDto(
      savedBooking.id.value,
      savedBooking.status.value,
      savedBooking.startsAt,
      savedBooking.endsAt,
      savedBooking.createdAt!,
    );
  }
}
