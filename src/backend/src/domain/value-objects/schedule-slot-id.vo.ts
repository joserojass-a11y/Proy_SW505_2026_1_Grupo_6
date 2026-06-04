import { InvalidScheduleSlotIdException } from '../exceptions/invalid-schedule-slot-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ScheduleSlotId {
  private constructor(private readonly _value: string) {}

  static create(value: string): ScheduleSlotId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidScheduleSlotIdException(value);
    }

    return new ScheduleSlotId(normalizedValue);
  }

  static fromNullable(value?: string | null): ScheduleSlotId | null {
    return value ? ScheduleSlotId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ScheduleSlotId): boolean {
    return this._value === other.value;
  }
}
