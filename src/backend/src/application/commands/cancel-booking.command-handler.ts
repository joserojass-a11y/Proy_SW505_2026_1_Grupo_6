import { BookingRepository } from '../../domain/repositories/booking.repository';
import { BookingId } from '../../domain/value-objects/booking-id.vo';
import { BookingNotFoundException } from '../../domain/exceptions/booking-not-found.exception';
import { CancelBookingCommand } from './cancel-booking.command';
import { BookingDetailDto } from '../dtos/booking-detail.dto';
import { DomainEventPublisher } from '../../shared/domain-event-publisher';
import { BookingCancelledEvent } from '../../domain/events/booking-cancelled.event';

/**
 * CancelBookingCommandHandler
 *
 * This handler cancels an existing booking, validating state transitions
 * and publishing a BookingCancelledEvent on success.
 */
export class CancelBookingCommandHandler {
  constructor(
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(command: CancelBookingCommand): Promise<BookingDetailDto> {
    const bookingId = BookingId.create(command.bookingId);

    // Find the booking
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(command.bookingId);
    }

    // Cancel the booking (this validates state transitions)
    booking.cancel();

    // Update in repository
    const updatedBooking = await this.bookingRepository.update(booking);

    // Publish Domain Event
    await DomainEventPublisher.publish(new BookingCancelledEvent(updatedBooking));

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
