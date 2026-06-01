import { Tenant } from '../entities/tenant.entity';
import { TenantId } from '../value-objects/tenant-id.vo';

export interface TenantRepository {
  findById(id: TenantId): Promise<Tenant | null>;
  findBySubdomain(subdomain: string): Promise<Tenant | null>;
  findByOwnerUserId(ownerUserId: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<Tenant>;
  update(tenant: Tenant): Promise<Tenant>;
}
