import { MarkNotificationAsSentCommandHandler } from '../../../src/application/commands/mark-notification-as-sent.command-handler';
import { NotificationEventRepository } from '../../../src/domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../../src/domain/entities/notification-event.entity';
import { NotificationNotFoundException } from '../../../src/domain/exceptions/notification-not-found.exception';

/**
 * Pruebas Unitarias: MarkNotificationAsSentCommandHandler
 *
 * Cubre:
 * - Marcar un evento como enviado correctamente
 * - Lanzar NotificationNotFoundException si el evento no existe
 * - Persistir el evento actualizado
 *
 * Nota: UUIDs válidos v4 requeridos por los Value Objects del dominio.
 */
describe('MarkNotificationAsSentCommandHandler', () => {
  const TENANT_UUID   = '550e8400-e29b-41d4-a716-446655440001';
  const BOOKING_UUID  = '550e8400-e29b-41d4-a716-446655440002';
  const TEMPLATE_UUID = '550e8400-e29b-41d4-a716-446655440003';
  const CUSTOMER_UUID = '550e8400-e29b-41d4-a716-446655440004';
  const NULL_UUID     = '00000000-0000-4000-a000-000000000001';

  let handler: MarkNotificationAsSentCommandHandler;
  let mockRepository: jest.Mocked<NotificationEventRepository>;
  let mockEvent: NotificationEvent;

  beforeEach(() => {
    mockEvent = NotificationEvent.create({
      tenantId: TENANT_UUID,
      bookingId: BOOKING_UUID,
      templateId: TEMPLATE_UUID,
      channelCode: 'email',
      recipientType: 'customer',
      recipientId: CUSTOMER_UUID,
      contactPoint: 'cliente@example.com',
      subject: 'Reserva Confirmada',
      renderedContent: '<p>Confirmado</p>',
      maxRetries: 3,
      scheduledFor: new Date(),
      metadata: {},
    });

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

    handler = new MarkNotificationAsSentCommandHandler(mockRepository);
  });

  it('debe marcar el evento como enviado', async () => {
    await handler.execute({ notificationEventId: mockEvent.id.value });

    expect(mockRepository.findById).toHaveBeenCalledWith(mockEvent.id.value);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockEvent.status.value).toBe('sent');
    expect(mockEvent.sentAt).not.toBeNull();
  });

  it('debe lanzar NotificationNotFoundException si el evento no existe', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute({ notificationEventId: NULL_UUID }),
    ).rejects.toThrow(NotificationNotFoundException);

    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('debe persistir el evento con el sentAt actualizado', async () => {
    await handler.execute({ notificationEventId: mockEvent.id.value });

    const updatedEvent: NotificationEvent = (mockRepository.update as jest.Mock).mock.calls[0][0];
    expect(updatedEvent.status.value).toBe('sent');
    expect(updatedEvent.sentAt).toBeInstanceOf(Date);
  });
});
