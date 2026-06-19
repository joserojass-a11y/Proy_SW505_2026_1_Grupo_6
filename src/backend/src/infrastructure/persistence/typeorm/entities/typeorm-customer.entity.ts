import { EntitySchema } from 'typeorm';

export interface TypeOrmCustomerProps {
  id: string;
  tenantId: string;
  zoneId: string;
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

export class TypeOrmCustomerEntity implements TypeOrmCustomerProps {
  id!: string;
  tenantId!: string;
  zoneId!: string;
  userId!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone!: string;
  timezone!: string;
  preferences!: Record<string, unknown>;
  consentSigned!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export const TypeOrmCustomerEntitySchema = new EntitySchema<TypeOrmCustomerEntity>({
  target: TypeOrmCustomerEntity,
  name: 'Customer',
  tableName: 'customers',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
      name: 'id',
      default: () => 'gen_random_uuid()',
    },
    tenantId: {
      type: 'uuid',
      name: 'tenant_id',
    },
    zoneId: {
      type: 'uuid',
      name: 'zone_id',
      nullable: true,
    },
    userId: {
      type: 'uuid',
      unique: true,
      name: 'user_id',
    },
    firstName: {
      type: 'varchar',
      length: 100,
      name: 'first_name',
    },
    lastName: {
      type: 'varchar',
      length: 100,
      name: 'last_name',
    },
    email: {
      type: 'varchar',
      length: 255,
      name: 'email',
    },
    phone: {
      type: 'varchar',
      length: 50,
      name: 'phone',
    },
    timezone: {
      type: 'varchar',
      length: 100,
      name: 'timezone',
    },
    preferences: {
      type: 'jsonb',
      name: 'preferences',
      default: () => "'{}'::jsonb",
    },
    consentSigned: {
      type: 'boolean',
      name: 'consent_signed',
      default: false,
    },
    createdAt: {
      type: 'timestamptz',
      createDate: true,
      name: 'created_at',
      default: () => 'NOW()',
    },
    updatedAt: {
      type: 'timestamptz',
      updateDate: true,
      name: 'updated_at',
      default: () => 'NOW()',
    },
  },
});
