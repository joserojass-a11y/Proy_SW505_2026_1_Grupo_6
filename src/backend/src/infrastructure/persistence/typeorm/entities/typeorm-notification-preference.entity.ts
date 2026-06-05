import { EntitySchema } from 'typeorm';

/**
 * Props para TypeORM: NotificationPreference (Persistencia)
 * Mapeo directo de columnas BD
 */
export interface TypeOrmNotificationPreferenceProps {
  id: string;
  customerId: string;
  topicId: string;
  channelId: string;
  isEnabled: boolean;
  frequency: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Clase TypeORM Entity para NotificationPreference
 * Utiliza EntitySchema para desacoplamiento de decoradores
 */
export class TypeOrmNotificationPreferenceEntity
  implements TypeOrmNotificationPreferenceProps
{
  id!: string;
  customerId!: string;
  topicId!: string;
  channelId!: string;
  isEnabled!: boolean;
  frequency!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * EntitySchema de TypeORM para NotificationPreference
 * Mapea la entidad del dominio a la tabla customer_notification_preferences
 */
export const TypeOrmNotificationPreferenceEntitySchema =
  new EntitySchema<TypeOrmNotificationPreferenceEntity>({
    target: TypeOrmNotificationPreferenceEntity,
    name: 'NotificationPreference',
    tableName: 'customer_notification_preferences',
    columns: {
      id: {
        type: 'uuid',
        primary: true,
        generated: 'uuid',
        name: 'id',
        default: () => 'gen_random_uuid()',
      },
      customerId: {
        type: 'uuid',
        name: 'customer_id',
        nullable: false,
      },
      topicId: {
        type: 'uuid',
        name: 'topic_id',
        nullable: false,
      },
      channelId: {
        type: 'uuid',
        name: 'channel_id',
        nullable: false,
      },
      isEnabled: {
        type: 'boolean',
        name: 'is_enabled',
        default: true,
        nullable: false,
      },
      frequency: {
        type: 'varchar',
        length: 50,
        name: 'frequency',
        default: 'immediately',
        nullable: false,
      },
      createdAt: {
        type: 'timestamptz',
        createDate: true,
        name: 'created_at',
        default: () => 'NOW()',
        nullable: false,
      },
      updatedAt: {
        type: 'timestamptz',
        updateDate: true,
        name: 'updated_at',
        default: () => 'NOW()',
        nullable: false,
      },
    },
    indices: [
      {
        name: 'UQ_customer_notification_preferences',
        columns: ['customer_id', 'topic_id', 'channel_id'],
        unique: true,
      },
    ],
  });
