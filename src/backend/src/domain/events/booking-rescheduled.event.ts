import { DomainEvent } from './domain-event.interface';
import { Booking } from '../entities/booking.entity';

export class BookingRescheduledEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly booking: Booking,
    public readonly oldStartsAt: Date,
    public readonly oldEndsAt: Date,
  ) {
    this.occurredOn = new Date();
  }

  getAggregateId(): string {
    return this.booking.id.value;
  }
}
