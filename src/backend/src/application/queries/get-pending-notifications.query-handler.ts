import { NotificationEventRepository } from '../../domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../domain/entities/notification-event.entity';
import { GetPendingNotificationsQuery } from './get-pending-notifications.query';

/**
 * GetPendingNotificationsQueryHandler
 * CQS Handler: Obtiene notificaciones pendientes de envío
 *
 * Flujo:
 * 1. Query al repositorio por eventos con status='pending'
 * 2. Filtra por scheduled_for <= ahora
 * 3. Ordena por scheduled_for ASC (FIFO)
 * 4. Retorna array de eventos
 *
 * Utilizado por:
 * - Worker asíncrono (consumer de la cola)
 * - Endpoint de monitoreo/debugging
 *
 * Notas:
 * - La query limita a 100 registros para evitar carga masiva
 * - IMPORTANTE para la lógica de retry con backoff exponencial
 */
export class GetPendingNotificationsQueryHandler {
  constructor(
    private readonly notificationEventRepository: NotificationEventRepository,
  ) {}

  async execute(
    _query: GetPendingNotificationsQuery,
  ): Promise<NotificationEvent[]> {
    // Obtener eventos pendientes ordenados por fecha de envío
    return this.notificationEventRepository.findPendingEvents();
  }
}
