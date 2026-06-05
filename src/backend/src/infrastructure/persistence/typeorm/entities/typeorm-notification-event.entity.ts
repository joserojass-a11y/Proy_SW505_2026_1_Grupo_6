import { EntitySchema } from 'typeorm';

/**
 * Props para TypeORM: NotificationEvent (Persistencia)
 * Mapeo directo de columnas BD
 */
export interface TypeOrmNotificationEventProps {
  id: string;
  tenantId: string;
  bookingId: string | null;
  templateId: string;
  channelCode: string;
  recipientType: 'customer' | 'user';
  recipientId: string;
  contactPoint: string;
  subject: string | null;
  renderedContent: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  scheduledFor: Date;
  sentAt: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Clase TypeORM Entity para NotificationEvent
 * Utiliza EntitySchema para desacoplamiento de decoradores
 */
export class TypeOrmNotificationEventEntity
  implements TypeOrmNotificationEventProps
{
  id!: string;
  tenantId!: string;
  bookingId!: string | null;
  templateId!: string;
  channelCode!: string;
  recipientType!: 'customer' | 'user';
  recipientId!: string;
  contactPoint!: string;
  subject!: string | null;
  renderedContent!: string;
  status!: 'pending' | 'sent' | 'failed';
  retryCount!: number;
  maxRetries!: number;
  lastError!: string | null;
  scheduledFor!: Date;
  sentAt!: Date | null;
  metadata!: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * EntitySchema de TypeORM para NotificationEvent
 * Mapea la entidad del dominio a la tabla notification_events
 */
export const TypeOrmNotificationEventEntitySchema =
  new EntitySchema<TypeOrmNotificationEventEntity>({
    target: TypeOrmNotificationEventEntity,
    name: 'NotificationEvent',
    tableName: 'notification_events',
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
        nullable: false,
      },
      bookingId: {
        type: 'uuid',
        name: 'booking_id',
        nullable: true,
      },
      templateId: {
        type: 'uuid',
        name: 'template_id',
        nullable: false,
      },
      channelCode: {
        type: 'varchar',
        length: 50,
        name: 'channel_code',
        nullable: false,
      },
      recipientType: {
        type: 'varchar',
        length: 20,
        name: 'recipient_type',
        nullable: false,
      },
      recipientId: {
        type: 'uuid',
        name: 'recipient_id',
        nullable: false,
      },
      contactPoint: {
        type: 'varchar',
        length: 255,
        name: 'contact_point',
        nullable: false,
      },
      subject: {
        type: 'varchar',
        length: 255,
        name: 'subject',
        nullable: true,
      },
      renderedContent: {
        type: 'text',
        name: 'rendered_content',
        nullable: false,
      },
      status: {
        type: 'varchar',
        length: 20,
        name: 'status',
        default: 'pending',
        nullable: false,
      },
      retryCount: {
        type: 'integer',
        name: 'retry_count',
        default: 0,
        nullable: false,
      },
      maxRetries: {
        type: 'integer',
        name: 'max_retries',
        default: 3,
        nullable: false,
      },
      lastError: {
        type: 'text',
        name: 'last_error',
        nullable: true,
      },
      scheduledFor: {
        type: 'timestamptz',
        name: 'scheduled_for',
        nullable: false,
      },
      sentAt: {
        type: 'timestamptz',
        name: 'sent_at',
        nullable: true,
      },
      metadata: {
        type: 'jsonb',
        name: 'metadata',
        default: '{}',
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
    relations: {
      // Relaciones opcionales para cargas posteriores (eager: false)
      // tenant: { target: 'Tenant', joinColumn: { name: 'tenant_id' } },
      // template: { target: 'NotificationTemplate', joinColumn: { name: 'template_id' } },
    },
  });
