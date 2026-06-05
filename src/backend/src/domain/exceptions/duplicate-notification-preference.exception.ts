import { DomainException } from './domain.exception';

/**
 * Excepción: Preferencia de Notificación Duplicada
 * Se lanza cuando se intenta crear una preferencia que ya existe (customer+topic+channel)
 */
export class DuplicateNotificationPreferenceException extends DomainException {
  constructor(customerId: string, topicId: string, channelId: string) {
    super(
      `Notification preference already exists for customer ${customerId}, topic ${topicId}, and channel ${channelId}`,
      'DUPLICATE_NOTIFICATION_PREFERENCE'
    );
  }
}
