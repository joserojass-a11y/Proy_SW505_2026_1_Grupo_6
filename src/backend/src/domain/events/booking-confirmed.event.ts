import { DomainEvent } from './domain-event.interface';
import { Booking } from '../entities/booking.entity';

export class BookingConfirmedEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(public readonly booking: Booking) {
    this.occurredOn = new Date();
  }

  getAggregateId(): string {
    return this.booking.id.value;
  }
}
