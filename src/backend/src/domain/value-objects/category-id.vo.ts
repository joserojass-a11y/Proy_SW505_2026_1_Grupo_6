import { InvalidCategoryIdException } from '../exceptions/invalid-category-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CategoryId {
  private constructor(private readonly _value: string) {}

  static create(value: string): CategoryId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidCategoryIdException(value);
    }

    return new CategoryId(normalizedValue);
  }

  static fromNullable(value?: string | null): CategoryId | null {
    return value ? CategoryId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: CategoryId): boolean {
    return this._value === other.value;
  }
}
