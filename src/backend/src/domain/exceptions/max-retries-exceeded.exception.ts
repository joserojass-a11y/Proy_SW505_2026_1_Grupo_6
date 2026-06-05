import { DomainException } from './domain.exception';

/**
 * Excepción: Reintentos Agotados
 * Se lanza cuando un evento de notificación supera el número máximo de reintentos
 */
export class MaxRetriesExceededException extends DomainException {
  constructor(notificationId: string, retryCount: number, maxRetries: number) {
    super(
      `Notification ${notificationId} exceeded max retries. Attempted: ${retryCount}, Maximum allowed: ${maxRetries}`,
      'MAX_RETRIES_EXCEEDED'
    );
  }
}
