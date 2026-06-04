import { InvalidResourceTypeIdException } from '../exceptions/invalid-resource-type-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ResourceTypeId {
  private constructor(private readonly _value: string) {}

  static create(value: string): ResourceTypeId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidResourceTypeIdException(value);
    }

    return new ResourceTypeId(normalizedValue);
  }

  static fromNullable(value?: string | null): ResourceTypeId | null {
    return value ? ResourceTypeId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ResourceTypeId): boolean {
    return this._value === other.value;
  }
}
