import { InvalidEmailException } from '../exceptions/invalid-email.exception';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly _value: string) {}

  static create(value: string): Email {
    const normalizedValue = value.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedValue) || normalizedValue.length > 255) {
      throw new InvalidEmailException(value);
    }

    return new Email(normalizedValue);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other.value;
  }
}
