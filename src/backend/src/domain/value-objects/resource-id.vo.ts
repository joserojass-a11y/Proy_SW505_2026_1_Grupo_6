import { InvalidResourceIdException } from '../exceptions/invalid-resource-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ResourceId {
  private constructor(private readonly _value: string) {}

  static create(value: string): ResourceId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidResourceIdException(value);
    }

    return new ResourceId(normalizedValue);
  }

  static fromNullable(value?: string | null): ResourceId | null {
    return value ? ResourceId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ResourceId): boolean {
    return this._value === other.value;
  }
}
