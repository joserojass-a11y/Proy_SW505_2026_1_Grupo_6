/**
 * CreateNotificationPreferenceCommand
 * CQS: Comando para crear una preferencia de notificación de cliente
 *
 * Parámetros:
 * - customerId: ID del cliente
 * - topicId: ID del tópico de notificación
 * - channelId: ID del canal (email, SMS, etc.)
 * - isEnabled: Si está habilitado (default: true)
 * - frequency: Frecuencia de entrega (immediately|daily|weekly)
 */
export interface CreateNotificationPreferenceCommand {
  customerId: string;
  topicId: string;
  channelId: string;
  isEnabled?: boolean;
  frequency?: string;
}
