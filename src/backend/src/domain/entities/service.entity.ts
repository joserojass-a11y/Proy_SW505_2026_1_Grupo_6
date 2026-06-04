import { TenantId } from '../value-objects/tenant-id.vo';
import { ServiceId } from '../value-objects/service-id.vo';
import { CategoryId } from '../value-objects/category-id.vo';

export interface ServicePrimitives {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  baseDurationMinutes: number;
  basePrice: number;
  customAttributes: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceProps {
  id?: ServiceId | string;
  tenantId: TenantId | string;
  categoryId: CategoryId | string;
  name: string;
  baseDurationMinutes: number;
  basePrice: number;
  customAttributes?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteServiceProps {
  id: ServiceId | string;
  tenantId: TenantId | string;
  categoryId: CategoryId | string;
  name: string;
  baseDurationMinutes: number;
  basePrice: number;
  customAttributes?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Service {
  private constructor(
    private _id: ServiceId,
    private _tenantId: TenantId,
    private _categoryId: CategoryId,
    private _name: string,
    private _baseDurationMinutes: number,
    private _basePrice: number,
    private _customAttributes: Record<string, unknown>,
    private _isActive: boolean,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(props: CreateServiceProps): Service {
    const baseDuration = props.baseDurationMinutes;
    if (baseDuration <= 0) {
      throw new Error('Service base duration must be greater than 0');
    }

    const basePrice = props.basePrice;
    if (basePrice < 0) {
      throw new Error('Service base price cannot be negative');
    }

    return new Service(
      Service.toServiceId(props.id),
      Service.toTenantId(props.tenantId),
      Service.toCategoryId(props.categoryId),
      Service.normalizeText(props.name),
      baseDuration,
      basePrice,
      props.customAttributes ?? {},
      props.isActive ?? true,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  static reconstitute(props: ReconstituteServiceProps): Service {
    return new Service(
      Service.toServiceId(props.id),
      Service.toTenantId(props.tenantId),
      Service.toCategoryId(props.categoryId),
      Service.normalizeText(props.name),
      props.baseDurationMinutes,
      props.basePrice,
      props.customAttributes ?? {},
      props.isActive,
      props.createdAt,
      props.updatedAt
    );
  }

  get id(): ServiceId {
    return this._id;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get categoryId(): CategoryId {
    return this._categoryId;
  }

  get name(): string {
    return this._name;
  }

  get baseDurationMinutes(): number {
    return this._baseDurationMinutes;
  }

  get basePrice(): number {
    return this._basePrice;
  }

  get customAttributes(): Record<string, unknown> {
    return { ...this._customAttributes };
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  updateProfile(props: {
    categoryId?: CategoryId | string;
    name?: string;
    baseDurationMinutes?: number;
    basePrice?: number;
    customAttributes?: Record<string, unknown>;
  }): void {
    if (props.categoryId) {
      this._categoryId = Service.toCategoryId(props.categoryId);
    }
    if (props.name !== undefined) {
      this._name = Service.normalizeText(props.name);
    }
    if (props.baseDurationMinutes !== undefined) {
      if (props.baseDurationMinutes <= 0) {
        throw new Error('Service base duration must be greater than 0');
      }
      this._baseDurationMinutes = props.baseDurationMinutes;
    }
    if (props.basePrice !== undefined) {
      if (props.basePrice < 0) {
        throw new Error('Service base price cannot be negative');
      }
      this._basePrice = props.basePrice;
    }
    if (props.customAttributes) {
      this._customAttributes = { ...props.customAttributes };
    }
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  touch(date: Date = new Date()): void {
    this._updatedAt = date;
  }

  toPrimitives(): ServicePrimitives {
    return {
      id: this._id.value,
      tenantId: this._tenantId.value,
      categoryId: this._categoryId.value,
      name: this._name,
      baseDurationMinutes: this._baseDurationMinutes,
      basePrice: this._basePrice,
      customAttributes: { ...this._customAttributes },
      isActive: this._isActive,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt)
    };
  }

  private static toServiceId(value: ServiceId | string | undefined): ServiceId {
    if (!value) {
      throw new Error('Service id is required');
    }
    return value instanceof ServiceId ? value : ServiceId.create(value);
  }

  private static toTenantId(value: TenantId | string): TenantId {
    return value instanceof TenantId ? value : TenantId.create(value);
  }

  private static toCategoryId(value: CategoryId | string): CategoryId {
    return value instanceof CategoryId ? value : CategoryId.create(value);
  }

  private static normalizeText(value: string): string {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');
    if (normalizedValue.length < 1 || normalizedValue.length > 255) {
      throw new Error('Service name is invalid');
    }
    return normalizedValue;
  }
}
