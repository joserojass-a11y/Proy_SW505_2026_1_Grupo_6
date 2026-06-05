import { CreateNotificationCommandHandler } from '../../../src/application/commands/create-notification.command-handler';
import { NotificationEventRepository } from '../../../src/domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../../src/domain/entities/notification-event.entity';

/**
 * Pruebas Unitarias: CreateNotificationCommandHandler
 *
 * Cubre:
 * - Crear un evento de notificación y persistirlo
 * - Usar maxRetries por defecto (3) si no se provee
 * - Usar metadata vacío por defecto si no se provee
 * - Propagar errores del repositorio
 *
 * Nota: UUIDs válidos v4 requeridos por los Value Objects del dominio.
 */
describe('CreateNotificationCommandHandler', () => {
  const TENANT_UUID   = '550e8400-e29b-41d4-a716-446655440001';
  const BOOKING_UUID  = '550e8400-e29b-41d4-a716-446655440002';
  const TEMPLATE_UUID = '550e8400-e29b-41d4-a716-446655440003';
  const CUSTOMER_UUID = '550e8400-e29b-41d4-a716-446655440004';

  let handler: CreateNotificationCommandHandler;
  let mockRepository: jest.Mocked<NotificationEventRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findPendingEvents: jest.fn(),
      findPendingEventsByChannel: jest.fn(),
      findByBookingId: jest.fn(),
      findByRecipientId: jest.fn(),
      delete: jest.fn(),
      countByStatus: jest.fn(),
    };

    handler = new CreateNotificationCommandHandler(mockRepository);
  });

  it('debe crear un evento de notificación y persistirlo', async () => {
    const command = {
      tenantId: TENANT_UUID,
      bookingId: BOOKING_UUID,
      templateId: TEMPLATE_UUID,
      recipientType: 'customer' as const,
      recipientId: CUSTOMER_UUID,
      contactPoint: 'cliente@example.com',
      subject: 'Reserva Confirmada',
      renderedContent: '<h1>Confirmado</h1>',
      maxRetries: 3,
      scheduledFor: new Date('2026-06-04T14:00:00Z'),
      metadata: { bookingCode: 'BK123' },
    };

    const eventId = await handler.execute(command);

    expect(eventId).toBeDefined();
    expect(typeof eventId).toBe('string');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);

    const savedEvent: NotificationEvent = mockRepository.save.mock.calls[0][0];
    expect(savedEvent.status.value).toBe('pending');
    expect(savedEvent.retryCount).toBe(0);
  });

  it('debe usar maxRetries=3 por defecto si no se provee', async () => {
    await handler.execute({
      tenantId: TENANT_UUID,
      bookingId: null,
      templateId: TEMPLATE_UUID,
      recipientType: 'user' as const,
      recipientId: CUSTOMER_UUID,
      contactPoint: 'admin@example.com',
      subject: 'Alerta',
      renderedContent: '<p>Alerta del sistema</p>',
      scheduledFor: new Date(),
    });

    const saved: NotificationEvent = mockRepository.save.mock.calls[0][0];
    expect(saved.maxRetries).toBe(3);
  });

  it('debe usar metadata vacío por defecto si no se provee', async () => {
    await handler.execute({
      tenantId: TENANT_UUID,
      bookingId: null,
      templateId: TEMPLATE_UUID,
      recipientType: 'customer' as const,
      recipientId: CUSTOMER_UUID,
      contactPoint: 'x@x.com',
      subject: 'Test',
      renderedContent: '<p>Test</p>',
      maxRetries: 3,
      scheduledFor: new Date(),
    });

    const saved: NotificationEvent = mockRepository.save.mock.calls[0][0];
    expect(saved.metadata).toEqual({});
  });

  it('debe propagar errores del repositorio', async () => {
    mockRepository.save = jest.fn().mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute({
        tenantId: TENANT_UUID,
        bookingId: null,
        templateId: TEMPLATE_UUID,
        recipientType: 'customer' as const,
        recipientId: CUSTOMER_UUID,
        contactPoint: 'x@x.com',
        subject: 'Test',
        renderedContent: '<p>Test</p>',
        maxRetries: 3,
        scheduledFor: new Date(),
        metadata: {},
      }),
    ).rejects.toThrow('DB error');
  });
});
