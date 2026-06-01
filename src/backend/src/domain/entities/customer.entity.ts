import { TenantId } from '../value-objects/tenant-id.vo';
import { CustomerId } from '../value-objects/customer-id.vo';
import { Email } from '../value-objects/email.vo';
import { FullName } from '../value-objects/full-name.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface CustomerPrimitives {
  id: string;
  tenantId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  preferences: Record<string, unknown>;
  consentSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerProps {
  id?: CustomerId | string;
  tenantId: TenantId | string;
  userId: UserId | string;
  firstName: string;
  lastName: string;
  email: Email | string;
  phone: string;
  timezone: string;
  preferences?: Record<string, unknown>;
  consentSigned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteCustomerProps {
  id: CustomerId | string;
  tenantId: TenantId | string;
  userId: UserId | string;
  firstName: string;
  lastName: string;
  email: Email | string;
  phone: string;
  timezone: string;
  preferences?: Record<string, unknown>;
  consentSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Customer {
  private constructor(
    private _id: CustomerId,
    private _tenantId: TenantId,
    private _userId: UserId,
    private _firstName: string,
    private _lastName: string,
    private _email: Email,
    private _phone: string,
    private _timezone: string,
    private _preferences: Record<string, unknown>,
    private _consentSigned: boolean,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreateCustomerProps): Customer {
    return new Customer(
      Customer.toCustomerId(props.id),
      Customer.toTenantId(props.tenantId),
      Customer.toUserId(props.userId),
      Customer.normalizeText(props.firstName),
      Customer.normalizeText(props.lastName),
      Customer.toEmail(props.email),
      Customer.normalizeText(props.phone),
      Customer.normalizeText(props.timezone),
      props.preferences ?? {},
      props.consentSigned,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  static reconstitute(props: ReconstituteCustomerProps): Customer {
    return new Customer(
      Customer.toCustomerId(props.id),
      Customer.toTenantId(props.tenantId),
      Customer.toUserId(props.userId),
      Customer.normalizeText(props.firstName),
      Customer.normalizeText(props.lastName),
      Customer.toEmail(props.email),
      Customer.normalizeText(props.phone),
      Customer.normalizeText(props.timezone),
      props.preferences ?? {},
      props.consentSigned,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): CustomerId {
    return this._id;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get userId(): UserId {
    return this._userId;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get email(): Email {
    return this._email;
  }

  get phone(): string {
    return this._phone;
  }

  get timezone(): string {
    return this._timezone;
  }

  get preferences(): Record<string, unknown> {
    return { ...this._preferences };
  }

  get consentSigned(): boolean {
    return this._consentSigned;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  updateProfile(props: {
    firstName?: string;
    lastName?: string;
    email?: Email | string;
    phone?: string;
    timezone?: string;
    preferences?: Record<string, unknown>;
    consentSigned?: boolean;
  }): void {
    if (props.firstName) {
      this._firstName = Customer.normalizeText(props.firstName);
    }

    if (props.lastName) {
      this._lastName = Customer.normalizeText(props.lastName);
    }

    if (props.email) {
      this._email = Customer.toEmail(props.email);
    }

    if (props.phone) {
      this._phone = Customer.normalizeText(props.phone);
    }

    if (props.timezone) {
      this._timezone = Customer.normalizeText(props.timezone);
    }

    if (props.preferences) {
      this._preferences = { ...props.preferences };
    }

    if (typeof props.consentSigned === 'boolean') {
      this._consentSigned = props.consentSigned;
    }

    this.touch();
  }

  touch(date: Date = new Date()): void {
    this._updatedAt = date;
  }

  toPrimitives(): CustomerPrimitives {
    return {
      id: this._id.value,
      tenantId: this._tenantId.value,
      userId: this._userId.value,
      firstName: this._firstName,
      lastName: this._lastName,
      email: this._email.value,
      phone: this._phone,
      timezone: this._timezone,
      preferences: { ...this._preferences },
      consentSigned: this._consentSigned,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }

  private static toCustomerId(value: CustomerId | string | undefined): CustomerId {
    if (!value) {
      throw new Error('Customer id is required');
    }

    return value instanceof CustomerId ? value : CustomerId.create(value);
  }

  private static toTenantId(value: TenantId | string): TenantId {
    return value instanceof TenantId ? value : TenantId.create(value);
  }

  private static toUserId(value: UserId | string): UserId {
    return value instanceof UserId ? value : UserId.create(value);
  }

  private static toEmail(value: Email | string): Email {
    return value instanceof Email ? value : Email.create(value);
  }

  private static normalizeText(value: string): string {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (normalizedValue.length < 1 || normalizedValue.length > 255) {
      throw new Error('Customer field is invalid');
    }

    return normalizedValue;
  }
}
