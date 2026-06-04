import { ResourceId } from '../value-objects/resource-id.vo';
import { ResourceAvailabilityRuleId } from '../value-objects/availability-rule-id.vo';
import { TimeSlot } from '../value-objects/time-slot.vo';

export interface ResourceAvailabilityRulePrimitives {
  id: string;
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom: Date;
  validTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAvailabilityRuleProps {
  id?: ResourceAvailabilityRuleId | string;
  resourceId: ResourceId | string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom?: Date;
  validTo?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteAvailabilityRuleProps {
  id: ResourceAvailabilityRuleId | string;
  resourceId: ResourceId | string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom: Date;
  validTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ResourceAvailabilityRule {
  private constructor(
    private _id: ResourceAvailabilityRuleId,
    private _resourceId: ResourceId,
    private _dayOfWeek: number,
    private _shift: TimeSlot,
    private _validFrom: Date,
    private _validTo: Date | null,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(props: CreateAvailabilityRuleProps): ResourceAvailabilityRule {
    ResourceAvailabilityRule.validateDayOfWeek(props.dayOfWeek);
    const shift = TimeSlot.create(props.startTime, props.endTime);

    const validFrom = props.validFrom ?? new Date();
    const validTo = props.validTo ?? null;
    ResourceAvailabilityRule.validateValidityDates(validFrom, validTo);

    return new ResourceAvailabilityRule(
      ResourceAvailabilityRule.toRuleId(props.id),
      ResourceAvailabilityRule.toResourceId(props.resourceId),
      props.dayOfWeek,
      shift,
      validFrom,
      validTo,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  static reconstitute(props: ReconstituteAvailabilityRuleProps): ResourceAvailabilityRule {
    ResourceAvailabilityRule.validateDayOfWeek(props.dayOfWeek);
    const shift = TimeSlot.create(props.startTime, props.endTime);
    ResourceAvailabilityRule.validateValidityDates(props.validFrom, props.validTo);

    return new ResourceAvailabilityRule(
      ResourceAvailabilityRule.toRuleId(props.id),
      ResourceAvailabilityRule.toResourceId(props.resourceId),
      props.dayOfWeek,
      shift,
      props.validFrom,
      props.validTo,
      props.createdAt,
      props.updatedAt
    );
  }

  get id(): ResourceAvailabilityRuleId {
    return this._id;
  }

  get resourceId(): ResourceId {
    return this._resourceId;
  }

  get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  get shift(): TimeSlot {
    return this._shift;
  }

  get validFrom(): Date {
    return new Date(this._validFrom);
  }

  get validTo(): Date | null {
    return this._validTo ? new Date(this._validTo) : null;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  updateRule(props: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    validFrom?: Date;
    validTo?: Date | null;
  }): void {
    if (props.dayOfWeek !== undefined) {
      ResourceAvailabilityRule.validateDayOfWeek(props.dayOfWeek);
      this._dayOfWeek = props.dayOfWeek;
    }

    if (props.startTime !== undefined || props.endTime !== undefined) {
      const newStartTime = props.startTime ?? this._shift.startTime;
      const newEndTime = props.endTime ?? this._shift.endTime;
      this._shift = TimeSlot.create(newStartTime, newEndTime);
    }

    const newValidFrom = props.validFrom ?? this._validFrom;
    const newValidTo = props.validTo !== undefined ? props.validTo : this._validTo;
    ResourceAvailabilityRule.validateValidityDates(newValidFrom, newValidTo);
    this._validFrom = newValidFrom;
    this._validTo = newValidTo;

    this.touch();
  }

  isValidOn(date: Date): boolean {
    const time = date.getTime();
    if (time < this._validFrom.getTime()) {
      return false;
    }
    if (this._validTo && time > this._validTo.getTime()) {
      return false;
    }
    const jsDay = date.getUTCDay();
    const dayMapped = jsDay === 0 ? 7 : jsDay;
    return dayMapped === this._dayOfWeek;
  }

  touch(date: Date = new Date()): void {
    this._updatedAt = date;
  }

  toPrimitives(): ResourceAvailabilityRulePrimitives {
    return {
      id: this._id.value,
      resourceId: this._resourceId.value,
      dayOfWeek: this._dayOfWeek,
      startTime: this._shift.startTime,
      endTime: this._shift.endTime,
      validFrom: new Date(this._validFrom),
      validTo: this._validTo ? new Date(this._validTo) : null,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt)
    };
  }

  private static toRuleId(value: ResourceAvailabilityRuleId | string | undefined): ResourceAvailabilityRuleId {
    if (!value) {
      throw new Error('ResourceAvailabilityRule id is required');
    }
    return value instanceof ResourceAvailabilityRuleId ? value : ResourceAvailabilityRuleId.create(value);
  }

  private static toResourceId(value: ResourceId | string): ResourceId {
    return value instanceof ResourceId ? value : ResourceId.create(value);
  }

  private static validateDayOfWeek(day: number): void {
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      throw new Error('Day of week must be an integer between 1 and 7');
    }
  }

  private static validateValidityDates(from: Date, to: Date | null): void {
    if (to && from.getTime() > to.getTime()) {
      throw new Error('ValidFrom date cannot be after ValidTo date');
    }
  }
}
