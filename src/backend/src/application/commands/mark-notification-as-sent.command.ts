/**
 * MarkNotificationAsSentCommand
 * CQS: Comando para marcar una notificación como enviada
 *
 * Parámetros:
 * - notificationEventId: ID del evento de notificación
 */
export interface MarkNotificationAsSentCommand {
  notificationEventId: string;
}
