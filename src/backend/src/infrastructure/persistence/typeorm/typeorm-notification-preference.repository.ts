import { DataSource } from 'typeorm';
import { NotificationPreferenceRepository } from '../../../domain/repositories/notification-preference.repository';
import { NotificationPreference } from '../../../domain/entities/notification-preference.entity';
import { DuplicateNotificationPreferenceException } from '../../../domain/exceptions/duplicate-notification-preference.exception';
import { TypeOrmNotificationPreferenceEntity } from './entities/typeorm-notification-preference.entity';

/**
 * Implementación: NotificationPreferenceRepository con TypeORM
 *
 * Responsabilidades:
 * - Gestionar preferencias de notificación de clientes
 * - Validar unicidad de (customer_id, topic_id, channel_id)
 * - Optimizar queries para consultas frecuentes
 */
export class TypeOrmNotificationPreferenceRepository
  implements NotificationPreferenceRepository
{
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmNotificationPreferenceEntity);
  }

  /**
   * Guardar una nueva preferencia
   * @throws DuplicateNotificationPreferenceException si ya existe
   */
  async save(preference: NotificationPreference): Promise<void> {
    // Validar que no exista duplicado
    const exists = await this.exists(
      preference.customerId.value,
      preference.topicId,
      preference.channelId
    );
    if (exists) {
      throw new DuplicateNotificationPreferenceException(
        preference.customerId.value,
        preference.topicId,
        preference.channelId
      );
    }

    const persisted = this.toPersistence(preference);
    await this.repository.insert(persisted);
  }

  /**
   * Actualizar una preferencia existente
   */
  async update(preference: NotificationPreference): Promise<void> {
    const persisted = this.toPersistence(preference);
    await this.repository.update({ id: preference.id }, persisted);
  }

  /**
   * Obtener una preferencia por ID
   */
  async findById(id: string): Promise<NotificationPreference | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Obtener preferencia por (customer + topic + channel)
   * Búsqueda de unicidad garantizada por constraint de BD
   */
  async findByCustomerTopicChannel(
    customerId: string,
    topicId: string,
    channelId: string
  ): Promise<NotificationPreference | null> {
    const entity = await this.repository.findOne({
      where: { customerId, topicId, channelId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Obtener todas las preferencias de un cliente
   */
  async findByCustomerId(customerId: string): Promise<NotificationPreference[]> {
    const entities = await this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Obtener preferencias activas (habilitadas) de un cliente
   * Optimización: usado por motor de orquestación antes de enviar
   */
  async findEnabledByCustomerId(
    customerId: string
  ): Promise<NotificationPreference[]> {
    const entities = await this.repository.find({
      where: { customerId, isEnabled: true },
      order: { createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Obtener preferencias de un cliente para un tópico específico
   * Usado para validar qué canales están habilitados para una notificación
   */
  async findByCustomerAndTopic(
    customerId: string,
    topicId: string
  ): Promise<NotificationPreference[]> {
    const entities = await this.repository.find({
      where: { customerId, topicId },
      order: { channelId: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Eliminar una preferencia
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  /**
   * Verificar si una preferencia ya existe
   * Utilizado para evitar duplicados en save()
   */
  async exists(
    customerId: string,
    topicId: string,
    channelId: string
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { customerId, topicId, channelId },
    });
    return count > 0;
  }

  /**
   * Mapper: TypeORM Entity → Domain Entity
   */
  private toDomain(
    entity: TypeOrmNotificationPreferenceEntity
  ): NotificationPreference {
    return NotificationPreference.reconstitute({
      id: entity.id,
      customerId: entity.customerId,
      topicId: entity.topicId,
      channelId: entity.channelId,
      isEnabled: entity.isEnabled,
      frequency: entity.frequency,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Mapper: Domain Entity → TypeORM Entity
   */
  private toPersistence(
    preference: NotificationPreference
  ): TypeOrmNotificationPreferenceEntity {
    const primitives = preference.toPrimitives();
    const entity = new TypeOrmNotificationPreferenceEntity();

    entity.id = primitives.id;
    entity.customerId = primitives.customerId;
    entity.topicId = primitives.topicId;
    entity.channelId = primitives.channelId;
    entity.isEnabled = primitives.isEnabled;
    entity.frequency = primitives.frequency;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;

    return entity;
  }
}
