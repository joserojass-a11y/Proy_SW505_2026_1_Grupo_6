import { InvalidBookingStatusException } from '../exceptions/invalid-booking-status.exception';
import { InvalidTransitionException } from '../exceptions/invalid-transition.exception';

export type BookingStatusValue = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED' | 'NO_SHOW';

/**
 * Represents booking status with valid state transitions
 *
 * Valid transitions:
 * PENDING -> CONFIRMED | CANCELLED
 * CONFIRMED -> CANCELLED | RESCHEDULED | COMPLETED | NO_SHOW
 * CANCELLED, RESCHEDULED, COMPLETED, NO_SHOW -> terminal states
 */
export class BookingStatus {
  private constructor(private readonly _value: BookingStatusValue) {}

  static create(value: BookingStatusValue | string): BookingStatus {
    const validStatuses: BookingStatusValue[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW'];

    if (validStatuses.includes(value as BookingStatusValue)) {
      return new BookingStatus(value as BookingStatusValue);
    }

    throw new InvalidBookingStatusException(value);
  }

  static pending(): BookingStatus {
    return new BookingStatus('PENDING');
  }

  static confirmed(): BookingStatus {
    return new BookingStatus('CONFIRMED');
  }

  static cancelled(): BookingStatus {
    return new BookingStatus('CANCELLED');
  }

  static rescheduled(): BookingStatus {
    return new BookingStatus('RESCHEDULED');
  }

  static completed(): BookingStatus {
    return new BookingStatus('COMPLETED');
  }

  static noShow(): BookingStatus {
    return new BookingStatus('NO_SHOW');
  }

  get value(): BookingStatusValue {
    return this._value;
  }

  canTransitionTo(newStatus: BookingStatus): boolean {
    const validTransitions: Record<BookingStatusValue, BookingStatusValue[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CANCELLED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW'],
      CANCELLED: [],
      RESCHEDULED: [],
      COMPLETED: [],
      NO_SHOW: [],
    };

    return validTransitions[this._value]?.includes(newStatus.value) ?? false;
  }

  transitionTo(newStatus: BookingStatus): BookingStatus {
    if (!this.canTransitionTo(newStatus)) {
      throw new InvalidTransitionException(`Cannot transition from ${this._value} to ${newStatus.value}`);
    }
    return newStatus;
  }

  isPending(): boolean {
    return this._value === 'PENDING';
  }

  isConfirmed(): boolean {
    return this._value === 'CONFIRMED';
  }

  isCancelled(): boolean {
    return this._value === 'CANCELLED';
  }

  isRescheduled(): boolean {
    return this._value === 'RESCHEDULED';
  }

  isCompleted(): boolean {
    return this._value === 'COMPLETED';
  }

  isNoShow(): boolean {
    return this._value === 'NO_SHOW';
  }

  equals(other: BookingStatus): boolean {
    return this._value === other.value;
  }
}
