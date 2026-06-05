/**
 * GetCustomerPreferencesQuery
 * CQS: Query para obtener preferencias de notificación de un cliente
 *
 * Parámetros:
 * - customerId: ID del cliente
 *
 * Retorna:
 * - Array de NotificationPreference del cliente
 */
export interface GetCustomerPreferencesQuery {
  customerId: string;
}
