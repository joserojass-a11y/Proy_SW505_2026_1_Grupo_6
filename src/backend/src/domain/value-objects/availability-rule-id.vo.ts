import { InvalidAvailabilityRuleIdException } from '../exceptions/invalid-availability-rule-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ResourceAvailabilityRuleId {
  private constructor(private readonly _value: string) {}

  static create(value: string): ResourceAvailabilityRuleId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidAvailabilityRuleIdException(value);
    }

    return new ResourceAvailabilityRuleId(normalizedValue);
  }

  static fromNullable(value?: string | null): ResourceAvailabilityRuleId | null {
    return value ? ResourceAvailabilityRuleId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ResourceAvailabilityRuleId): boolean {
    return this._value === other.value;
  }
}
