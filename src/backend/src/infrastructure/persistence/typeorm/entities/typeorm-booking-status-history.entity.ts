import { EntitySchema } from 'typeorm';

export interface TypeOrmBookingStatusHistoryProps {
  id: string;
  bookingId: string;
  previousStatus: string;
  newStatus: string;
  reason?: string;
  changedByUserId: string;
  changedAt: Date;
}

export class TypeOrmBookingStatusHistoryEntity implements TypeOrmBookingStatusHistoryProps {
  id!: string;
  bookingId!: string;
  previousStatus!: string;
  newStatus!: string;
  reason?: string;
  changedByUserId!: string;
  changedAt!: Date;
}

export const TypeOrmBookingStatusHistoryEntitySchema = new EntitySchema<TypeOrmBookingStatusHistoryEntity>({
  target: TypeOrmBookingStatusHistoryEntity,
  name: 'BookingStatusHistory',
  tableName: 'booking_status_history',
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
    previousStatus: {
      type: 'varchar',
      length: 20,
      name: 'previous_status',
    },
    newStatus: {
      type: 'varchar',
      length: 20,
      name: 'new_status',
    },
    reason: {
      type: 'text',
      nullable: true,
      name: 'reason',
    },
    changedByUserId: {
      type: 'uuid',
      name: 'changed_by_user_id',
    },
    changedAt: {
      type: 'timestamptz',
      createDate: true,
      name: 'changed_at',
      default: () => 'NOW()',
    },
  },
  indices: [
    {
      name: 'idx_booking_status_history_booking_id',
      columns: ['bookingId'],
    },
  ],
});
