/**
 * GetPendingNotificationsQuery
 * CQS: Query para obtener notificaciones pendientes de envío
 *
 * Utilizado por:
 * - Worker asíncrono que procesa la cola
 * - Monitoreo/debugging de estado de queue
 *
 * Retorna:
 * - Array de NotificationEvent pendientes ordenados por scheduled_for
 */
export interface GetPendingNotificationsQuery {}
