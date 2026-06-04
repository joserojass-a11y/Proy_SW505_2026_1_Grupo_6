import { InvalidBranchIdException } from '../exceptions/invalid-branch-id.exception';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BranchId {
  private constructor(private readonly _value: string) {}

  static create(value: string): BranchId {
    const normalizedValue = value.trim();

    if (!UUID_REGEX.test(normalizedValue)) {
      throw new InvalidBranchIdException(value);
    }

    return new BranchId(normalizedValue);
  }

  static fromNullable(value?: string | null): BranchId | null {
    return value ? BranchId.create(value) : null;
  }

  get value(): string {
    return this._value;
  }

  equals(other: BranchId): boolean {
    return this._value === other.value;
  }
}
