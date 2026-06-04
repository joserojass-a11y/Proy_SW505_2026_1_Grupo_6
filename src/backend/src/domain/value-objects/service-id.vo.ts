import { InvalidServiceIdException } from '../exceptions/invalid-service-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ServiceId {
  private constructor(private readonly _value: string) {}

  static create(value: string): ServiceId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidServiceIdException(value);
    }

    return new ServiceId(normalizedValue);
  }

  static fromNullable(value?: string | null): ServiceId | null {
    return value ? ServiceId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ServiceId): boolean {
    return this._value === other.value;
  }
}
