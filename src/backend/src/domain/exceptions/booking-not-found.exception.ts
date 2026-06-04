import { DomainException } from './domain.exception';

export class BookingNotFoundException extends DomainException {
  constructor(bookingId: string) {
    super(`Booking not found: ${bookingId}`, 'BOOKING_NOT_FOUND');
  }
}
