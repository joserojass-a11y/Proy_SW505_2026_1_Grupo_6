import { InvalidFullNameException } from '../exceptions/invalid-full-name.exception';

export class FullName {
  private constructor(private readonly _value: string) {}

  static create(value: string): FullName {
    if (typeof value !== 'string') {
      throw new InvalidFullNameException();
    }

    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (normalizedValue.length < 3 || normalizedValue.length > 255) {
      throw new InvalidFullNameException();
    }

    return new FullName(normalizedValue);
  }

  get value(): string {
    return this._value;
  }

  equals(other: FullName): boolean {
    return this._value === other.value;
  }
}
