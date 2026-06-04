import { InvalidUserRoleException } from '../exceptions/invalid-user-role.exception';

export type UserRoleValue = 'CLIENT' | 'ADMIN' | 'OWNER';

export class UserRole {
  private constructor(private readonly _value: UserRoleValue) {}

  static create(value: UserRoleValue | string): UserRole {
    if (value === 'CLIENT' || value === 'ADMIN' || value === 'OWNER') {
      return new UserRole(value);
    }

    throw new InvalidUserRoleException(value);
  }

  static client(): UserRole {
    return new UserRole('CLIENT');
  }

  static admin(): UserRole {
    return new UserRole('ADMIN');
  }

  static owner(): UserRole {
    return new UserRole('OWNER');
  }

  get value(): UserRoleValue {
    return this._value;
  }

  isClient(): boolean {
    return this._value === 'CLIENT';
  }

  isAdmin(): boolean {
    return this._value === 'ADMIN';
  }

  isOwner(): boolean {
    return this._value === 'OWNER';
  }

  equals(other: UserRole): boolean {
    return this._value === other.value;
  }
}
