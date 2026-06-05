import { DomainException } from './domain.exception';

export class BookingAlreadyExistsException extends DomainException {
  constructor(serviceId: string, startsAt: Date, endsAt: Date) {
    super(
      `Booking already exists for service ${serviceId} between ${startsAt.toISOString()} and ${endsAt.toISOString()}`,
      'BOOKING_ALREADY_EXISTS',
    );
  }
}
