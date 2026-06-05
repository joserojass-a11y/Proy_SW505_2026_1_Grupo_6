import { NotificationEventRepository } from '../../domain/repositories/notification-event.repository';
import { NotificationNotFoundException } from '../../domain/exceptions/notification-not-found.exception';
import { MarkNotificationAsSentCommand } from './mark-notification-as-sent.command';

/**
 * MarkNotificationAsSentCommandHandler
 * CQS Handler: Marca una notificación como enviada exitosamente
 *
 * Flujo:
 * 1. Busca el evento por ID
 * 2. Lanza excepción si no existe
 * 3. Marca como enviada (status='sent', sentAt=now)
 * 4. Actualiza en BD
 *
 * Responsabilidades:
 * - Cambiar estado del evento
 * - Registrar timestamp de envío
 * - Persistir cambios
 */
export class MarkNotificationAsSentCommandHandler {
  constructor(
    private readonly notificationEventRepository: NotificationEventRepository,
  ) {}

  async execute(command: MarkNotificationAsSentCommand): Promise<void> {
    // Obtener evento existente
    const event = await this.notificationEventRepository.findById(
      command.notificationEventId,
    );

    if (!event) {
      throw new NotificationNotFoundException(command.notificationEventId);
    }

    // Marcar como enviada (actualiza status y sentAt)
    event.markAsSent();

    // Persistir cambios
    await this.notificationEventRepository.update(event);
  }
}
