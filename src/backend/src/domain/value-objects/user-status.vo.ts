import { InvalidUserStatusException } from '../exceptions/invalid-user-status.exception';

export type UserStatusValue = 'PENDING' | 'ACTIVE' | 'BLOCKED';

export class UserStatus {
  private constructor(private readonly _value: UserStatusValue) {}

  static create(value: UserStatusValue | string): UserStatus {
    if (value === 'PENDING' || value === 'ACTIVE' || value === 'BLOCKED') {
      return new UserStatus(value);
    }

    throw new InvalidUserStatusException(value);
  }

  static pending(): UserStatus {
    return new UserStatus('PENDING');
  }

  static active(): UserStatus {
    return new UserStatus('ACTIVE');
  }

  static blocked(): UserStatus {
    return new UserStatus('BLOCKED');
  }

  get value(): UserStatusValue {
    return this._value;
  }

  isPending(): boolean {
    return this._value === 'PENDING';
  }

  isActive(): boolean {
    return this._value === 'ACTIVE';
  }

  isBlocked(): boolean {
    return this._value === 'BLOCKED';
  }

  equals(other: UserStatus): boolean {
    return this._value === other.value;
  }
}
