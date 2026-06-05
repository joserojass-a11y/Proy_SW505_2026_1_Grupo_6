import { DataSource, LessThanOrEqual } from 'typeorm';
import { NotificationEventRepository } from '../../../domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../../domain/entities/notification-event.entity';
import { NotificationChannelCode } from '../../../domain/value-objects/notification-channel-code.vo';
import { TypeOrmNotificationEventEntity } from './entities/typeorm-notification-event.entity';

/**
 * Implementación: NotificationEventRepository con TypeORM
 *
 * Responsabilidades:
 * - Persistir y recuperar eventos de notificación desde BD
 * - Mapear entre entidades de dominio y esquemas de TypeORM
 * - Optimizar queries para procesamiento de cola asíncrona
 */
export class TypeOrmNotificationEventRepository
  implements NotificationEventRepository
{
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmNotificationEventEntity);
  }

  /**
   * Guardar un nuevo evento de notificación
   */
  async save(event: NotificationEvent): Promise<void> {
    const persisted = this.toPersistence(event);
    await this.repository.insert(persisted);
  }

  /**
   * Actualizar un evento existente
   */
  async update(event: NotificationEvent): Promise<void> {
    const persisted = this.toPersistence(event);
    await this.repository.update({ id: event.id.value }, persisted);
  }

  /**
   * Obtener un evento por ID
   */
  async findById(id: string): Promise<NotificationEvent | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Obtener todos los eventos pendientes ordenados por fecha de envío
   * Utilizado por el worker asíncrono para procesar la cola
   */
  async findPendingEvents(): Promise<NotificationEvent[]> {
    const entities = await this.repository.find({
      where: {
        status: 'pending',
        scheduledFor: LessThanOrEqual(new Date()),
      },
      order: {
        scheduledFor: 'ASC',
        createdAt: 'ASC',
      },
      take: 100, // Limit para evitar carga masiva
    });
    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Obtener eventos pendientes para un canal específico
   * Útil para procesadores dedicados por canal (email, SMS, etc.)
   */
  async findPendingEventsByChannel(
    channelCode: NotificationChannelCode
  ): Promise<NotificationEvent[]> {
    const entities = await this.repository.find({
      where: {
        status: 'pending',
        channelCode: channelCode.value,
        scheduledFor: LessThanOrEqual(new Date()),
      },
      order: {
        scheduledFor: 'ASC',
      },
      take: 50,
    });
    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Obtener el historial de eventos para un booking
   * Para auditoría y debugging
   */
  async findByBookingId(bookingId: string): Promise<NotificationEvent[]> {
    const entities = await this.repository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Obtener el historial de eventos para un destinatario
   * Para mostrar al usuario su historial de notificaciones
   */
  async findByRecipientId(recipientId: string): Promise<NotificationEvent[]> {
    const entities = await this.repository.find({
      where: { recipientId },
      order: { createdAt: 'DESC' },
      take: 100, // Límite razonable para historial
    });
    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Eliminar un evento (limpieza de datos antiguos)
   * Típicamente usado en procesos de mantenimiento/purga
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  /**
   * Obtener conteo de eventos por status (métricas)
   * Para monitoreo y dashboards
   */
  async countByStatus(
    status: 'pending' | 'sent' | 'failed'
  ): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  /**
   * Mapper: TypeORM Entity → Domain Entity
   * Reconstitución de entidad del dominio desde persistencia
   */
  private toDomain(entity: TypeOrmNotificationEventEntity): NotificationEvent {
    return NotificationEvent.reconstitute({
      id: entity.id,
      tenantId: entity.tenantId,
      bookingId: entity.bookingId,
      templateId: entity.templateId,
      channelCode: entity.channelCode,
      recipientType: entity.recipientType,
      recipientId: entity.recipientId,
      contactPoint: entity.contactPoint,
      subject: entity.subject,
      renderedContent: entity.renderedContent,
      status: entity.status,
      retryCount: entity.retryCount,
      maxRetries: entity.maxRetries,
      lastError: entity.lastError,
      scheduledFor: entity.scheduledFor,
      sentAt: entity.sentAt,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Mapper: Domain Entity → TypeORM Entity
   * Conversión a formato persistible
   */
  private toPersistence(
    event: NotificationEvent
  ): TypeOrmNotificationEventEntity {
    const primitives = event.toPrimitives();
    const entity = new TypeOrmNotificationEventEntity();

    entity.id = primitives.id;
    entity.tenantId = primitives.tenantId;
    entity.bookingId = primitives.bookingId;
    entity.templateId = primitives.templateId;
    entity.channelCode = primitives.channelCode;
    entity.recipientType = primitives.recipientType;
    entity.recipientId = primitives.recipientId;
    entity.contactPoint = primitives.contactPoint;
    entity.subject = primitives.subject;
    entity.renderedContent = primitives.renderedContent;
    entity.status = primitives.status;
    entity.retryCount = primitives.retryCount;
    entity.maxRetries = primitives.maxRetries;
    entity.lastError = primitives.lastError;
    entity.scheduledFor = primitives.scheduledFor;
    entity.sentAt = primitives.sentAt;
    entity.metadata = primitives.metadata;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;

    return entity;
  }
}
