import { RecordNotificationFailureCommandHandler } from '../../../src/application/commands/record-notification-failure.command-handler';
import { NotificationEventRepository } from '../../../src/domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../../src/domain/entities/notification-event.entity';
import { NotificationNotFoundException } from '../../../src/domain/exceptions/notification-not-found.exception';
import { MaxRetriesExceededException } from '../../../src/domain/exceptions/max-retries-exceeded.exception';

/**
 * Pruebas Unitarias: RecordNotificationFailureCommandHandler
 *
 * Cubre:
 * - Registrar fallo e incrementar retryCount
 * - Persistir el evento fallido
 * - Lanzar NotificationNotFoundException si no existe el evento
 * - Lanzar MaxRetriesExceededException al agotar reintentos
 *
 * Nota: UUIDs válidos v4 requeridos por los Value Objects del dominio.
 */
describe('RecordNotificationFailureCommandHandler', () => {
  const TENANT_UUID   = '550e8400-e29b-41d4-a716-446655440001';
  const BOOKING_UUID  = '550e8400-e29b-41d4-a716-446655440002';
  const TEMPLATE_UUID = '550e8400-e29b-41d4-a716-446655440003';
  const CUSTOMER_UUID = '550e8400-e29b-41d4-a716-446655440004';
  const NULL_UUID     = '00000000-0000-4000-a000-000000000001';

  let handler: RecordNotificationFailureCommandHandler;
  let mockRepository: jest.Mocked<NotificationEventRepository>;
  let mockEvent: NotificationEvent;

  const makeEvent = (maxRetries = 3) =>
    NotificationEvent.create({
      tenantId: TENANT_UUID,
      bookingId: BOOKING_UUID,
      templateId: TEMPLATE_UUID,
      channelCode: 'email',
      recipientType: 'customer',
      recipientId: CUSTOMER_UUID,
      contactPoint: 'cliente@example.com',
      subject: 'Reserva Confirmada',
      renderedContent: '<p>Confirmado</p>',
      maxRetries,
      scheduledFor: new Date(),
      metadata: {},
    });

  beforeEach(() => {
    mockEvent = makeEvent(3);

    mockRepository = {
      save: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(mockEvent),
      findPendingEvents: jest.fn(),
      findPendingEventsByChannel: jest.fn(),
      findByBookingId: jest.fn(),
      findByRecipientId: jest.fn(),
      delete: jest.fn(),
      countByStatus: jest.fn(),
    };

    handler = new RecordNotificationFailureCommandHandler(mockRepository);
  });

  it('debe registrar el fallo e incrementar retryCount', async () => {
    await handler.execute({
      notificationEventId: mockEvent.id.value,
      error: 'SMTP connection timeout',
    });

    expect(mockRepository.findById).toHaveBeenCalledWith(mockEvent.id.value);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockEvent.retryCount).toBe(1);
    expect(mockEvent.lastError).toBe('SMTP connection timeout');
  });

  it('debe persistir el evento con status "failed" tras el fallo', async () => {
    await handler.execute({
      notificationEventId: mockEvent.id.value,
      error: 'Connection refused',
    });

    const updatedEvent = (mockRepository.update as jest.Mock).mock.calls[0][0];
    expect(updatedEvent.retryCount).toBe(1);
    expect(updatedEvent.lastError).toBe('Connection refused');
    expect(updatedEvent.status.value).toBe('failed');
  });

  it('debe lanzar NotificationNotFoundException si el evento no existe', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute({ notificationEventId: NULL_UUID, error: 'Error' }),
    ).rejects.toThrow(NotificationNotFoundException);

    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('debe lanzar MaxRetriesExceededException al agotar los reintentos', async () => {
    const limitedEvent = makeEvent(1);
    mockRepository.findById.mockResolvedValue(limitedEvent);

    // Primer fallo — debe registrarse correctamente
    await handler.execute({ notificationEventId: limitedEvent.id.value, error: 'Fallo 1' });
    expect(limitedEvent.retryCount).toBe(1);

    // Segundo fallo — supera maxRetries
    await expect(
      handler.execute({ notificationEventId: limitedEvent.id.value, error: 'Fallo 2' }),
    ).rejects.toThrow(MaxRetriesExceededException);

    expect(limitedEvent.status.value).toBe('failed');
  });
});
