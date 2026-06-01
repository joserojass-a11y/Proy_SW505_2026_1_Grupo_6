import { Email } from '../value-objects/email.vo';
import { FullName } from '../value-objects/full-name.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserRole } from '../value-objects/user-role.vo';
import { UserStatus } from '../value-objects/user-status.vo';
import { UserStatusTransitionException } from '../exceptions/user-status-transition.exception';

export interface UserPrimitives {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'CLIENT' | 'ADMIN' | 'OWNER';
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  id?: UserId | string;
  email: Email | string;
  passwordHash: PasswordHash | string;
  fullName: FullName | string;
  role?: UserRole | 'CLIENT' | 'ADMIN' | 'OWNER';
  status?: UserStatus | 'PENDING' | 'ACTIVE' | 'BLOCKED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteUserProps {
  id: UserId | string;
  email: Email | string;
  passwordHash: PasswordHash | string;
  fullName: FullName | string;
  role: UserRole | 'CLIENT' | 'ADMIN' | 'OWNER';
  status: UserStatus | 'PENDING' | 'ACTIVE' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(
    private _id: UserId,
    private _email: Email,
    private _passwordHash: PasswordHash,
    private _fullName: FullName,
    private _role: UserRole,
    private _status: UserStatus,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreateUserProps): User {
    return new User(
      User.toUserId(props.id),
      User.toEmail(props.email),
      User.toPasswordHash(props.passwordHash),
      User.toFullName(props.fullName),
      User.toUserRole(props.role ?? 'CLIENT'),
      User.toUserStatus(props.status ?? 'PENDING'),
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  static reconstitute(props: ReconstituteUserProps): User {
    return new User(
      User.toUserId(props.id),
      User.toEmail(props.email),
      User.toPasswordHash(props.passwordHash),
      User.toFullName(props.fullName),
      User.toUserRole(props.role),
      User.toUserStatus(props.status),
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  get fullName(): FullName {
    return this._fullName;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  updateProfile(props: { email?: Email | string; fullName?: FullName | string }): void {
    if (props.email) {
      this._email = User.toEmail(props.email);
    }

    if (props.fullName) {
      this._fullName = User.toFullName(props.fullName);
    }

    this.touch();
  }

  changePasswordHash(passwordHash: PasswordHash | string): void {
    this._passwordHash = User.toPasswordHash(passwordHash);
    this.touch();
  }

  assignRole(role: UserRole | 'CLIENT' | 'ADMIN' | 'OWNER'): void {
    this._role = User.toUserRole(role);
    this.touch();
  }

  changeStatus(status: UserStatus | 'PENDING' | 'ACTIVE' | 'BLOCKED'): void {
    const nextStatus = User.toUserStatus(status);
    const currentStatus = this._status.value;

    const allowedTransitions: Record<string, UserStatus['value'][]> = {
      PENDING: ['ACTIVE', 'BLOCKED'],
      ACTIVE: ['BLOCKED', 'ACTIVE'],
      BLOCKED: ['ACTIVE', 'BLOCKED'],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus.value)) {
      throw new UserStatusTransitionException(currentStatus, nextStatus.value);
    }

    this._status = nextStatus;
    this.touch();
  }

  activate(): void {
    this.changeStatus(UserStatus.active());
  }

  block(): void {
    this.changeStatus(UserStatus.blocked());
  }

  markPending(): void {
    this.changeStatus(UserStatus.pending());
  }

  touch(date: Date = new Date()): void {
    this._updatedAt = date;
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this._id.value,
      email: this._email.value,
      passwordHash: this._passwordHash.value,
      fullName: this._fullName.value,
      role: this._role.value,
      status: this._status.value,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }

  private static toUserId(value: UserId | string | undefined): UserId {
    if (!value) {
      throw new Error('User id is required');
    }

    return value instanceof UserId ? value : UserId.create(value);
  }

  private static toEmail(value: Email | string): Email {
    return value instanceof Email ? value : Email.create(value);
  }

  private static toPasswordHash(value: PasswordHash | string): PasswordHash {
    return value instanceof PasswordHash ? value : PasswordHash.create(value);
  }

  private static toFullName(value: FullName | string): FullName {
    return value instanceof FullName ? value : FullName.create(value);
  }

  private static toUserRole(value: UserRole | 'CLIENT' | 'ADMIN' | 'OWNER'): UserRole {
    return value instanceof UserRole ? value : UserRole.create(value);
  }

  private static toUserStatus(value: UserStatus | 'PENDING' | 'ACTIVE' | 'BLOCKED'): UserStatus {
    return value instanceof UserStatus ? value : UserStatus.create(value);
  }
}
