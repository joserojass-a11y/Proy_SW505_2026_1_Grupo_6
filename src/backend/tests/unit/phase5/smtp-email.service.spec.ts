import { SmtpEmailService } from '../../../src/infrastructure/email/smtp-email.service';
import { EmailSendException } from '../../../src/infrastructure/email/email-send.exception';

/**
 * Pruebas Unitarias: SmtpEmailService e EmailSendException
 *
 * Cubre:
 * - SmtpEmailService.send()         → Envío de emails con SMTP (nodemailer mockeado)
 * - SmtpEmailService.isAvailable()  → Verificación de conexión SMTP
 * - EmailSendException              → Estructura de la excepción de envío
 *
 * Estrategia de mocking:
 * Se mockea el módulo 'nodemailer' para aislar el servicio del SMTP real.
 * Esto garantiza que los tests sean deterministas e independientes del entorno.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Mock de nodemailer a nivel de módulo
// ─────────────────────────────────────────────────────────────────────────────
const mockSendMail    = jest.fn();
const mockVerify      = jest.fn();
const mockTransporter = { sendMail: mockSendMail, verify: mockVerify };

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter),
}));

describe('SmtpEmailService — Capa de Infraestructura', () => {
  let service: SmtpEmailService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Variables de entorno mínimas para instanciar el servicio
    process.env.SMTP_HOST     = 'smtp.test.local';
    process.env.SMTP_PORT     = '587';
    process.env.SMTP_SECURE   = 'false';
    process.env.SMTP_USER     = 'noreply@test.com';
    process.env.SMTP_PASSWORD = 'test_password';
    process.env.SMTP_FROM     = 'noreply@test.com';

    service = new SmtpEmailService();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // ─────────────────────────────────────────────────────────────────────
  // 1. send()
  // ─────────────────────────────────────────────────────────────────────
  describe('send()', () => {
    it('debe retornar un messageId en envío exitoso', async () => {
      mockSendMail.mockResolvedValue({ messageId: '<test-id@mail.test>' });

      const result = await service.send(
        'destinatario@example.com',
        'Reserva Confirmada',
        '<h1>Tu reserva está confirmada</h1>',
      );

      expect(result).toHaveProperty('messageId');
      expect(result.messageId).toBe('<test-id@mail.test>');
    });

    it('debe llamar al transporter con los parámetros correctos', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-001' });

      await service.send(
        'cliente@example.com',
        'Asunto de Prueba',
        '<p>Contenido HTML</p>',
      );

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe('cliente@example.com');
      expect(mailOptions.subject).toBe('Asunto de Prueba');
      expect(mailOptions.html).toBe('<p>Contenido HTML</p>');
    });

    it('debe generar un plain text de respaldo junto con el HTML', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-002' });

      await service.send('x@x.com', 'Asunto', '<strong>Texto en HTML</strong>');

      const mailOptions = mockSendMail.mock.calls[0][0];
      // El servicio debe generar un campo text como fallback
      expect(mailOptions).toHaveProperty('text');
      expect(typeof mailOptions.text).toBe('string');
    });

    it('debe lanzar EmailSendException cuando el transporter falla', async () => {
      const smtpError = new Error('Connection refused by SMTP server');
      mockSendMail.mockRejectedValue(smtpError);

      await expect(
        service.send('falla@example.com', 'Error', '<p>Este fallará</p>'),
      ).rejects.toThrow(EmailSendException);
    });

    it('debe incluir el email destinatario y asunto en EmailSendException', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP down'));

      try {
        await service.send('destino@example.com', 'Asunto Error', '<p>test</p>');
        fail('Debería haber lanzado EmailSendException');
      } catch (err) {
        expect(err).toBeInstanceOf(EmailSendException);
        const emailErr = err as EmailSendException;
        expect(emailErr.to).toBe('destino@example.com');
        expect(emailErr.subject).toBe('Asunto Error');
      }
    });

    it('debe preservar el error original dentro de EmailSendException', async () => {
      const originalError = new Error('TLS handshake failed');
      mockSendMail.mockRejectedValue(originalError);

      try {
        await service.send('x@x.com', 'S', '<p>x</p>');
      } catch (err) {
        const emailErr = err as EmailSendException;
        expect(emailErr.originalError).toBe(originalError);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 2. isAvailable()
  // ─────────────────────────────────────────────────────────────────────
  describe('isAvailable()', () => {
    it('debe retornar true cuando el transporter verifica exitosamente', async () => {
      mockVerify.mockResolvedValue(true);

      const result = await service.isAvailable();

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });

    it('debe retornar false cuando el transporter no puede verificar', async () => {
      mockVerify.mockRejectedValue(new Error('Cannot connect to SMTP'));

      const result = await service.isAvailable();

      expect(result).toBe(false);
    });

    it('debe retornar un booleano (no lanzar excepción)', async () => {
      mockVerify.mockResolvedValue(false);

      const result = await service.isAvailable();

      expect(typeof result).toBe('boolean');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EmailSendException — Pruebas de estructura
// ─────────────────────────────────────────────────────────────────────────────
describe('EmailSendException — Estructura de la excepción', () => {
  const to            = 'usuario@example.com';
  const subject       = 'Asunto de Prueba';
  const originalError = new Error('SMTP timeout: 30s');

  let exception: EmailSendException;

  beforeEach(() => {
    exception = new EmailSendException(to, subject, originalError);
  });

  it('debe ser instancia de Error', () => {
    expect(exception).toBeInstanceOf(Error);
  });

  it('debe contener el email destinatario en "to"', () => {
    expect(exception.to).toBe(to);
  });

  it('debe contener el asunto en "subject"', () => {
    expect(exception.subject).toBe(subject);
  });

  it('debe preservar el error original en "originalError"', () => {
    expect(exception.originalError).toBe(originalError);
  });

  it('debe tener un message descriptivo que incluya "Failed to send email"', () => {
    expect(exception.message).toContain('Failed to send email');
  });

  it('debe incluir el email en el message para facilitar debugging', () => {
    expect(exception.message).toContain(to);
  });

  it('debe tener una propiedad "name" para identificar el tipo de excepción', () => {
    expect(exception.name).toBeDefined();
    expect(typeof exception.name).toBe('string');
  });
});
