import { NotificationPreference } from '../entities/notification-preference.entity';

/**
 * Interfaz Repositorio: NotificationPreferenceRepository
 * 
 * Define los métodos de persistencia para la entidad NotificationPreference.
 * Implementación: TypeORM en capa de infraestructura.
 */
export interface NotificationPreferenceRepository {
  /**
   * Guardar una nueva preferencia
   */
  save(preference: NotificationPreference): Promise<void>;

  /**
   * Actualizar una preferencia existente
   */
  update(preference: NotificationPreference): Promise<void>;

  /**
   * Obtener una preferencia por ID
   */
  findById(id: string): Promise<NotificationPreference | null>;

  /**
   * Obtener preferencia por (customer + topic + channel)
   * Retorna null si no existe
   */
  findByCustomerTopicChannel(
    customerId: string,
    topicId: string,
    channelId: string
  ): Promise<NotificationPreference | null>;

  /**
   * Obtener todas las preferencias de un cliente
   */
  findByCustomerId(customerId: string): Promise<NotificationPreference[]>;

  /**
   * Obtener preferencias activas (habilitadas) de un cliente
   */
  findEnabledByCustomerId(customerId: string): Promise<NotificationPreference[]>;

  /**
   * Obtener preferencias de un cliente para un tópico específico
   */
  findByCustomerAndTopic(customerId: string, topicId: string): Promise<NotificationPreference[]>;

  /**
   * Eliminar una preferencia
   */
  delete(id: string): Promise<void>;

  /**
   * Verificar si una preferencia ya existe (para evitar duplicados)
   */
  exists(
    customerId: string,
    topicId: string,
    channelId: string
  ): Promise<boolean>;
}
