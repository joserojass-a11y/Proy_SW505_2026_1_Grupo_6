import { TenantId } from '../value-objects/tenant-id.vo';
import { ResourceId } from '../value-objects/resource-id.vo';
import { BranchId } from '../value-objects/branch-id.vo';
import { ResourceTypeId } from '../value-objects/resource-type-id.vo';

export interface ResourcePrimitives {
  id: string;
  tenantId: string;
  branchId: string;
  typeId: string;
  name: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceProps {
  id?: ResourceId | string;
  tenantId: TenantId | string;
  branchId: BranchId | string;
  typeId: ResourceTypeId | string;
  name: string;
  capacity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteResourceProps {
  id: ResourceId | string;
  tenantId: TenantId | string;
  branchId: BranchId | string;
  typeId: ResourceTypeId | string;
  name: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Resource {
  private constructor(
    private _id: ResourceId,
    private _tenantId: TenantId,
    private _branchId: BranchId,
    private _typeId: ResourceTypeId,
    private _name: string,
    private _capacity: number,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(props: CreateResourceProps): Resource {
    const capacity = props.capacity ?? 1;
    if (capacity < 1) {
      throw new Error('Resource capacity must be at least 1');
    }

    return new Resource(
      Resource.toResourceId(props.id),
      Resource.toTenantId(props.tenantId),
      Resource.toBranchId(props.branchId),
      Resource.toResourceTypeId(props.typeId),
      Resource.normalizeText(props.name),
      capacity,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  static reconstitute(props: ReconstituteResourceProps): Resource {
    return new Resource(
      Resource.toResourceId(props.id),
      Resource.toTenantId(props.tenantId),
      Resource.toBranchId(props.branchId),
      Resource.toResourceTypeId(props.typeId),
      Resource.normalizeText(props.name),
      props.capacity,
      props.createdAt,
      props.updatedAt
    );
  }

  get id(): ResourceId {
    return this._id;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get branchId(): BranchId {
    return this._branchId;
  }

  get typeId(): ResourceTypeId {
    return this._typeId;
  }

  get name(): string {
    return this._name;
  }

  get capacity(): number {
    return this._capacity;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  updateInfo(props: {
    branchId?: BranchId | string;
    typeId?: ResourceTypeId | string;
    name?: string;
    capacity?: number;
  }): void {
    if (props.branchId) {
      this._branchId = Resource.toBranchId(props.branchId);
    }
    if (props.typeId) {
      this._typeId = Resource.toResourceTypeId(props.typeId);
    }
    if (props.name !== undefined) {
      this._name = Resource.normalizeText(props.name);
    }
    if (props.capacity !== undefined) {
      if (props.capacity < 1) {
        throw new Error('Resource capacity must be at least 1');
      }
      this._capacity = props.capacity;
    }
    this.touch();
  }

  touch(date: Date = new Date()): void {
    this._updatedAt = date;
  }

  toPrimitives(): ResourcePrimitives {
    return {
      id: this._id.value,
      tenantId: this._tenantId.value,
      branchId: this._branchId.value,
      typeId: this._typeId.value,
      name: this._name,
      capacity: this._capacity,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt)
    };
  }

  private static toResourceId(value: ResourceId | string | undefined): ResourceId {
    if (!value) {
      throw new Error('Resource id is required');
    }
    return value instanceof ResourceId ? value : ResourceId.create(value);
  }

  private static toTenantId(value: TenantId | string): TenantId {
    return value instanceof TenantId ? value : TenantId.create(value);
  }

  private static toBranchId(value: BranchId | string): BranchId {
    return value instanceof BranchId ? value : BranchId.create(value);
  }

  private static toResourceTypeId(value: ResourceTypeId | string): ResourceTypeId {
    return value instanceof ResourceTypeId ? value : ResourceTypeId.create(value);
  }

  private static normalizeText(value: string): string {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');
    if (normalizedValue.length < 1 || normalizedValue.length > 255) {
      throw new Error('Resource name is invalid');
    }
    return normalizedValue;
  }
}
