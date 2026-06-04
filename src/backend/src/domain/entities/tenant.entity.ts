import { TenantId } from '../value-objects/tenant-id.vo';
import { UserId } from '../value-objects/user-id.vo';

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL_EXPIRED';

export interface TenantPrimitives {
  id: string;
  countryCode: string;
  status: TenantStatus;
  subdomain: string;
  name: string;
  globalSettings: Record<string, unknown>;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantProps {
  id?: TenantId | string;
  countryCode: string;
  status?: TenantStatus;
  subdomain: string;
  name: string;
  globalSettings?: Record<string, unknown>;
  ownerUserId: UserId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteTenantProps {
  id: TenantId | string;
  countryCode: string;
  status: TenantStatus;
  subdomain: string;
  name: string;
  globalSettings?: Record<string, unknown>;
  ownerUserId: UserId | string;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant {
  private constructor(
    private _id: TenantId,
    private _countryCode: string,
    private _status: TenantStatus,
    private _subdomain: string,
    private _name: string,
    private _globalSettings: Record<string, unknown>,
    private _ownerUserId: UserId,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreateTenantProps): Tenant {
    return new Tenant(
      Tenant.toTenantId(props.id),
      Tenant.normalizeCountryCode(props.countryCode),
      props.status ?? 'ACTIVE',
      Tenant.normalizeSubdomain(props.subdomain),
      Tenant.normalizeName(props.name),
      props.globalSettings ?? {},
      Tenant.toUserId(props.ownerUserId),
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  static reconstitute(props: ReconstituteTenantProps): Tenant {
    return new Tenant(
      Tenant.toTenantId(props.id),
      Tenant.normalizeCountryCode(props.countryCode),
      props.status,
      Tenant.normalizeSubdomain(props.subdomain),
      Tenant.normalizeName(props.name),
      props.globalSettings ?? {},
      Tenant.toUserId(props.ownerUserId),
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): TenantId { return this._id; }
  get countryCode(): string { return this._countryCode; }
  get status(): TenantStatus { return this._status; }
  get subdomain(): string { return this._subdomain; }
  get name(): string { return this._name; }
  get globalSettings(): Record<string, unknown> { return { ...this._globalSettings }; }
  get ownerUserId(): UserId { return this._ownerUserId; }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }

  suspend(): void { this._status = 'SUSPENDED'; this.touch(); }
  activate(): void { this._status = 'ACTIVE'; this.touch(); }
  markTrialExpired(): void { this._status = 'TRIAL_EXPIRED'; this.touch(); }

  touch(date: Date = new Date()): void { this._updatedAt = date; }

  toPrimitives(): TenantPrimitives {
    return {
      id: this._id.value,
      countryCode: this._countryCode,
      status: this._status,
      subdomain: this._subdomain,
      name: this._name,
      globalSettings: { ...this._globalSettings },
      ownerUserId: this._ownerUserId.value,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }

  private static toTenantId(value: TenantId | string | undefined): TenantId {
    if (!value) throw new Error('Tenant id is required');
    return value instanceof TenantId ? value : TenantId.create(value);
  }

  private static toUserId(value: UserId | string): UserId {
    return value instanceof UserId ? value : UserId.create(value);
  }

  private static normalizeCountryCode(value: string): string {
    const normalizedValue = value.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalizedValue)) throw new Error('Invalid country code');
    return normalizedValue;
  }

  private static normalizeSubdomain(value: string): string {
    const normalizedValue = value.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedValue)) throw new Error('Invalid subdomain');
    return normalizedValue;
  }

  private static normalizeName(value: string): string {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');
    if (normalizedValue.length < 2 || normalizedValue.length > 255) throw new Error('Tenant name is invalid');
    return normalizedValue;
  }
}
