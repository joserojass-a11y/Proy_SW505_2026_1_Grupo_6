import { NotificationPreferenceRepository } from '../../domain/repositories/notification-preference.repository';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { DuplicateNotificationPreferenceException } from '../../domain/exceptions/duplicate-notification-preference.exception';
import { CreateNotificationPreferenceCommand } from './create-notification-preference.command';

/**
 * CreateNotificationPreferenceCommandHandler
 * CQS Handler: Crea una preferencia de notificación para un cliente
 *
 * Flujo:
 * 1. Valida que no exista duplicado (customer_id, topic_id, channel_id)
 * 2. Lanza excepción si duplicado
 * 3. Crea entidad de dominio NotificationPreference
 * 4. Persiste en BD
 * 5. Retorna ID
 *
 * Notas:
 * - Una preferencia por (customer, topic, channel)
 * - Defaults: isEnabled=true, frequency='immediately'
 */
export class CreateNotificationPreferenceCommandHandler {
  constructor(
    private readonly notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {}

  async execute(command: CreateNotificationPreferenceCommand): Promise<string> {
    // Verificar no existe duplicado
    const existingPref =
      await this.notificationPreferenceRepository.findByCustomerTopicChannel(
        command.customerId,
        command.topicId,
        command.channelId,
      );

    if (existingPref) {
      throw new DuplicateNotificationPreferenceException(
        command.customerId,
        command.topicId,
        command.channelId,
      );
    }

    // Crear entidad de dominio
    const preference = NotificationPreference.create({
      customerId: command.customerId,
      topicId: command.topicId,
      channelId: command.channelId,
      isEnabled: command.isEnabled ?? true,
      frequency: command.frequency ?? 'immediately',
    });

    // Persistir en BD
    await this.notificationPreferenceRepository.save(preference);

    // Retornar ID
    return preference.id;
  }
}
