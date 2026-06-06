import { EntitySchema } from 'typeorm';

export interface TypeOrmBookingProps {
  id: string;
  tenantId: string;
  serviceId: string;
  resourceId: string;
  customerId: string;
  startsAt: Date;
  endsAt: Date;
  customerTimezone: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED' | 'NO_SHOW';
  sourceChannel: string;
  notes?: string;
  customData?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TypeOrmBookingEntity implements TypeOrmBookingProps {
  id!: string;
  tenantId!: string;
  branchId!: string;
  serviceId!: string;
  resourceId!: string;
  customerId!: string;
  startsAt!: Date;
  endsAt!: Date;
  customerTimezone!: string;
  status!: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED' | 'NO_SHOW';
  sourceChannel!: string;
  notes?: string;
  customData?: Record<string, unknown>;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export const TypeOrmBookingEntitySchema = new EntitySchema<TypeOrmBookingEntity>({
  target: TypeOrmBookingEntity,
  name: 'Booking',
  tableName: 'bookings',
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
    branchId: {
      type: 'uuid',
      name: 'branch_id',
    },
    serviceId: {
      type: 'uuid',
      name: 'service_id',
    },
    resourceId: {
      type: 'uuid',
      name: 'resource_id',
    },
    customerId: {
      type: 'uuid',
      name: 'customer_id',
    },
    startsAt: {
      type: 'timestamptz',
      name: 'starts_at',
    },
    endsAt: {
      type: 'timestamptz',
      name: 'ends_at',
    },
    customerTimezone: {
      type: 'varchar',
      length: 100,
      name: 'customer_timezone',
    },
    status: {
      type: 'varchar',
      length: 20,
      default: 'PENDING',
      name: 'status',
    },
    sourceChannel: {
      type: 'varchar',
      length: 50,
      name: 'source_channel',
    },
    notes: {
      type: 'text',
      nullable: true,
      name: 'notes',
    },
    customData: {
      type: 'jsonb',
      nullable: true,
      name: 'custom_data',
    },
    createdBy: {
      type: 'uuid',
      name: 'created_by',
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
  indices: [
    {
      name: 'idx_booking_service_id',
      columns: ['serviceId'],
    },
    {
      name: 'idx_booking_customer_id',
      columns: ['customerId'],
    },
    {
      name: 'idx_booking_tenant_id',
      columns: ['tenantId'],
    },
    {
      name: 'idx_booking_status',
      columns: ['status'],
    },
    {
      name: 'idx_booking_starts_at_ends_at',
      columns: ['startsAt', 'endsAt'],
    },
    {
      name: 'idx_booking_resource_id',
      columns: ['resourceId'],
    },
    {
      name: 'idx_booking_resource_starts_ends',
      columns: ['resourceId', 'startsAt', 'endsAt'],
    },
  ],
});
