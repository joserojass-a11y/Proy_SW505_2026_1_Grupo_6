/**
 * UpdateNotificationPreferenceCommand
 * CQS: Comando para actualizar una preferencia de notificación
 *
 * Parámetros:
 * - preferenceId: ID de la preferencia
 * - isEnabled: Si está habilitado (opcional)
 * - frequency: Frecuencia de entrega (opcional)
 */
export interface UpdateNotificationPreferenceCommand {
  preferenceId: string;
  isEnabled?: boolean;
  frequency?: string;
}
