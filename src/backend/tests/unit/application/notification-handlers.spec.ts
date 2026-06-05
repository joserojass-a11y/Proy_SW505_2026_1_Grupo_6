import { CreateNotificationCommandHandler } from '../../../src/application/commands/create-notification.command-handler';
import { MarkNotificationAsSentCommandHandler } from '../../../src/application/commands/mark-notification-as-sent.command-handler';
import { RecordNotificationFailureCommandHandler } from '../../../src/application/commands/record-notification-failure.command-handler';
import { CreateNotificationPreferenceCommandHandler } from '../../../src/application/commands/create-notification-preference.command-handler';
import { UpdateNotificationPreferenceCommandHandler } from '../../../src/application/commands/update-notification-preference.command-handler';
import { GetPendingNotificationsQueryHandler } from '../../../src/application/queries/get-pending-notifications.query-handler';
import { GetCustomerPreferencesQueryHandler } from '../../../src/application/queries/get-customer-preferences.query-handler';
import { GetNotificationHistoryQueryHandler } from '../../../src/application/queries/get-notification-history.query-handler';

import { NotificationEvent } from '../../../src/domain/entities/notification-event.entity';
import { NotificationPreference } from '../../../src/domain/entities/notification-preference.entity';
import { NotificationEventRepository } from '../../../src/domain/repositories/notification-event.repository';
import { NotificationPreferenceRepository } from '../../../src/domain/repositories/notification-preference.repository';

import { NotificationNotFoundException } from '../../../src/domain/exceptions/notification-not-found.exception';
import { DuplicateNotificationPreferenceException } from '../../../src/domain/exceptions/duplicate-notification-preference.exception';
import { MaxRetriesExceededException } from '../../../src/domain/exceptions/max-retries-exceeded.exception';

/**
 * Pruebas Unitarias: CQS Handlers del módulo de Notificaciones (Fase 4)
 *
 * Cubre (Commands):
 * - CreateNotificationCommandHandler           → Crear evento de notificación
 * - MarkNotificationAsSentCommandHandler       → Marcar evento como enviado
 * - RecordNotificationFailureCommandHandler    → Registrar fallo con reintentos
 * - CreateNotificationPreferenceCommandHandler → Crear preferencia de cliente
 * - UpdateNotificationPreferenceCommandHandler → Actualizar preferencia existente
 *
 * Cubre (Queries):
 * - GetPendingNotificationsQueryHandler → Obtener cola de envío pendiente
 * - GetCustomerPreferencesQueryHandler  → Obtener preferencias de un cliente
 * - GetNotificationHistoryQueryHandler  → Historial de notificaciones del recipient
 *
 * Patrón: Repository mocking vía jest.fn() — sin base de datos real.
 */
describe('CQS Handlers — Módulo Notificaciones (Fase 4)', () => {
  // UUIDs fijos para facilitar aserciones
  const TENANT_UUID    = '550e8400-e29b-41d4-a716-446655440001';
  const BOOKING_UUID   = '550e8400-e29b-41d4-a716-446655440002';
  const TEMPLATE_UUID  = '550e8400-e29b-41d4-a716-446655440003';
  const CUSTOMER_UUID  = '550e8400-e29b-41d4-a716-446655440004';
  const TOPIC_UUID     = '550e8400-e29b-41d4-a716-446655440005';
  const CHANNEL_UUID   = '550e8400-e29b-41d4-a716-446655440006';

  /** Construye un NotificationEvent en estado pending para reutilizar */
  const makeEvent = (overrides: Partial<Parameters<typeof NotificationEvent.create>[0]> = {}) =>
    NotificationEvent.create({
      tenantId: TENANT_UUID,
      bookingId: BOOKING_UUID,
      templateId: TEMPLATE_UUID,
      channelCode: 'email',
      recipientType: 'customer',
      recipientId: CUSTOMER_UUID,
      contactPoint: 'cliente@example.com',
      subject: 'Reserva Confirmada',
      renderedContent: '<h1>Tu reserva fue confirmada</h1>',
      maxRetries: 3,
      scheduledFor: new Date(),
      metadata: {},
      ...overrides,
    });

  // ─────────────────────────────────────────────────────────────────────
  // Mock repositories
  // ─────────────────────────────────────────────────────────────────────
  let mockEventRepo: jest.Mocked<NotificationEventRepository>;
  let mockPrefRepo: jest.Mocked<NotificationPreferenceRepository>;

  beforeEach(() => {
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
      findByCustomerId: jest.fn(),
      findEnabledByCustomerId: jest.fn(),
      findByCustomerAndTopic: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn(),
    };
  });

  // ═════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═════════════════════════════════════════════════════════════════════

  describe('CreateNotificationCommandHandler', () => {
    let handler: CreateNotificationCommandHandler;

    beforeEach(() => {
      handler = new CreateNotificationCommandHandler(mockEventRepo);
    });

    it('debe crear un evento de notificación y retornar su ID', async () => {
      const result = await handler.execute({
        tenantId: TENANT_UUID,
        bookingId: BOOKING_UUID,
        templateId: TEMPLATE_UUID,
        recipientType: 'customer',
        recipientId: CUSTOMER_UUID,
        contactPoint: 'cliente@example.com',
        subject: 'Reserva Confirmada',
        renderedContent: '<h1>Tu reserva fue confirmada</h1>',
        scheduledFor: new Date(),
        maxRetries: 3,
        metadata: {},
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(mockEventRepo.save).toHaveBeenCalledTimes(1);

      const savedEvent: NotificationEvent = mockEventRepo.save.mock.calls[0][0];
      expect(savedEvent.status.value).toBe('pending');
      expect(savedEvent.retryCount).toBe(0);
    });

    it('debe respetar maxRetries=5 al crear el evento', async () => {
      await handler.execute({
        tenantId: TENANT_UUID,
        bookingId: null,
        templateId: TEMPLATE_UUID,
        recipientType: 'user',
        recipientId: CUSTOMER_UUID,
        contactPoint: 'admin@example.com',
        subject: 'Alerta',
        renderedContent: '<p>Alerta del sistema</p>',
        scheduledFor: new Date(),
        maxRetries: 5,
      });

      const saved: NotificationEvent = mockEventRepo.save.mock.calls[0][0];
      expect(saved.maxRetries).toBe(5);
    });

    it('debe usar maxRetries=3 por defecto cuando no se proporciona', async () => {
      await handler.execute({
        tenantId: TENANT_UUID,
        bookingId: null,
        templateId: TEMPLATE_UUID,
        recipientType: 'customer',
        recipientId: CUSTOMER_UUID,
        contactPoint: 'x@x.com',
        subject: null,
        renderedContent: '<p>Hola</p>',
        scheduledFor: new Date(),
      });

      const saved: NotificationEvent = mockEventRepo.save.mock.calls[0][0];
      expect(saved.maxRetries).toBe(3);
    });

    it('debe soportar bookingId=null para notificaciones generales', async () => {
      await handler.execute({
        tenantId: TENANT_UUID,
        bookingId: null,
        templateId: TEMPLATE_UUID,
        recipientType: 'customer',
        recipientId: CUSTOMER_UUID,
        contactPoint: 'x@x.com',
        subject: 'General',
        renderedContent: '<p>Notificación general</p>',
        scheduledFor: new Date(),
      });

      const saved: NotificationEvent = mockEventRepo.save.mock.calls[0][0];
      expect(saved.bookingId).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────

  describe('MarkNotificationAsSentCommandHandler', () => {
    let handler: MarkNotificationAsSentCommandHandler;

    beforeEach(() => {
      handler = new MarkNotificationAsSentCommandHandler(mockEventRepo);
    });

    it('debe marcar el evento como enviado y actualizar en BD', async () => {
      const event = makeEvent();
      mockEventRepo.findById.mockResolvedValue(event);

      await handler.execute({ notificationEventId: event.id.value });

      expect(event.status.value).toBe('sent');
      expect(event.sentAt).not.toBeNull();
      expect(mockEventRepo.update).toHaveBeenCalledWith(event);
    });

    it('debe lanzar NotificationNotFoundException si el evento no existe', async () => {
      mockEventRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute({ notificationEventId: '00000000-0000-4000-a000-000000000000' }),
      ).rejects.toThrow(NotificationNotFoundException);

      expect(mockEventRepo.update).not.toHaveBeenCalled();
    });

    it('debe lanzar Error al intentar marcar como sent un evento ya enviado', async () => {
      const event = makeEvent();
      event.markAsSent(); // ya está sent

      mockEventRepo.findById.mockResolvedValue(event);

      await expect(
        handler.execute({ notificationEventId: event.id.value }),
      ).rejects.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────

  describe('RecordNotificationFailureCommandHandler', () => {
    let handler: RecordNotificationFailureCommandHandler;

    beforeEach(() => {
      handler = new RecordNotificationFailureCommandHandler(mockEventRepo);
    });

    it('debe registrar el primer fallo e incrementar retryCount', async () => {
      const event = makeEvent({ maxRetries: 3 });
      mockEventRepo.findById.mockResolvedValue(event);

      await handler.execute({
        notificationEventId: event.id.value,
        error: 'SMTP connection refused',
      });

      expect(event.retryCount).toBe(1);
      expect(event.lastError).toBe('SMTP connection refused');
      expect(mockEventRepo.update).toHaveBeenCalledWith(event);
    });

    it('debe lanzar MaxRetriesExceededException cuando se agotan los reintentos', async () => {
      const event = makeEvent({ maxRetries: 2 });
      event.recordFailure('Error 1');
      event.recordFailure('Error 2');

      mockEventRepo.findById.mockResolvedValue(event);

      await expect(
        handler.execute({
          notificationEventId: event.id.value,
          error: 'Error 3 — agota los reintentos',
        }),
      ).rejects.toThrow(MaxRetriesExceededException);
    });

    it('debe lanzar NotificationNotFoundException si el evento no existe', async () => {
      mockEventRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute({
          notificationEventId: '00000000-0000-4000-a000-000000000001',
          error: 'Error',
        }),
      ).rejects.toThrow(NotificationNotFoundException);
    });

    it('debe acumular reintentos sucesivos correctamente', async () => {
      const event = makeEvent({ maxRetries: 5 });
      mockEventRepo.findById.mockResolvedValue(event);

      const errors = ['Timeout 1', 'Timeout 2', 'Timeout 3'];
      for (const err of errors) {
        await handler.execute({ notificationEventId: event.id.value, error: err });
      }

      expect(event.retryCount).toBe(3);
      expect(event.lastError).toBe('Timeout 3');
    });
  });

  // ─────────────────────────────────────────────────────────────────────

  describe('CreateNotificationPreferenceCommandHandler', () => {
    let handler: CreateNotificationPreferenceCommandHandler;

    beforeEach(() => {
      handler = new CreateNotificationPreferenceCommandHandler(mockPrefRepo);
    });

    it('debe crear preferencia y retornar su ID', async () => {
      mockPrefRepo.findByCustomerTopicChannel.mockResolvedValue(null);

      const result = await handler.execute({
        customerId: CUSTOMER_UUID,
        topicId: TOPIC_UUID,
        channelId: CHANNEL_UUID,
        isEnabled: true,
        frequency: 'immediately',
      });

      expect(typeof result).toBe('string');
      expect(mockPrefRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe aplicar isEnabled=true por defecto', async () => {
      mockPrefRepo.findByCustomerTopicChannel.mockResolvedValue(null);

      await handler.execute({
        customerId: CUSTOMER_UUID,
        topicId: TOPIC_UUID,
        channelId: CHANNEL_UUID,
      });

      const saved: NotificationPreference = mockPrefRepo.save.mock.calls[0][0];
      expect(saved.isEnabled).toBe(true);
      expect(saved.frequency).toBe('immediately');
    });

    it('debe lanzar DuplicateNotificationPreferenceException si ya existe', async () => {
      const existing = NotificationPreference.create({
        customerId: CUSTOMER_UUID,
        topicId: TOPIC_UUID,
        channelId: CHANNEL_UUID,
      });
      mockPrefRepo.findByCustomerTopicChannel.mockResolvedValue(existing);

      await expect(
        handler.execute({
          customerId: CUSTOMER_UUID,
          topicId: TOPIC_UUID,
          channelId: CHANNEL_UUID,
        }),
      ).rejects.toThrow(DuplicateNotificationPreferenceException);

      expect(mockPrefRepo.save).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────

  describe('UpdateNotificationPreferenceCommandHandler', () => {
    let handler: UpdateNotificationPreferenceCommandHandler;

    beforeEach(() => {
      handler = new UpdateNotificationPreferenceCommandHandler(mockPrefRepo);
    });

    it('debe deshabilitar la preferencia correctamente', async () => {
      const pref = NotificationPreference.create({
        customerId: CUSTOMER_UUID,
        topicId: TOPIC_UUID,
        channelId: CHANNEL_UUID,
        isEnabled: true,
      });
      mockPrefRepo.findById.mockResolvedValue(pref);

      await handler.execute({ preferenceId: pref.id, isEnabled: false });

      expect(pref.isEnabled).toBe(false);
      expect(mockPrefRepo.update).toHaveBeenCalledWith(pref);
    });

    it('debe cambiar la frecuencia a "weekly"', async () => {
      const pref = NotificationPreference.create({
        customerId: CUSTOMER_UUID,
        topicId: TOPIC_UUID,
        channelId: CHANNEL_UUID,
      });
      mockPrefRepo.findById.mockResolvedValue(pref);

      await handler.execute({ preferenceId: pref.id, frequency: 'weekly' });

      expect(pref.frequency).toBe('weekly');
    });

    it('debe lanzar NotificationNotFoundException si la preferencia no existe', async () => {
      mockPrefRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute({ preferenceId: '00000000-0000-4000-a000-000000000002' }),
      ).rejects.toThrow(NotificationNotFoundException);
    });

    it('debe actualizar tanto isEnabled como frequency en una sola llamada', async () => {
      const pref = NotificationPreference.create({
        customerId: CUSTOMER_UUID,
        topicId: TOPIC_UUID,
        channelId: CHANNEL_UUID,
        isEnabled: true,
        frequency: 'immediately',
      });
      mockPrefRepo.findById.mockResolvedValue(pref);

      await handler.execute({ preferenceId: pref.id, isEnabled: false, frequency: 'daily' });

      expect(pref.isEnabled).toBe(false);
      expect(pref.frequency).toBe('daily');
      expect(mockPrefRepo.update).toHaveBeenCalledTimes(1);
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // QUERIES
  // ═════════════════════════════════════════════════════════════════════

  describe('GetPendingNotificationsQueryHandler', () => {
    let handler: GetPendingNotificationsQueryHandler;

    beforeEach(() => {
      handler = new GetPendingNotificationsQueryHandler(mockEventRepo);
    });

    it('debe retornar el array de eventos pendientes del repositorio', async () => {
      const events = [makeEvent(), makeEvent()];
      mockEventRepo.findPendingEvents.mockResolvedValue(events);

      const result = await handler.execute({});

      expect(result).toHaveLength(2);
      expect(mockEventRepo.findPendingEvents).toHaveBeenCalledTimes(1);
    });

    it('debe retornar array vacío cuando no hay eventos pendientes', async () => {
      mockEventRepo.findPendingEvents.mockResolvedValue([]);

      const result = await handler.execute({});

      expect(result).toEqual([]);
    });

    it('debe delegar al repositorio sin modificar el estado', async () => {
      const events = [makeEvent()];
      mockEventRepo.findPendingEvents.mockResolvedValue(events);

      await handler.execute({});

      // Query no modifica: save y update NO deben ser llamados
      expect(mockEventRepo.save).not.toHaveBeenCalled();
      expect(mockEventRepo.update).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────

  describe('GetCustomerPreferencesQueryHandler', () => {
    let handler: GetCustomerPreferencesQueryHandler;

    beforeEach(() => {
      handler = new GetCustomerPreferencesQueryHandler(mockPrefRepo);
    });

    it('debe retornar las preferencias del cliente especificado', async () => {
      const prefs = [
        NotificationPreference.create({ customerId: CUSTOMER_UUID, topicId: TOPIC_UUID, channelId: CHANNEL_UUID }),
        NotificationPreference.create({ customerId: CUSTOMER_UUID, topicId: TOPIC_UUID, channelId: CHANNEL_UUID }),
      ];
      mockPrefRepo.findByCustomerId.mockResolvedValue(prefs);

      const result = await handler.execute({ customerId: CUSTOMER_UUID });

      expect(result).toHaveLength(2);
      expect(mockPrefRepo.findByCustomerId).toHaveBeenCalledWith(CUSTOMER_UUID);
    });

    it('debe retornar array vacío si el cliente no tiene preferencias', async () => {
      mockPrefRepo.findByCustomerId.mockResolvedValue([]);

      const result = await handler.execute({ customerId: CUSTOMER_UUID });

      expect(result).toEqual([]);
    });

    it('debe retornar tanto preferencias habilitadas como deshabilitadas', async () => {
      const pref1 = NotificationPreference.create({
        customerId: CUSTOMER_UUID, topicId: TOPIC_UUID, channelId: CHANNEL_UUID, isEnabled: true,
      });
      const pref2 = NotificationPreference.create({
        customerId: CUSTOMER_UUID, topicId: TOPIC_UUID, channelId: CHANNEL_UUID, isEnabled: false,
      });
      mockPrefRepo.findByCustomerId.mockResolvedValue([pref1, pref2]);

      const result = await handler.execute({ customerId: CUSTOMER_UUID });

      expect(result).toHaveLength(2);
      expect(result.some((p) => p.isEnabled)).toBe(true);
      expect(result.some((p) => !p.isEnabled)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────

  describe('GetNotificationHistoryQueryHandler', () => {
    let handler: GetNotificationHistoryQueryHandler;

    beforeEach(() => {
      handler = new GetNotificationHistoryQueryHandler(mockEventRepo);
    });

    it('debe retornar el historial de notificaciones del destinatario', async () => {
      const history = [makeEvent(), makeEvent()];
      mockEventRepo.findByRecipientId.mockResolvedValue(history);

      const result = await handler.execute({ recipientId: CUSTOMER_UUID });

      expect(result).toHaveLength(2);
      expect(mockEventRepo.findByRecipientId).toHaveBeenCalledWith(CUSTOMER_UUID);
    });

    it('debe soportar límite opcional en la consulta', async () => {
      const history = [makeEvent()];
      mockEventRepo.findByRecipientId.mockResolvedValue(history);

      const result = await handler.execute({ recipientId: CUSTOMER_UUID, limit: 10 });

      expect(result).toHaveLength(1);
    });

    it('debe retornar array vacío si el destinatario no tiene historial', async () => {
      mockEventRepo.findByRecipientId.mockResolvedValue([]);

      const result = await handler.execute({ recipientId: CUSTOMER_UUID });

      expect(result).toEqual([]);
    });

    it('debe incluir eventos de todos los estados (sent, failed, pending)', async () => {
      const pendingEvent = makeEvent();
      const sentEvent    = makeEvent();
      sentEvent.markAsSent();
      const failedEvent  = makeEvent({ maxRetries: 1 });
      try { failedEvent.recordFailure('e1'); failedEvent.recordFailure('e2'); } catch (_) { /* ignorar MaxRetries */ }

      mockEventRepo.findByRecipientId.mockResolvedValue([pendingEvent, sentEvent, failedEvent]);

      const result = await handler.execute({ recipientId: CUSTOMER_UUID });
      expect(result).toHaveLength(3);
    });
  });
});


