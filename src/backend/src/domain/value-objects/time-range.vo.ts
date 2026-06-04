import { InvalidTimeRangeException } from '../exceptions/invalid-time-range.exception';

export class TimeRange {
  private constructor(
    private readonly _startsAt: Date,
    private readonly _endsAt: Date
  ) {}

  static create(startsAt: Date, endsAt: Date): TimeRange {
    if (!(startsAt instanceof Date) || isNaN(startsAt.getTime())) {
      throw new InvalidTimeRangeException('StartsAt must be a valid Date');
    }
    if (!(endsAt instanceof Date) || isNaN(endsAt.getTime())) {
      throw new InvalidTimeRangeException('EndsAt must be a valid Date');
    }
    if (startsAt.getTime() >= endsAt.getTime()) {
      throw new InvalidTimeRangeException(
        `StartsAt (${startsAt.toISOString()}) must be before EndsAt (${endsAt.toISOString()})`
      );
    }

    return new TimeRange(new Date(startsAt), new Date(endsAt));
  }

  get startsAt(): Date {
    return new Date(this._startsAt);
  }

  get endsAt(): Date {
    return new Date(this._endsAt);
  }

  get durationInMinutes(): number {
    const diffMs = this._endsAt.getTime() - this._startsAt.getTime();
    return Math.round(diffMs / 60000);
  }

  overlaps(other: TimeRange): boolean {
    return (
      this._startsAt.getTime() < other._endsAt.getTime() &&
      other._startsAt.getTime() < this._endsAt.getTime()
    );
  }

  contains(date: Date): boolean {
    const time = date.getTime();
    return time >= this._startsAt.getTime() && time <= this._endsAt.getTime();
  }

  equals(other: TimeRange): boolean {
    return (
      this._startsAt.getTime() === other._startsAt.getTime() &&
      this._endsAt.getTime() === other._endsAt.getTime()
    );
  }
}
