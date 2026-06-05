/**
 * CreateNotificationCommand
 * CQS: Comando para crear un evento de notificación
 *
 * Parámetros:
 * - tenantId: ID del inquilino
 * - bookingId: ID de la reserva (nullable, para eventos generales)
 * - templateId: ID de la plantilla de notificación
 * - recipientType: 'customer' | 'user'
 * - recipientId: ID del cliente/usuario destinatario
 * - contactPoint: Email, teléfono, etc.
 * - subject: Asunto (puede ser null para SMS)
 * - renderedContent: Contenido ya renderizado
 * - maxRetries: Cantidad máxima de intentos (default: 3)
 * - scheduledFor: Fecha/hora de envío programado
 * - metadata: Datos adicionales (JSON)
 */
export interface CreateNotificationCommand {
  tenantId: string;
  bookingId: string | null;
  templateId: string;
  recipientType: 'customer' | 'user';
  recipientId: string;
  contactPoint: string;
  subject: string | null;
  renderedContent: string;
  maxRetries?: number;
  scheduledFor: Date;
  metadata?: Record<string, unknown>;
}
