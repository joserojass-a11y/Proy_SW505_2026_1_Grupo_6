/**
 * Interface: EmailService
 * Contrato para servicios de envío de email
 *
 * Implementaciones:
 * - SmtpEmailService (SMTP)
 * - MockEmailService (testing)
 */
export interface EmailService {
  /**
   * Enviar email
   * @param to Dirección email destino
   * @param subject Asunto
   * @param html Contenido HTML
   * @returns Promise<{ messageId: string }> ID del mensaje
   * @throws EmailSendException
   */
  send(to: string, subject: string, html: string): Promise<{ messageId: string }>;

  /**
   * Verificar conexión SMTP
   * @returns Promise<boolean> true si está disponible
   */
  isAvailable(): Promise<boolean>;
}
