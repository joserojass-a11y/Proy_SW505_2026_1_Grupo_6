import { NotificationEventRepository } from '../../domain/repositories/notification-event.repository';
import { NotificationNotFoundException } from '../../domain/exceptions/notification-not-found.exception';
import { RecordNotificationFailureCommand } from './record-notification-failure.command';

/**
 * RecordNotificationFailureCommandHandler
 * CQS Handler: Registra un fallo en el envío de una notificación
 *
 * Flujo:
 * 1. Busca el evento por ID
 * 2. Lanza excepción si no existe
 * 3. Registra el fallo en la entidad (incrementa retry, guarda error)
 * 4. Actualiza en BD
 *
 * Notas:
 * - Si se excede max_retries, lanza MaxRetriesExceededException
 * - El evento debe cambiar status a 'failed' o permanecer 'pending' para retry
 */
export class RecordNotificationFailureCommandHandler {
  constructor(
    private readonly notificationEventRepository: NotificationEventRepository,
  ) {}

  async execute(command: RecordNotificationFailureCommand): Promise<void> {
    // Obtener evento existente
    const event = await this.notificationEventRepository.findById(
      command.notificationEventId,
    );

    if (!event) {
      throw new NotificationNotFoundException(command.notificationEventId);
    }

    // Registrar fallo (recordFailure valida max_retries internamente)
    // Esto puede lanzar MaxRetriesExceededException
    event.recordFailure(command.error);

    // Persistir cambios
    await this.notificationEventRepository.update(event);
  }
}
