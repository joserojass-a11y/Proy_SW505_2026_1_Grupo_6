import { NotificationEvent } from '../../../src/domain/entities/notification-event.entity';
import { MaxRetriesExceededException } from '../../../src/domain/exceptions/max-retries-exceeded.exception';

/**
 * Pruebas Unitarias: Entidad NotificationEvent
 *
 * Cubre:
 * - create()           → Factory method con estado inicial pending
 * - reconstitute()     → Restaurar desde BD
 * - markAsSent()       → Cambio de estado a sent + sentAt
 * - recordFailure()    → Incremento de retryCount + backoff exponencial
 * - resetForRetry()    → Reset a pending para reintento
 * - getNextRetryDelay()→ Cálculo de backoff 2^n * 1000ms
 * - toPrimitives()     → Serialización completa para persistencia
 *
 * Nota: todos los IDs son UUIDs v4 válidos para cumplir con las
 * validaciones de los Value Objects de dominio.
 */
describe('NotificationEvent Entity', () => {
  // ─── UUIDs de prueba ────────────────────────────────────────────────────────
  const TENANT_UUID    = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const BOOKING_UUID   = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  const TEMPLATE_UUID  = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
  const CUSTOMER_UUID  = '550e8400-e29b-41d4-a716-446655440004';
  const EVENT_UUID     = '550e8400-e29b-41d4-a716-446655440000';

  /** Helper: props mínimas válidas para crear un NotificationEvent */
  const baseProps = () => ({
    tenantId: TENANT_UUID,
    bookingId: BOOKING_UUID,
    templateId: TEMPLATE_UUID,
    channelCode: 'email',
    recipientType: 'customer' as const,
    recipientId: CUSTOMER_UUID,
    contactPoint: 'cliente@example.com',
    subject: 'Reserva Confirmada',
    renderedContent: '<h1>Tu reserva fue confirmada</h1>',
    maxRetries: 3,
    scheduledFor: new Date('2026-06-04T14:00:00Z'),
    metadata: { bookingCode: 'BK123' },
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe('create() factory method', () => {
    it('debe crear un evento con estado "pending" y retryCount=0', () => {
      const event = NotificationEvent.create(baseProps());

      expect(event.id.value).toBeDefined();
      expect(event.tenantId.value).toBe(TENANT_UUID);
      expect(event.recipientId.value).toBe(CUSTOMER_UUID);
      expect(event.status.value).toBe('pending');
      expect(event.retryCount).toBe(0);
      expect(event.maxRetries).toBe(3);
      expect(event.sentAt).toBeNull();
      expect(event.lastError).toBeNull();
    });

    it('debe generar IDs únicos en cada llamada a create()', () => {
      const e1 = NotificationEvent.create(baseProps());
      const e2 = NotificationEvent.create(baseProps());
      expect(e1.id.value).not.toBe(e2.id.value);
    });

    it('debe aceptar bookingId=null para notificaciones generales', () => {
      const event = NotificationEvent.create({ ...baseProps(), bookingId: null });
      expect(event.bookingId).toBeNull();
    });

    it('debe aceptar subject=null para canales sin asunto (ej. SMS)', () => {
      const event = NotificationEvent.create({ ...baseProps(), subject: null });
      expect(event.subject).toBeNull();
    });

    it('debe usar maxRetries=3 como default si no se proporciona', () => {
      const { maxRetries: _, ...propsWithoutRetries } = baseProps();
      const event = NotificationEvent.create(propsWithoutRetries);
      expect(event.maxRetries).toBe(3);
    });

    it('debe preservar el metadata en el evento creado', () => {
      const event = NotificationEvent.create({
        ...baseProps(),
        metadata: { orderRef: 'ORD-001', source: 'web' },
      });
      expect(event.metadata).toEqual({ orderRef: 'ORD-001', source: 'web' });
    });

    // Nota: La entidad no valida maxRetries negativo en el dominio;
    // la validación se delega al nivel de base de datos (constraint CHECK).
    // Este comportamiento es intencionado: el dominio confía en el caller.
    it('debe aceptar maxRetries=0 (sin reintentos)', () => {
      const event = NotificationEvent.create({ ...baseProps(), maxRetries: 0 });
      expect(event.maxRetries).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe('markAsSent()', () => {
    it('debe cambiar status a "sent" y registrar sentAt', () => {
      const event = NotificationEvent.create(baseProps());

      expect(event.sentAt).toBeNull();
      event.markAsSent();

      expect(event.status.value).toBe('sent');
      expect(event.sentAt).not.toBeNull();
      expect(event.sentAt).toBeInstanceOf(Date);
    });

    it('debe lanzar error al intentar marcar como sent un evento ya enviado', () => {
      const event = NotificationEvent.create(baseProps());
      event.markAsSent();

      expect(() => event.markAsSent()).toThrow(
        `Cannot mark as sent: current status is sent`,
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe('recordFailure() — Exponential Backoff', () => {
    it('debe incrementar retryCount y guardar el error en el primer fallo', () => {
      const event = NotificationEvent.create(baseProps());

      expect(event.retryCount).toBe(0);
      event.recordFailure('SMTP connection timeout');

      expect(event.retryCount).toBe(1);
      expect(event.lastError).toBe('SMTP connection timeout');
      expect(event.status.value).toBe('failed'); // registra fallo
    });

    it('debe calcular correctamente el backoff exponencial 2^retryCount * 1000ms', () => {
      const event = NotificationEvent.create(baseProps());

      // Después de recordFailure('Error 1'), retryCount=1
      // getNextRetryDelay() = 2^1 * 1000 = 2000ms
      event.recordFailure('Error 1');
      expect(event.getNextRetryDelay()).toBe(2000); // 2^1 * 1000

      // Después de recordFailure('Error 2'), retryCount=2
      // getNextRetryDelay() = 2^2 * 1000 = 4000ms
      event.recordFailure('Error 2');
      expect(event.getNextRetryDelay()).toBe(4000); // 2^2 * 1000

      // Después de recordFailure('Error 3'), retryCount=3
      // getNextRetryDelay() = 2^3 * 1000 = 8000ms
      event.recordFailure('Error 3');
      expect(event.getNextRetryDelay()).toBe(8000); // 2^3 * 1000
    });

    it('debe lanzar MaxRetriesExceededException cuando se agota el límite', () => {
      const event = NotificationEvent.create({ ...baseProps(), maxRetries: 2 });

      event.recordFailure('Error 1');
      expect(event.retryCount).toBe(1);

      event.recordFailure('Error 2');
      expect(event.retryCount).toBe(2);

      // El tercer intento supera el límite
      expect(() => {
        event.recordFailure('Error 3 — excede maxRetries');
      }).toThrow(MaxRetriesExceededException);

      // Después de la excepción el estado debe ser 'failed'
      expect(event.status.value).toBe('failed');
    });

    it('debe acumular errores sucesivos conservando el último', () => {
      const event = NotificationEvent.create({ ...baseProps(), maxRetries: 5 });
      const errors = ['Timeout 1', 'Timeout 2', 'Timeout 3'];

      errors.forEach((error, index) => {
        event.recordFailure(error);
        expect(event.retryCount).toBe(index + 1);
        expect(event.lastError).toBe(error);
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe('resetForRetry()', () => {
    it('debe restaurar el status a "pending" para reintento', () => {
      const event = NotificationEvent.create(baseProps());
      event.recordFailure('Primer error');

      expect(event.retryCount).toBe(1);       // retryCount se conserva
      expect(event.lastError).not.toBeNull(); // lastError se conserva
      expect(event.status.value).toBe('failed');

      event.resetForRetry();

      // resetForRetry() solo cambia el status de vuelta a pending;
      // NO limpia retryCount ni lastError (eso es responsabilidad del caller).
      expect(event.status.value).toBe('pending');
      expect(event.retryCount).toBe(1);       // se conserva
      expect(event.lastError).not.toBeNull(); // se conserva
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe('toPrimitives()', () => {
    it('debe serializar todos los atributos a primitivos', () => {
      const scheduledDate = new Date('2026-06-04T14:00:00Z');
      const event = NotificationEvent.create({ ...baseProps(), scheduledFor: scheduledDate });

      const p = event.toPrimitives();

      expect(p.id).toBe(event.id.value);
      expect(p.tenantId).toBe(TENANT_UUID);
      expect(p.bookingId).toBe(BOOKING_UUID);
      expect(p.templateId).toBe(TEMPLATE_UUID);
      expect(p.channelCode).toBe('email');
      expect(p.recipientType).toBe('customer');
      expect(p.recipientId).toBe(CUSTOMER_UUID);
      expect(p.contactPoint).toBe('cliente@example.com');
      expect(p.subject).toBe('Reserva Confirmada');
      expect(p.status).toBe('pending');
      expect(p.retryCount).toBe(0);
      expect(p.maxRetries).toBe(3);
      expect(p.metadata).toEqual({ bookingCode: 'BK123' });
      expect(p.scheduledFor).toEqual(scheduledDate);
      expect(p.sentAt).toBeNull();
      expect(p.lastError).toBeNull();
    });

    it('debe reflejar el estado "sent" y el sentAt después de markAsSent()', () => {
      const event = NotificationEvent.create(baseProps());
      event.markAsSent();

      const p = event.toPrimitives();

      expect(p.status).toBe('sent');
      expect(p.sentAt).toBeInstanceOf(Date);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe('reconstitute() factory method', () => {
    it('debe restaurar la entidad con todos los atributos desde BD', () => {
      const primitives = {
        id: EVENT_UUID,
        tenantId: TENANT_UUID,
        bookingId: BOOKING_UUID,
        templateId: TEMPLATE_UUID,
        channelCode: 'email',
        recipientType: 'customer' as const,
        recipientId: CUSTOMER_UUID,
        contactPoint: 'cliente@example.com',
        subject: 'Reserva Confirmada',
        renderedContent: '<h1>Confirmado</h1>',
        status: 'pending' as const,
        retryCount: 2,
        maxRetries: 3,
        lastError: 'SMTP timeout previo',
        scheduledFor: new Date('2026-06-04T14:00:00Z'),
        sentAt: null,
        metadata: { bookingCode: 'BK123' },
        createdAt: new Date('2026-06-04T13:00:00Z'),
        updatedAt: new Date('2026-06-04T13:30:00Z'),
      };

      const event = NotificationEvent.reconstitute(primitives);

      expect(event.id.value).toBe(EVENT_UUID);
      expect(event.tenantId.value).toBe(TENANT_UUID);
      expect(event.retryCount).toBe(2);
      expect(event.lastError).toBe('SMTP timeout previo');
      expect(event.status.value).toBe('pending');
      expect(event.sentAt).toBeNull();
    });

    it('debe reconstitute un evento ya enviado con sentAt definido', () => {
      const sentAt = new Date('2026-06-04T15:00:00Z');
      const event = NotificationEvent.reconstitute({
        id: EVENT_UUID,
        tenantId: TENANT_UUID,
        bookingId: null,
        templateId: TEMPLATE_UUID,
        channelCode: 'email',
        recipientType: 'user' as const,
        recipientId: CUSTOMER_UUID,
        contactPoint: 'admin@example.com',
        subject: 'Alerta',
        renderedContent: '<p>Alerta del sistema</p>',
        status: 'sent' as const,
        retryCount: 0,
        maxRetries: 3,
        lastError: null,
        scheduledFor: new Date('2026-06-04T14:50:00Z'),
        sentAt,
        metadata: {},
        createdAt: new Date('2026-06-04T14:00:00Z'),
        updatedAt: new Date('2026-06-04T15:00:00Z'),
      });

      expect(event.status.value).toBe('sent');
      expect(event.sentAt).toEqual(sentAt);
    });
  });
});
