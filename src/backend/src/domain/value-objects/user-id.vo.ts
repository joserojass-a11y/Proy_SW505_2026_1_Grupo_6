import { InvalidUserIdException } from '../exceptions/invalid-user-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UserId {
  private constructor(private readonly _value: string) {}

  static create(value: string): UserId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidUserIdException(value);
    }

    return new UserId(normalizedValue);
  }

  static fromNullable(value?: string | null): UserId | null {
    return value ? UserId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other.value;
  }
}
