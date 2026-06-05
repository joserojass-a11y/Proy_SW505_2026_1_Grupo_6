import { DomainException } from './domain.exception';

export class InvalidBookingDateRangeException extends DomainException {
  constructor(startsAt: Date, endsAt: Date) {
    super(
      `Invalid booking date range: starts_at (${startsAt.toISOString()}) must be before ends_at (${endsAt.toISOString()})`,
      'INVALID_BOOKING_DATE_RANGE',
    );
  }
}
