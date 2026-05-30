import { InvalidPasswordHashException } from '../exceptions/invalid-password-hash.exception';

export class PasswordHash {
  private constructor(private readonly _value: string) {}

  static create(value: string): PasswordHash {
    const normalizedValue = value.trim();

    if (normalizedValue.length < 20 || normalizedValue.length > 255) {
      throw new InvalidPasswordHashException();
    }

    return new PasswordHash(normalizedValue);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PasswordHash): boolean {
    return this._value === other.value;
  }
}
