import { GetPendingNotificationsQueryHandler } from '../../../src/application/queries/get-pending-notifications.query-handler';
import { NotificationEventRepository } from '../../../src/domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../../src/domain/entities/notification-event.entity';

/**
 * Pruebas Unitarias: GetPendingNotificationsQueryHandler
 *
 * Cubre:
 * - Recuperar eventos pendientes del repositorio
 * - Retornar array vacío si no hay pendientes
 * - Propagar errores del repositorio
 *
 * Nota: UUIDs válidos v4 requeridos por los Value Objects del dominio.
 */
describe('GetPendingNotificationsQueryHandler', () => {
  const TENANT_UUID   = '550e8400-e29b-41d4-a716-446655440001';
  const BOOKING_UUID  = '550e8400-e29b-41d4-a716-446655440002';
  const TEMPLATE_UUID = '550e8400-e29b-41d4-a716-446655440003';
  const CUSTOMER_UUID = '550e8400-e29b-41d4-a716-446655440004';

  let handler: GetPendingNotificationsQueryHandler;
  let mockRepository: jest.Mocked<NotificationEventRepository>;

  const makeEvent = () =>
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
      maxRetries: 3,
      scheduledFor: new Date(),
      metadata: {},
    });

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findPendingEvents: jest.fn(),
      findPendingEventsByChannel: jest.fn(),
      findByBookingId: jest.fn(),
      findByRecipientId: jest.fn(),
      delete: jest.fn(),
      countByStatus: jest.fn(),
    };

    handler = new GetPendingNotificationsQueryHandler(mockRepository);
  });

  it('debe retornar los eventos pendientes del repositorio', async () => {
    const events = [makeEvent(), makeEvent()];
    mockRepository.findPendingEvents.mockResolvedValue(events);

    const result = await handler.execute({});

    expect(mockRepository.findPendingEvents).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result).toEqual(events);
  });

  it('debe retornar array vacío cuando no hay eventos pendientes', async () => {
    mockRepository.findPendingEvents.mockResolvedValue([]);

    const result = await handler.execute({});

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('debe propagar errores del repositorio', async () => {
    mockRepository.findPendingEvents.mockRejectedValue(new Error('Database error'));

    await expect(handler.execute({})).rejects.toThrow('Database error');
  });

  it('debe ser una operación de sólo lectura (no llama save/update)', async () => {
    mockRepository.findPendingEvents.mockResolvedValue([makeEvent()]);

    await handler.execute({});

    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
