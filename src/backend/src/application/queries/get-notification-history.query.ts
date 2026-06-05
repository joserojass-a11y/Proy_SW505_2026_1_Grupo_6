/**
 * GetNotificationHistoryQuery
 * CQS: Query para obtener historial de notificaciones enviadas/fallidas
 *
 * Parámetros:
 * - recipientId: ID del destinatario (customer o user)
 * - limit: Cantidad máxima de registros (default: 100)
 *
 * Retorna:
 * - Array de NotificationEvent ordenados por fecha descendente
 */
export interface GetNotificationHistoryQuery {
  recipientId: string;
  limit?: number;
}
