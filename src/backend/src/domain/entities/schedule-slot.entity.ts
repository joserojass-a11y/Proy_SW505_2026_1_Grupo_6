import { ResourceId } from '../value-objects/resource-id.vo';
import { ScheduleSlotId } from '../value-objects/schedule-slot-id.vo';
import { TimeRange } from '../value-objects/time-range.vo';

export interface ScheduleSlotPrimitives {
  id: string;
  resourceId: string;
  startsAt: Date;
  endsAt: Date;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  bookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleSlotProps {
  id?: ScheduleSlotId | string;
  resourceId: ResourceId | string;
  startsAt: Date;
  endsAt: Date;
  status?: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  bookingId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteScheduleSlotProps {
  id: ScheduleSlotId | string;
  resourceId: ResourceId | string;
  startsAt: Date;
  endsAt: Date;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  bookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ScheduleSlot {
  private constructor(
    private _id: ScheduleSlotId,
    private _resourceId: ResourceId,
    private _timeRange: TimeRange,
    private _status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED',
    private _bookingId: string | null,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(props: CreateScheduleSlotProps): ScheduleSlot {
    const timeRange = TimeRange.create(props.startsAt, props.endsAt);
    const status = props.status ?? 'AVAILABLE';
    const bookingId = props.bookingId ?? null;

    if (status === 'BOOKED' && !bookingId) {
      throw new Error('Booking ID is required when status is BOOKED');
    }

    return new ScheduleSlot(
      ScheduleSlot.toSlotId(props.id),
      ScheduleSlot.toResourceId(props.resourceId),
      timeRange,
      status,
      bookingId,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  static reconstitute(props: ReconstituteScheduleSlotProps): ScheduleSlot {
    const timeRange = TimeRange.create(props.startsAt, props.endsAt);

    return new ScheduleSlot(
      ScheduleSlot.toSlotId(props.id),
      ScheduleSlot.toResourceId(props.resourceId),
      timeRange,
      props.status,
      props.bookingId,
      props.createdAt,
      props.updatedAt
    );
  }

  get id(): ScheduleSlotId {
    return this._id;
  }

  get resourceId(): ResourceId {
    return this._resourceId;
  }

  get timeRange(): TimeRange {
    return this._timeRange;
  }

  get status(): 'AVAILABLE' | 'BOOKED' | 'BLOCKED' {
    return this._status;
  }

  get bookingId(): string | null {
    return this._bookingId;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  book(bookingId: string): void {
    if (!bookingId || bookingId.trim().length === 0) {
      throw new Error('Booking ID is required to book a slot');
    }
    if (this._status === 'BOOKED') {
      throw new Error('Slot is already booked');
    }
    if (this._status === 'BLOCKED') {
      throw new Error('Slot is blocked and cannot be booked');
    }

    this._status = 'BOOKED';
    this._bookingId = bookingId.trim();
    this.touch();
  }

  cancelBooking(): void {
    if (this._status !== 'BOOKED') {
      throw new Error('Slot is not currently booked');
    }

    this._status = 'AVAILABLE';
    this._bookingId = null;
    this.touch();
  }

  block(): void {
    if (this._status === 'BOOKED') {
      throw new Error('Cannot block a booked slot');
    }
    this._status = 'BLOCKED';
    this._bookingId = null;
    this.touch();
  }

  release(): void {
    this._status = 'AVAILABLE';
    this._bookingId = null;
    this.touch();
  }

  touch(date: Date = new Date()): void {
    this._updatedAt = date;
  }

  toPrimitives(): ScheduleSlotPrimitives {
    return {
      id: this._id.value,
      resourceId: this._resourceId.value,
      startsAt: this._timeRange.startsAt,
      endsAt: this._timeRange.endsAt,
      status: this._status,
      bookingId: this._bookingId,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt)
    };
  }

  private static toSlotId(value: ScheduleSlotId | string | undefined): ScheduleSlotId {
    if (!value) {
      throw new Error('ScheduleSlot id is required');
    }
    return value instanceof ScheduleSlotId ? value : ScheduleSlotId.create(value);
  }

  private static toResourceId(value: ResourceId | string): ResourceId {
    return value instanceof ResourceId ? value : ResourceId.create(value);
  }
}
