import { EntitySchema } from 'typeorm';

export interface TypeOrmBookingCancellationProps {
  id: string;
  bookingId: string;
  reasonCode: string;
  description?: string;
  cancelledByUserId: string;
  cancelledAt: Date;
}

export class TypeOrmBookingCancellationEntity implements TypeOrmBookingCancellationProps {
  id!: string;
  bookingId!: string;
  reasonCode!: string;
  description?: string;
  cancelledByUserId!: string;
  cancelledAt!: Date;
}

export const TypeOrmBookingCancellationEntitySchema = new EntitySchema<TypeOrmBookingCancellationEntity>({
  target: TypeOrmBookingCancellationEntity,
  name: 'BookingCancellation',
  tableName: 'booking_cancellations',
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
    reasonCode: {
      type: 'varchar',
      length: 50,
      name: 'reason_code',
    },
    description: {
      type: 'text',
      nullable: true,
      name: 'description',
    },
    cancelledByUserId: {
      type: 'uuid',
      name: 'cancelled_by_user_id',
    },
    cancelledAt: {
      type: 'timestamptz',
      createDate: true,
      name: 'cancelled_at',
      default: () => 'NOW()',
    },
  },
  indices: [
    {
      name: 'idx_booking_cancellation_booking_id',
      columns: ['bookingId'],
    },
  ],
});
