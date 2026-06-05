import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailService } from '../../application/services/email.service.interface';
import { EmailSendException } from './email-send.exception';

/**
 * SmtpEmailService
 * Implementación del servicio de email usando SMTP
 *
 * Utiliza nodemailer para:
 * - Conectar a servidor SMTP
 * - Enviar emails con plantillas HTML
 * - Manejar reintentos y errores
 *
 * Configuración SMTP:
 * - HOST: Del environment
 * - PORT: 587 (TLS) o 465 (SSL)
 * - USER: Email de origen
 * - PASSWORD: Contraseña o app token
 */
@Injectable()
export class SmtpEmailService implements EmailService {
  private transporter: nodemailer.Transporter;
  private isConnected = false;

  constructor() {
    // Inicializar transporter con configuración del environment
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false, // true para 465, false para 587
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    });
  }

  /**
   * Enviar email
   *
   * @param to Email del destinatario
   * @param subject Asunto del email
   * @param html Contenido en formato HTML
   * @returns messageId del email enviado
   * @throws EmailSendException
   */
  async send(to: string, subject: string, html: string): Promise<{ messageId: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@reservation-system.com',
        to,
        subject,
        html,
        // Opcional: text fallback
        text: html.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text
      });

      // Marcar como conectado después de envío exitoso
      this.isConnected = true;

      return { messageId: info.messageId };
    } catch (error) {
      this.isConnected = false;
      throw new EmailSendException(to, subject, error as Error);
    }
  }

  /**
   * Verificar si el servicio SMTP está disponible
   *
   * @returns true si la conexión es funcional
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Verificar conexión SMTP
      await this.transporter.verify();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }
}
