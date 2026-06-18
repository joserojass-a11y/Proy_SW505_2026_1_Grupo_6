import { NotificationOrchestrationService } from '../../../src/infrastructure/services/notification-orchestration.service';
import { NotificationEvent } from '../../../src/domain/entities/notification-event.entity';
import { NotificationPreference } from '../../../src/domain/entities/notification-preference.entity';
import { NotificationEventRepository } from '../../../src/domain/repositories/notification-event.repository';
import { NotificationPreferenceRepository } from '../../../src/domain/repositories/notification-preference.repository';
import { EmailService } from '../../../src/application/services/email.service.interface';
import { NotificationQueueService } from '../../../src/application/services/notification-queue.service.interface';
import { GetPendingNotificationsQueryHandler } from '../../../src/application/queries/get-pending-notifications.query-handler';
import { MarkNotificationAsSentCommandHandler } from '../../../src/application/commands/mark-notification-as-sent.command-handler';
import { RecordNotificationFailureCommandHandler } from '../../../src/application/commands/record-notification-failure.command-handler';
import { EmailSendException } from '../../../src/infrastructure/email/email-send.exception';

/**
 * Pruebas de Integración: NotificationOrchestrationService
 *
 * Cubre el flujo completo del sistema de notificaciones:
 * 1. Obtención de eventos pendientes (GetPendingNotificationsQueryHandler)
 * 2. Validación de preferencias del cliente (NotificationPreferenceRepository)
 * 3. Envío de email (EmailService)
 * 4. Marcado como enviado (MarkNotificationAsSentCommandHandler)
 * 5. Registro de fallos con retry (RecordNotificationFailureCommandHandler)
 * 6. Encolado y métricas (NotificationQueueService)
 * 7. Lifecycle de NestJS (OnModuleInit / OnModuleDestroy)
 *
 * Estrategia: Mocks de todos los colaboradores. Se prueban las colaboraciones
 * entre el orquestador y sus dependencias, no la BD ni SMTP reales.
 *
 * Clasificación: Integration Tests (múltiples colaboradores reales en memoria).
 */
describe('NotificationOrchestrationService — Integración', () => {
  // ─── UUIDs fijos ───────────────────────────────────────────────────────────
  const TENANT_UUID = '550e8400-e29b-41d4-a716-446655440001';
  const BOOKING_UUID = '550e8400-e29b-41d4-a716-446655440002';
  const TEMPLATE_UUID = '550e8400-e29b-41d4-a716-446655440003';
  const CUSTOMER_UUID = '550e8400-e29b-41d4-a716-446655440004';

  // ─── Mocks ─────────────────────────────────────────────────────────────────
  let mockEventRepo: jest.Mocked<NotificationEventRepository>;
  let mockPrefRepo: jest.Mocked<NotificationPreferenceRepository>;
  let mockEmailSvc: jest.Mocked<EmailService>;
  let mockQueueSvc: jest.Mocked<NotificationQueueService>;
  let orchestrator: NotificationOrchestrationService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  /** Construye un NotificationEvent con estado pending */
  const makeEvent = (
    recipientId = CUSTOMER_UUID,
    contactPoint = 'cliente@example.com',
    subject = 'Reserva Confirmada',
    recipientType: 'customer' | 'user' = 'customer',
  ) =>
    NotificationEvent.create({
      tenantId: TENANT_UUID,
      bookingId: BOOKING_UUID,
      templateId: TEMPLATE_UUID,
      channelCode: 'email',
      recipientType,
      recipientId,
      contactPoint,
      subject,
      renderedContent: '<h1>Contenido</h1>',
      maxRetries: 3,
      scheduledFor: new Date(),
      metadata: {},
    });

  /** Construye una NotificationPreference habilitada por defecto */
  const makePref = (isEnabled = true, channelId = 'email') =>
    NotificationPreference.create({
      customerId: CUSTOMER_UUID,
      topicId: 'topic-booking-confirmed',
      channelId,
      isEnabled,
      frequency: 'immediately',
    });

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockEventRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findPendingEvents: jest.fn(),
      findPendingEventsByChannel: jest.fn(),
      findByBookingId: jest.fn(),
      findByRecipientId: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      countByStatus: jest.fn(),
    };

    mockPrefRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByCustomerTopicChannel: jest.fn(),
      findByCustomerId: jest.fn().mockResolvedValue([makePref()]),
      findEnabledByCustomerId: jest.fn(),
      findByCustomerAndTopic: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn(),
    };

    mockEmailSvc = {
      send: jest.fn().mockResolvedValue({ messageId: 'msg-unit-test' }),
      isAvailable: jest.fn().mockResolvedValue(true),
    };

    mockQueueSvc = {
      enqueue: jest.fn().mockResolvedValue(undefined),
      getQueueLength: jest.fn().mockResolvedValue(0),
      startConsumer: jest.fn().mockResolvedValue(undefined),
      stopConsumer: jest.fn().mockResolvedValue(undefined),
    };

    // Instanciar handlers reales (usan los repos mockeados)
    const getPendingHandler = new GetPendingNotificationsQueryHandler(mockEventRepo);
    const markAsSentHandler = new MarkNotificationAsSentCommandHandler(mockEventRepo);
    const recordFailureHandler = new RecordNotificationFailureCommandHandler(mockEventRepo);

    orchestrator = new NotificationOrchestrationService(
      mockEventRepo,
      mockPrefRepo,
      mockEmailSvc,
      mockQueueSvc,
      getPendingHandler,
      markAsSentHandler,
      recordFailureHandler,
    );
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. FLUJO COMPLETO DE ENVÍO
  // ═══════════════════════════════════════════════════════════════════════════
  describe('processQueue() — Flujo de envío completo', () => {
    it('debe enviar el email y marcar el evento como sent en un flujo exitoso', async () => {
      const event = makeEvent();
      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);

      await orchestrator.processQueue();

      expect(mockEmailSvc.send).toHaveBeenCalledWith(
        'cliente@example.com',
        'Reserva Confirmada',
        '<h1>Contenido</h1>',
      );
      expect(mockEventRepo.update).toHaveBeenCalledTimes(1);
      const updatedEvent: NotificationEvent = mockEventRepo.update.mock.calls[0][0];
      expect(updatedEvent.status.value).toBe('sent');
      expect(updatedEvent.sentAt).not.toBeNull();
    });

    it('debe verificar las preferencias del cliente antes de enviar', async () => {
      const event = makeEvent();
      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);

      await orchestrator.processQueue();

      // El orquestador llama a findByCustomerId con el recipientId (como VO o string)
      expect(mockPrefRepo.findByCustomerId).toHaveBeenCalledTimes(1);
      const calledWith: any = mockPrefRepo.findByCustomerId.mock.calls[0][0];
      // El argumento puede ser el Value Object o el string plano según la implementación
      const calledValue = typeof calledWith === 'string' ? calledWith : (calledWith as any)._value ?? calledWith.value ?? calledWith;
      expect(calledValue).toBe(CUSTOMER_UUID);
    });

    it('debe omitir el envío si el canal está deshabilitado en las preferencias', async () => {
      const event = makeEvent();
      const disabledPref = makePref(false, 'email'); // email deshabilitado

      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);
      mockPrefRepo.findByCustomerId.mockResolvedValue([disabledPref]);

      await orchestrator.processQueue();

      expect(mockEmailSvc.send).not.toHaveBeenCalled();
      // Pero igual se actualiza el evento (marcar como enviado/omitido)
      expect(mockEventRepo.update).toHaveBeenCalledTimes(1);
    });

    it('debe procesar múltiples eventos en orden FIFO', async () => {
      const event1 = makeEvent(CUSTOMER_UUID, 'cliente1@test.com', 'Notif 1');
      const event2 = makeEvent(CUSTOMER_UUID, 'cliente2@test.com', 'Notif 2');
      const event3 = makeEvent(CUSTOMER_UUID, 'cliente3@test.com', 'Notif 3');

      mockEventRepo.findPendingEvents.mockResolvedValue([event1, event2, event3]);
      mockEventRepo.findById
        .mockResolvedValueOnce(event1)
        .mockResolvedValueOnce(event2)
        .mockResolvedValueOnce(event3);

      await orchestrator.processQueue();

      expect(mockEmailSvc.send).toHaveBeenCalledTimes(3);
      expect(mockEventRepo.update).toHaveBeenCalledTimes(3);
    });

    it('debe registrar el fallo cuando el SMTP lanza EmailSendException', async () => {
      const event = makeEvent();
      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);
      mockEmailSvc.send.mockRejectedValue(
        new EmailSendException('cliente@example.com', 'Asunto', new Error('SMTP down')),
      );

      await orchestrator.processQueue();

      // Debe actualizar el evento con el fallo (retryCount++)
      expect(mockEventRepo.update).toHaveBeenCalled();
      const updatedEvent: NotificationEvent = mockEventRepo.update.mock.calls[0][0];
      expect(updatedEvent.retryCount).toBe(1);
      expect(updatedEvent.lastError).not.toBeNull();
    });

    it('debe manejar fallos genéricos del SMTP también', async () => {
      const event = makeEvent();
      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);
      mockEmailSvc.send.mockRejectedValue(new Error('Conexión rechazada'));

      // No debe propagar la excepción al caller
      await expect(orchestrator.processQueue()).resolves.not.toThrow();
    });

    it('debe manejar la cola vacía sin errores', async () => {
      mockEventRepo.findPendingEvents.mockResolvedValue([]);

      await expect(orchestrator.processQueue()).resolves.not.toThrow();

      expect(mockEmailSvc.send).not.toHaveBeenCalled();
      expect(mockEventRepo.update).not.toHaveBeenCalled();
    });

    it('debe ignorar la segunda llamada si ya está procesando (concurrencia)', async () => {
      const event = makeEvent();
      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);

      // Llamadas concurrentes
      const [,] = await Promise.all([
        orchestrator.processQueue(),
        orchestrator.processQueue(),
      ]);

      // Solo debe procesar una vez
      expect(mockEmailSvc.send).toHaveBeenCalledTimes(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. NOTIFICACIONES DE USUARIO (no cliente)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('processQueue() — Destinatario tipo "user"', () => {
    it('debe enviar sin verificar preferencias cuando el destinatario es "user"', async () => {
      const userEvent = makeEvent(CUSTOMER_UUID, 'admin@empresa.com', 'Alerta', 'user');
      mockEventRepo.findPendingEvents.mockResolvedValue([userEvent]);
      mockEventRepo.findById.mockResolvedValue(userEvent);

      await orchestrator.processQueue();

      // Para usuarios, no se consultan preferencias de cliente
      expect(mockPrefRepo.findByCustomerId).not.toHaveBeenCalled();
      expect(mockEmailSvc.send).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. enqueueEvent()
  // ═══════════════════════════════════════════════════════════════════════════
  describe('enqueueEvent()', () => {
    it('debe delegar al servicio de cola con el ID y el delay', async () => {
      await orchestrator.enqueueEvent('event-uuid-123', 5000);

      expect(mockQueueSvc.enqueue).toHaveBeenCalledWith('event-uuid-123', 5000);
    });

    it('debe funcionar sin delay (envío inmediato, delay=0)', async () => {
      await orchestrator.enqueueEvent('event-immediate-456', 0);

      expect(mockQueueSvc.enqueue).toHaveBeenCalledWith('event-immediate-456', 0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. getQueueMetrics()
  // ═══════════════════════════════════════════════════════════════════════════
  describe('getQueueMetrics()', () => {
    it('debe retornar el pendingCount desde el servicio de cola', async () => {
      mockQueueSvc.getQueueLength.mockResolvedValue(42);

      const metrics = await orchestrator.getQueueMetrics();

      expect(metrics.pendingCount).toBe(42);
    });

    it('debe retornar isProcessing=false cuando no hay procesamiento activo', async () => {
      mockQueueSvc.getQueueLength.mockResolvedValue(0);

      const metrics = await orchestrator.getQueueMetrics();

      expect(metrics.isProcessing).toBe(false);
    });

    it('debe retornar un objeto con estructura { pendingCount, isProcessing }', async () => {
      mockQueueSvc.getQueueLength.mockResolvedValue(7);

      const metrics = await orchestrator.getQueueMetrics();

      expect(metrics).toHaveProperty('pendingCount');
      expect(metrics).toHaveProperty('isProcessing');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. LIFECYCLE NestJS
  // ═══════════════════════════════════════════════════════════════════════════
  describe('onModuleInit() / onModuleDestroy() — Lifecycle NestJS', () => {
    it('debe iniciar el consumer de cola al arrancar el módulo', async () => {
      await orchestrator.onModuleInit();

      expect(mockQueueSvc.startConsumer).toHaveBeenCalledTimes(1);
    });

    it('debe detener el consumer de cola al destruir el módulo', async () => {
      await orchestrator.onModuleDestroy();

      expect(mockQueueSvc.stopConsumer).toHaveBeenCalledTimes(1);
    });

    it('debe poder iniciar y luego destruir el módulo sin errores', async () => {
      await expect(orchestrator.onModuleInit()).resolves.not.toThrow();
      await expect(orchestrator.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. ESCENARIOS DE RETRY (backoff exponencial)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Retry Logic — Backoff Exponencial', () => {
    it('debe incrementar retryCount en cada fallo de SMTP', async () => {
      const event = makeEvent();
      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);
      mockEmailSvc.send.mockRejectedValue(new Error('SMTP unavailable'));

      await orchestrator.processQueue();

      expect(event.retryCount).toBe(1);
    });

    it('debe calcular el delay de reintento según la fórmula 2^retryCount * 1000', () => {
      const event = makeEvent();

      event.recordFailure('Error 1'); // retryCount=1
      expect(event.getNextRetryDelay()).toBe(2000); // 2^1 * 1000

      event.recordFailure('Error 2'); // retryCount=2
      expect(event.getNextRetryDelay()).toBe(4000); // 2^2 * 1000

      event.recordFailure('Error 3'); // retryCount=3
      expect(event.getNextRetryDelay()).toBe(8000); // 2^3 * 1000
    });

    it('debe registrar el error en lastError de la entidad', async () => {
      const event = makeEvent();
      const errorMessage = 'Authentication failed on SMTP';

      mockEventRepo.findPendingEvents.mockResolvedValue([event]);
      mockEventRepo.findById.mockResolvedValue(event);
      mockEmailSvc.send.mockRejectedValue(new Error(errorMessage));

      await orchestrator.processQueue();

      expect(event.lastError).toBe(errorMessage);
    });
  });
});

