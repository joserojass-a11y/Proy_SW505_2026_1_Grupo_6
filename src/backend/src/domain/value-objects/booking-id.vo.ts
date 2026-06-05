import { InvalidBookingIdException } from '../exceptions/invalid-booking-id.exception';

export class BookingId {
  private constructor(private readonly _value: string) {}

  static create(value: string | BookingId): BookingId {
    if (value instanceof BookingId) {
      return value;
    }

    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new InvalidBookingIdException(String(value));
    }

    return new BookingId(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: BookingId): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
