import { BookingId } from '../value-objects/booking-id.vo';
import { BookingStatus, BookingStatusValue } from '../value-objects/booking-status.vo';
import { BranchId } from '../value-objects/branch-id.vo';
import { CustomerId } from '../value-objects/customer-id.vo';
import { ServiceId } from '../value-objects/service-id.vo';
import { TenantId } from '../value-objects/tenant-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { BookingNotFoundException } from '../exceptions/booking-not-found.exception';
import { InvalidBookingDateRangeException } from '../exceptions/invalid-booking-date-range.exception';
import { InvalidTransitionException } from '../exceptions/invalid-transition.exception';

export interface BookingPrimitives {
  id: string;
  tenantId: string;
  branchId: string;
  serviceId: string;
  customerId: string;
  startsAt: Date;
  endsAt: Date;
  customerTimezone: string;
  status: BookingStatusValue;
  sourceChannel: string;
  notes?: string;
  customData?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingProps {
  id?: BookingId | string;
  tenantId: TenantId | string;
  branchId: BranchId | string;
  serviceId: ServiceId | string;
  customerId: CustomerId | string;
  startsAt: Date;
  endsAt: Date;
  customerTimezone: string;
  sourceChannel: string;
  status?: BookingStatus | BookingStatusValue;
  notes?: string;
  customData?: Record<string, unknown>;
  createdBy: UserId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteBookingProps {
  id: BookingId | string;
  tenantId: TenantId | string;
  branchId: BranchId | string;
  serviceId: ServiceId | string;
  customerId: CustomerId | string;
  startsAt: Date;
  endsAt: Date;
  customerTimezone: string;
  status: BookingStatus | BookingStatusValue;
  sourceChannel: string;
  notes?: string;
  customData?: Record<string, unknown>;
  createdBy: UserId | string;
  createdAt: Date;
  updatedAt: Date;
}

export class Booking {
  private constructor(
    private _id: BookingId,
    private _tenantId: TenantId,
    private _branchId: BranchId,
    private _serviceId: ServiceId,
    private _customerId: CustomerId,
    private _startsAt: Date,
    private _endsAt: Date,
    private _customerTimezone: string,
    private _status: BookingStatus,
    private _sourceChannel: string,
    private _notes?: string,
    private _customData?: Record<string, unknown>,
    private _createdBy?: UserId,
    private _createdAt?: Date,
    private _updatedAt?: Date,
  ) {}

  static create(props: CreateBookingProps): Booking {
    if (props.startsAt >= props.endsAt) {
      throw new InvalidBookingDateRangeException(props.startsAt, props.endsAt);
    }

    return new Booking(
      Booking.toBookingId(props.id),
      Booking.toTenantId(props.tenantId),
      Booking.toBranchId(props.branchId),
      Booking.toServiceId(props.serviceId),
      Booking.toCustomerId(props.customerId),
      props.startsAt,
      props.endsAt,
      props.customerTimezone,
      Booking.toBookingStatus(props.status ?? 'PENDING'),
      props.sourceChannel,
      props.notes,
      props.customData,
      Booking.toUserId(props.createdBy),
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  static reconstitute(props: ReconstituteBookingProps): Booking {
    return new Booking(
      Booking.toBookingId(props.id),
      Booking.toTenantId(props.tenantId),
      Booking.toBranchId(props.branchId),
      Booking.toServiceId(props.serviceId),
      Booking.toCustomerId(props.customerId),
      props.startsAt,
      props.endsAt,
      props.customerTimezone,
      Booking.toBookingStatus(props.status),
      props.sourceChannel,
      props.notes,
      props.customData,
      Booking.toUserId(props.createdBy),
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): BookingId {
    return this._id;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get branchId(): BranchId {
    return this._branchId;
  }

  get serviceId(): ServiceId {
    return this._serviceId;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get startsAt(): Date {
    return this._startsAt;
  }

  get endsAt(): Date {
    return this._endsAt;
  }

  get customerTimezone(): string {
    return this._customerTimezone;
  }

  get status(): BookingStatus {
    return this._status;
  }

  get sourceChannel(): string {
    return this._sourceChannel;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get customData(): Record<string, unknown> | undefined {
    return this._customData;
  }

  get createdBy(): UserId | undefined {
    return this._createdBy;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  confirm(): void {
    this._status = this._status.transitionTo(BookingStatus.confirmed());
    this._updatedAt = new Date();
  }

  cancel(): void {
    this._status = this._status.transitionTo(BookingStatus.cancelled());
    this._updatedAt = new Date();
  }

  reschedule(newStartsAt: Date, newEndsAt: Date): void {
    if (newStartsAt >= newEndsAt) {
      throw new InvalidBookingDateRangeException(newStartsAt, newEndsAt);
    }

    this._status = this._status.transitionTo(BookingStatus.rescheduled());
    this._startsAt = newStartsAt;
    this._endsAt = newEndsAt;
    this._updatedAt = new Date();
  }

  complete(): void {
    this._status = this._status.transitionTo(BookingStatus.completed());
    this._updatedAt = new Date();
  }

  markAsNoShow(): void {
    this._status = this._status.transitionTo(BookingStatus.noShow());
    this._updatedAt = new Date();
  }

  hasConflictWith(other: Booking): boolean {
    // Bookings conflict if they overlap in time and are for the same service
    if (!this.serviceId.equals(other.serviceId)) {
      return false;
    }

    // Check for time overlap
    return this._startsAt < other.endsAt && this._endsAt > other.startsAt;
  }

  toPrimitives(): BookingPrimitives {
    return {
      id: this._id.value,
      tenantId: this._tenantId.value,
      branchId: this._branchId.value,
      serviceId: this._serviceId.value,
      customerId: this._customerId.value,
      startsAt: this._startsAt,
      endsAt: this._endsAt,
      customerTimezone: this._customerTimezone,
      status: this._status.value,
      sourceChannel: this._sourceChannel,
      notes: this._notes,
      customData: this._customData,
      createdBy: this._createdBy?.value ?? '',
      createdAt: this._createdAt!,
      updatedAt: this._updatedAt!,
    };
  }

  private static toBookingId(value: unknown): BookingId {
    if (value instanceof BookingId) {
      return value;
    }
    return BookingId.create(String(value));
  }

  private static toTenantId(value: unknown): TenantId {
    if (value instanceof TenantId) {
      return value;
    }
    return TenantId.create(String(value));
  }

  private static toBranchId(value: unknown): BranchId {
    if (value instanceof BranchId) {
      return value;
    }
    return BranchId.create(String(value));
  }

  private static toServiceId(value: unknown): ServiceId {
    if (value instanceof ServiceId) {
      return value;
    }
    return ServiceId.create(String(value));
  }

  private static toCustomerId(value: unknown): CustomerId {
    if (value instanceof CustomerId) {
      return value;
    }
    return CustomerId.create(String(value));
  }

  private static toBookingStatus(value: unknown): BookingStatus {
    if (value instanceof BookingStatus) {
      return value;
    }
    return BookingStatus.create(String(value));
  }

  private static toUserId(value: unknown): UserId {
    if (value instanceof UserId) {
      return value;
    }
    return UserId.create(String(value));
  }
}
