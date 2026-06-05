/**
 * RecordNotificationFailureCommand
 * CQS: Comando para registrar un fallo en el envío de notificación
 *
 * Parámetros:
 * - notificationEventId: ID del evento de notificación
 * - error: Mensaje de error
 */
export interface RecordNotificationFailureCommand {
  notificationEventId: string;
  error: string;
}
