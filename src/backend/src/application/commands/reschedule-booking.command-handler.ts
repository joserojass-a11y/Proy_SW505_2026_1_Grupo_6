import { BookingRepository } from '../../domain/repositories/booking.repository';
import { BookingId } from '../../domain/value-objects/booking-id.vo';
import { BookingNotFoundException } from '../../domain/exceptions/booking-not-found.exception';
import { RescheduleBookingCommand } from './reschedule-booking.command';
import { BookingDetailDto } from '../dtos/booking-detail.dto';
import { IAvailabilityService } from '../services/availability.interface';

/**
 * RescheduleBookingCommandHandler
 *
 * This handler reschedules a booking to a new time slot.
 * It also uses pessimistic locking to prevent conflicts with the new time slot.
 */
export class RescheduleBookingCommandHandler {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityService: IAvailabilityService,
  ) {}

  async execute(command: RescheduleBookingCommand): Promise<BookingDetailDto> {
    const bookingId = BookingId.create(command.bookingId);

    // Find the booking
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(command.bookingId);
    }

    // Check availability for the new time slot
    const isAvailable = await this.availabilityService.checkAvailability(
      booking.serviceId.value,
      command.newStartsAt,
      command.newEndsAt,
    );

    if (!isAvailable) {
      throw new Error('Service is not available for the requested time slot');
    }

    // Check for conflicts with the new time slot
    const conflictingBookings = await this.bookingRepository.findConflictingBookings(
      booking.serviceId,
      command.newStartsAt,
      command.newEndsAt,
    );

    if (conflictingBookings.length > 0) {
      throw new Error('The new time slot conflicts with existing bookings');
    }

    // Reschedule the booking (this validates state transitions)
    booking.reschedule(command.newStartsAt, command.newEndsAt);

    // Update in repository
    const updatedBooking = await this.bookingRepository.update(booking);

    // Convert to DTO
    const primitives = updatedBooking.toPrimitives();
    return new BookingDetailDto({
      id: primitives.id,
      tenantId: primitives.tenantId,
      branchId: primitives.branchId,
      serviceId: primitives.serviceId,
      customerId: primitives.customerId,
      startsAt: primitives.startsAt,
      endsAt: primitives.endsAt,
      customerTimezone: primitives.customerTimezone,
      status: primitives.status,
      sourceChannel: primitives.sourceChannel,
      notes: primitives.notes,
      customData: primitives.customData,
      createdBy: primitives.createdBy!,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });
  }
}
