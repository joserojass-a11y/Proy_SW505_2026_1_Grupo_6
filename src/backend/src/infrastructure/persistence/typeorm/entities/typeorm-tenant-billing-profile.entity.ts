import { EntitySchema } from 'typeorm';

export interface TypeOrmTenantBillingProfileProps {
  tenantId: string;
  planTier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  maxBranches: number;
  maxResources: number;
}

export class TypeOrmTenantBillingProfileEntity implements TypeOrmTenantBillingProfileProps {
  tenantId!: string;
  planTier!: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  maxBranches!: number;
  maxResources!: number;
}

export const TypeOrmTenantBillingProfileEntitySchema = new EntitySchema<TypeOrmTenantBillingProfileEntity>({
  target: TypeOrmTenantBillingProfileEntity,
  name: 'TenantBillingProfile',
  tableName: 'tenant_billing_profiles',
  columns: {
    tenantId: { type: 'uuid', primary: true, name: 'tenant_id' },
    planTier: { type: 'varchar', length: 20, name: 'plan_tier', default: 'BASIC' },
    maxBranches: { type: 'integer', name: 'max_branches', default: 1 },
    maxResources: { type: 'integer', name: 'max_resources', default: 10 },
  },
});
