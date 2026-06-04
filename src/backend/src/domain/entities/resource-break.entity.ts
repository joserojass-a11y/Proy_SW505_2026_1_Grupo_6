import { ResourceAvailabilityRuleId } from '../value-objects/availability-rule-id.vo';
import { ResourceBreakId } from '../value-objects/break-id.vo';
import { TimeSlot } from '../value-objects/time-slot.vo';

export interface ResourceBreakPrimitives {
  id: string;
  availabilityRuleId: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceBreakProps {
  id?: ResourceBreakId | string;
  availabilityRuleId: ResourceAvailabilityRuleId | string;
  startTime: string;
  endTime: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteResourceBreakProps {
  id: ResourceBreakId | string;
  availabilityRuleId: ResourceAvailabilityRuleId | string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ResourceBreak {
  private constructor(
    private _id: ResourceBreakId,
    private _availabilityRuleId: ResourceAvailabilityRuleId,
    private _period: TimeSlot,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(props: CreateResourceBreakProps): ResourceBreak {
    const period = TimeSlot.create(props.startTime, props.endTime);

    return new ResourceBreak(
      ResourceBreak.toBreakId(props.id),
      ResourceBreak.toAvailabilityRuleId(props.availabilityRuleId),
      period,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  static reconstitute(props: ReconstituteResourceBreakProps): ResourceBreak {
    const period = TimeSlot.create(props.startTime, props.endTime);

    return new ResourceBreak(
      ResourceBreak.toBreakId(props.id),
      ResourceBreak.toAvailabilityRuleId(props.availabilityRuleId),
      period,
      props.createdAt,
      props.updatedAt
    );
  }

  get id(): ResourceBreakId {
    return this._id;
  }

  get availabilityRuleId(): ResourceAvailabilityRuleId {
    return this._availabilityRuleId;
  }

  get period(): TimeSlot {
    return this._period;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  updatePeriod(period: TimeSlot): void {
    if (!period) {
      throw new Error('Break period is required');
    }
    this._period = period;
    this.touch();
  }

  touch(date: Date = new Date()): void {
    this._updatedAt = date;
  }

  toPrimitives(): ResourceBreakPrimitives {
    return {
      id: this._id.value,
      availabilityRuleId: this._availabilityRuleId.value,
      startTime: this._period.startTime,
      endTime: this._period.endTime,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt)
    };
  }

  private static toBreakId(value: ResourceBreakId | string | undefined): ResourceBreakId {
    if (!value) {
      throw new Error('ResourceBreak id is required');
    }
    return value instanceof ResourceBreakId ? value : ResourceBreakId.create(value);
  }

  private static toAvailabilityRuleId(value: ResourceAvailabilityRuleId | string): ResourceAvailabilityRuleId {
    return value instanceof ResourceAvailabilityRuleId ? value : ResourceAvailabilityRuleId.create(value);
  }
}
