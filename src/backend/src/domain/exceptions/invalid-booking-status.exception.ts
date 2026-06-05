import { DomainException } from './domain.exception';

export class InvalidBookingStatusException extends DomainException {
  constructor(status: string) {
    super(`Invalid booking status: ${status}`, 'INVALID_BOOKING_STATUS');
  }
}
