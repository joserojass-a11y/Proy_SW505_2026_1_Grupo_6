/**
 * Excepción: EmailSendException
 * Lanzada cuando falla el envío de email via SMTP
 */
export class EmailSendException extends Error {
  constructor(
    public readonly to: string,
    public readonly subject: string,
    public readonly originalError: Error,
  ) {
    super(
      `Failed to send email to ${to}: ${originalError.message}`,
    );
    this.name = 'EmailSendException';
  }
}
