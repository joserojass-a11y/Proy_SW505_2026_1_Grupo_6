import { NotificationEvent } from '../entities/notification-event.entity';
import { NotificationChannelCode } from '../value-objects/notification-channel-code.vo';

/**
 * Interfaz Repositorio: NotificationEventRepository
 * 
 * Define los métodos de persistencia para la entidad NotificationEvent.
 * Implementación: TypeORM en capa de infraestructura.
 */
export interface NotificationEventRepository {
  /**
   * Guardar un nuevo evento de notificación
   */
  save(event: NotificationEvent): Promise<void>;

  /**
   * Actualizar un evento existente
   */
  update(event: NotificationEvent): Promise<void>;

  /**
   * Obtener un evento por ID
   */
  findById(id: string): Promise<NotificationEvent | null>;

  /**
   * Obtener todos los eventos pendientes ordenados por fecha de envío
   * (para procesar la cola asíncrona)
   */
  findPendingEvents(): Promise<NotificationEvent[]>;

  /**
   * Obtener eventos pendientes para un canal específico
   * (útil para procesadores específicos por canal)
   */
  findPendingEventsByChannel(channelCode: NotificationChannelCode): Promise<NotificationEvent[]>;

  /**
   * Obtener el historial de eventos para un booking
   * (para auditoría y debugging)
   */
  findByBookingId(bookingId: string): Promise<NotificationEvent[]>;

  /**
   * Obtener el historial de eventos para un destinatario
   */
  findByRecipientId(recipientId: string): Promise<NotificationEvent[]>;

  /**
   * Eliminar un evento (limpieza de datos antiguos)
   */
  delete(id: string): Promise<void>;

  /**
   * Obtener conteo de eventos por status (métricas)
   */
  countByStatus(status: 'pending' | 'sent' | 'failed'): Promise<number>;
}
