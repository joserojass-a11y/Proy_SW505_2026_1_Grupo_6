import { NotificationEventRepository } from '../../domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../domain/entities/notification-event.entity';
import { GetNotificationHistoryQuery } from './get-notification-history.query';

/**
 * GetNotificationHistoryQueryHandler
 * CQS Handler: Obtiene historial de notificaciones enviadas/fallidas
 *
 * Flujo:
 * 1. Query al repositorio por eventos del destinatario
 * 2. Limita a N registros (default 100)
 * 3. Ordena por createdAt DESC (más recientes primero)
 * 4. Retorna array de eventos
 *
 * Utilizado por:
 * - Panel de usuario para ver notificaciones recibidas
 * - Auditoría/debugging de eventos de notificación
 * - Support tickets para ver historial de comunicación
 *
 * Notas:
 * - Retorna eventos en CUALQUIER estado (sent, failed, pending)
 * - Útil para tracking de comunicaciones
 */
export class GetNotificationHistoryQueryHandler {
  constructor(
    private readonly notificationEventRepository: NotificationEventRepository,
  ) {}

  async execute(
    query: GetNotificationHistoryQuery,
  ): Promise<NotificationEvent[]> {
    // Obtener historial de notificaciones del destinatario
    return this.notificationEventRepository.findByRecipientId(
      query.recipientId,
    );
  }
}
