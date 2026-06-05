import { NotificationEventRepository } from '../../domain/repositories/notification-event.repository';
import { NotificationEvent } from '../../domain/entities/notification-event.entity';
import { CreateNotificationCommand } from './create-notification.command';

/**
 * CreateNotificationCommandHandler
 * CQS Handler: Maneja la creación de un nuevo evento de notificación
 *
 * Flujo:
 * 1. Recibe comando con datos de notificación
 * 2. Crea entidad de dominio NotificationEvent
 * 3. Persiste en BD via repositorio
 * 4. Retorna ID del evento creado
 *
 * Responsabilidades:
 * - Crear instancia de NotificationEvent
 * - Validar datos via constructores del dominio
 * - Persistir en BD
 */
export class CreateNotificationCommandHandler {
  constructor(
    private readonly notificationEventRepository: NotificationEventRepository,
  ) {}

  async execute(command: CreateNotificationCommand): Promise<string> {
    // Crear entidad de dominio usando factory method
    const event = NotificationEvent.create({
      tenantId: command.tenantId,
      bookingId: command.bookingId,
      templateId: command.templateId,
      channelCode: command.recipientType === 'customer' ? 'email' : 'email', // Por ahora default email
      recipientType: command.recipientType,
      recipientId: command.recipientId,
      contactPoint: command.contactPoint,
      subject: command.subject,
      renderedContent: command.renderedContent,
      maxRetries: command.maxRetries ?? 3,
      scheduledFor: command.scheduledFor,
      metadata: command.metadata ?? {},
    });

    // Persistir en BD
    await this.notificationEventRepository.save(event);

    // Retornar ID para referencia
    return event.id.value;
  }
}
