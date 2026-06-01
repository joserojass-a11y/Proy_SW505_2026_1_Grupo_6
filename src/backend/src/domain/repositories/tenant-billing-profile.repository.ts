import { TenantBillingProfile } from '../entities/tenant-billing-profile.entity';
import { TenantId } from '../value-objects/tenant-id.vo';

export interface TenantBillingProfileRepository {
  findByTenantId(tenantId: TenantId): Promise<TenantBillingProfile | null>;
  save(profile: TenantBillingProfile): Promise<TenantBillingProfile>;
  update(profile: TenantBillingProfile): Promise<TenantBillingProfile>;
}
