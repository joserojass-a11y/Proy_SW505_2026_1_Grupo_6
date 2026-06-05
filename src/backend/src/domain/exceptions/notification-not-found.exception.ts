import { DomainException } from './domain.exception';

/**
 * Excepción: Notificación No Encontrada
 * Se lanza cuando se intenta acceder a un evento de notificación que no existe
 */
export class NotificationNotFoundException extends DomainException {
  constructor(notificationId: string) {
    super(
      `Notification with ID ${notificationId} not found`,
      'NOTIFICATION_NOT_FOUND'
    );
  }
}
