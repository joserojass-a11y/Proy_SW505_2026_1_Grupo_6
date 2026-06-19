import { EntitySchema } from 'typeorm';

export interface TypeOrmScheduleSlotProps {
  id: string;
  resourceId: string;
  startsAt: Date;
  endsAt: Date;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  bookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TypeOrmScheduleSlotEntity implements TypeOrmScheduleSlotProps {
  id!: string;
  resourceId!: string;
  startsAt!: Date;
  endsAt!: Date;
  status!: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  bookingId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export const TypeOrmScheduleSlotEntitySchema = new EntitySchema<TypeOrmScheduleSlotEntity>({
  target: TypeOrmScheduleSlotEntity,
  name: 'ScheduleSlot',
  tableName: 'schedule_slots',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid', name: 'id', default: () => 'gen_random_uuid()' },
    resourceId: { type: 'uuid', name: 'resource_id' },
    startsAt: { type: 'timestamptz', name: 'starts_at' },
    endsAt: { type: 'timestamptz', name: 'ends_at' },
    status: { type: 'varchar', length: 20, name: 'status', default: 'AVAILABLE' },
    bookingId: { type: 'uuid', nullable: true, name: 'booking_id' },
    createdAt: { type: 'timestamptz', createDate: true, name: 'created_at', default: () => 'NOW()' },
    updatedAt: { type: 'timestamptz', updateDate: true, name: 'updated_at', default: () => 'NOW()' },
  },
  indices: [
    {
      name: 'idx_schedule_slot_resource_time',
      columns: ['resourceId', 'startsAt', 'endsAt'],
      unique: true,
    }
  ]
});
