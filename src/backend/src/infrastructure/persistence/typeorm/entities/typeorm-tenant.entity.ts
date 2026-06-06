import { EntitySchema } from 'typeorm';

export interface TypeOrmTenantProps {
  id: string;
  zoneId: string;
  countryCode: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL_EXPIRED';
  subdomain: string;
  name: string;
  globalSettings: Record<string, unknown>;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TypeOrmTenantEntity implements TypeOrmTenantProps {
  id!: string;
  zoneId!: string;
  countryCode!: string;
  status!: 'ACTIVE' | 'SUSPENDED' | 'TRIAL_EXPIRED';
  subdomain!: string;
  name!: string;
  globalSettings!: Record<string, unknown>;
  ownerUserId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export const TypeOrmTenantEntitySchema = new EntitySchema<TypeOrmTenantEntity>({
  target: TypeOrmTenantEntity,
  name: 'Tenant',
  tableName: 'tenants',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid', name: 'id', default: () => 'gen_random_uuid()' },
    zoneId: { type: 'uuid', name: 'zone_id', nullable: true },
    countryCode: { type: 'varchar', length: 2, name: 'country_code' },
    status: { type: 'varchar', length: 20, name: 'status', default: 'ACTIVE' },
    subdomain: { type: 'varchar', length: 100, unique: true, name: 'subdomain' },
    name: { type: 'varchar', length: 255, name: 'name' },
    globalSettings: { type: 'jsonb', name: 'global_settings', default: () => "'{}'::jsonb" },
    ownerUserId: { type: 'uuid', unique: true, name: 'owner_user_id' },
    createdAt: { type: 'timestamptz', createDate: true, name: 'created_at', default: () => 'NOW()' },
    updatedAt: { type: 'timestamptz', updateDate: true, name: 'updated_at', default: () => 'NOW()' },
  },
});
