import { EntitySchema } from 'typeorm';

export interface TypeOrmBookingRescheduleProps {
  id: string;
  bookingId: string;
  originalStartsAt: Date;
  originalEndsAt: Date;
  newStartsAt: Date;
  newEndsAt: Date;
  reason?: string;
  rescheduledByUserId: string;
  createdAt: Date;
}

export class TypeOrmBookingRescheduleEntity implements TypeOrmBookingRescheduleProps {
  id!: string;
  bookingId!: string;
  originalStartsAt!: Date;
  originalEndsAt!: Date;
  newStartsAt!: Date;
  newEndsAt!: Date;
  reason?: string;
  rescheduledByUserId!: string;
  createdAt!: Date;
}

export const TypeOrmBookingRescheduleEntitySchema = new EntitySchema<TypeOrmBookingRescheduleEntity>({
  target: TypeOrmBookingRescheduleEntity,
  name: 'BookingReschedule',
  tableName: 'booking_reschedules',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
      name: 'id',
      default: () => 'gen_random_uuid()',
    },
    bookingId: {
      type: 'uuid',
      name: 'booking_id',
    },
    originalStartsAt: {
      type: 'timestamptz',
      name: 'original_starts_at',
    },
    originalEndsAt: {
      type: 'timestamptz',
      name: 'original_ends_at',
    },
    newStartsAt: {
      type: 'timestamptz',
      name: 'new_starts_at',
    },
    newEndsAt: {
      type: 'timestamptz',
      name: 'new_ends_at',
    },
    reason: {
      type: 'text',
      nullable: true,
      name: 'reason',
    },
    rescheduledByUserId: {
      type: 'uuid',
      name: 'rescheduled_by_user_id',
    },
    createdAt: {
      type: 'timestamptz',
      createDate: true,
      name: 'created_at',
      default: () => 'NOW()',
    },
  },
  indices: [
    {
      name: 'idx_booking_reschedule_booking_id',
      columns: ['bookingId'],
    },
  ],
});
