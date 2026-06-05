import { NotificationPreferenceRepository } from '../../domain/repositories/notification-preference.repository';
import { NotificationNotFoundException } from '../../domain/exceptions/notification-not-found.exception';
import { UpdateNotificationPreferenceCommand } from './update-notification-preference.command';

/**
 * UpdateNotificationPreferenceCommandHandler
 * CQS Handler: Actualiza una preferencia de notificación existente
 *
 * Flujo:
 * 1. Busca preferencia por ID
 * 2. Lanza excepción si no existe
 * 3. Actualiza propiedades (isEnabled, frequency)
 * 4. Persiste en BD
 *
 * Responsabilidades:
 * - Cambiar estado de suscripción (enabled/disabled)
 * - Cambiar frecuencia de entrega
 * - Validar valores de frecuencia
 */
export class UpdateNotificationPreferenceCommandHandler {
  constructor(
    private readonly notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {}

  async execute(command: UpdateNotificationPreferenceCommand): Promise<void> {
    // Obtener preferencia existente
    const preference = await this.notificationPreferenceRepository.findById(
      command.preferenceId,
    );

    if (!preference) {
      throw new NotificationNotFoundException(command.preferenceId);
    }

    // Actualizar propiedades si se proporcionan
    if (command.isEnabled !== undefined) {
      preference.setEnabled(command.isEnabled);
    }

    if (command.frequency !== undefined) {
      preference.setFrequency(command.frequency);
    }

    // Persistir cambios
    await this.notificationPreferenceRepository.update(preference);
  }
}
