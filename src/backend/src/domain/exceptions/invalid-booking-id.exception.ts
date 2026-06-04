import { DomainException } from './domain.exception';

export class InvalidBookingIdException extends DomainException {
  constructor(value: string) {
    super(`Invalid booking ID: ${value}`, 'INVALID_BOOKING_ID');
  }
}
