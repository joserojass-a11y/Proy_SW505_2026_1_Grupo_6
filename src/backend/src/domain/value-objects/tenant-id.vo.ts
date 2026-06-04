import { InvalidUserIdException } from '../exceptions/invalid-user-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class TenantId {
  private constructor(private readonly _value: string) {}

  static create(value: string): TenantId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidUserIdException(value);
    }

    return new TenantId(normalizedValue);
  }

  get value(): string {
    return this._value;
  }

  equals(other: TenantId): boolean {
    return this._value === other.value;
  }
}
