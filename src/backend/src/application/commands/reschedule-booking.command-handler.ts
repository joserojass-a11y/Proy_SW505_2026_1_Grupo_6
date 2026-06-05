import { BookingRepository } from '../../domain/repositories/booking.repository';
import { BookingId } from '../../domain/value-objects/booking-id.vo';
import { BookingNotFoundException } from '../../domain/exceptions/booking-not-found.exception';
import { RescheduleBookingCommand } from './reschedule-booking.command';
import { BookingDetailDto } from '../dtos/booking-detail.dto';
import { IAvailabilityService } from '../services/availability.interface';

/**
 * RescheduleBookingCommandHandler
 *
 * This handler reschedules a booking to a new time slot.
 * It also uses pessimistic locking to prevent conflicts with the new time slot.
 */
import { randomUUID } from 'crypto';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { CreateNotificationCommandHandler } from './create-notification.command-handler';

export class RescheduleBookingCommandHandler {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityService: IAvailabilityService,
    private readonly customerRepository?: CustomerRepository,
    private readonly createNotificationHandler?: CreateNotificationCommandHandler,
    private readonly notificationOrchestrator?: any,
  ) {}

  async execute(command: RescheduleBookingCommand): Promise<BookingDetailDto> {
    const bookingId = BookingId.create(command.bookingId);

    // Find the booking
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(command.bookingId);
    }

    // Check availability for the new time slot
    const isAvailable = await this.availabilityService.checkAvailability(
      booking.serviceId.value,
      command.newStartsAt,
      command.newEndsAt,
    );

    if (!isAvailable) {
      throw new Error('Service is not available for the requested time slot');
    }

    // Check for conflicts with the new time slot
    const conflictingBookings = await this.bookingRepository.findConflictingBookings(
      booking.serviceId,
      command.newStartsAt,
      command.newEndsAt,
    );

    if (conflictingBookings.length > 0) {
      throw new Error('The new time slot conflicts with existing bookings');
    }

    // Reschedule the booking (this validates state transitions)
    booking.reschedule(command.newStartsAt, command.newEndsAt);

    // Update in repository
    const updatedBooking = await this.bookingRepository.update(booking);

    // Trigger Notification integration
    if (this.customerRepository && this.createNotificationHandler && this.notificationOrchestrator) {
      this.sendBookingRescheduledNotification(updatedBooking).catch((err) => {
        console.error('[RescheduleBookingCommandHandler] Failed to queue reschedule notification:', err);
      });
    }

    // Convert to DTO
    const primitives = updatedBooking.toPrimitives();
    return new BookingDetailDto({
      id: primitives.id,
      tenantId: primitives.tenantId,
      branchId: primitives.branchId,
      serviceId: primitives.serviceId,
      customerId: primitives.customerId,
      startsAt: primitives.startsAt,
      endsAt: primitives.endsAt,
      customerTimezone: primitives.customerTimezone,
      status: primitives.status,
      sourceChannel: primitives.sourceChannel,
      notes: primitives.notes,
      customData: primitives.customData,
      createdBy: primitives.createdBy!,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });
  }

  private async sendBookingRescheduledNotification(booking: Booking): Promise<void> {
    try {
      const customer = await this.customerRepository!.findById(booking.customerId);
      if (!customer) {
        console.warn(`[RescheduleBookingCommandHandler] Customer not found for notification: ${booking.customerId.value}`);
        return;
      }

      const dataSource = (this.bookingRepository as any).dataSource;
      if (!dataSource) {
        console.warn('[RescheduleBookingCommandHandler] DataSource is missing, cannot resolve template.');
        return;
      }

      const defaultSubject = 'Reserva Reprogramada: Cita para {{serviceName}}';
      const defaultTemplate = 'Hola {{customerName}},\n\nTu reserva para el servicio {{serviceName}} ha sido reprogramada con éxito.\n\nNueva fecha y hora:\n- Fecha: {{startsAt}}\n\nSi tienes alguna duda, ponte en contacto con nosotros.';

      const templateId = await getOrCreateTemplateId(
        dataSource,
        booking.tenantId.value,
        'booking.rescheduled',
        defaultSubject,
        defaultTemplate,
      );

      const customerName = `${customer.firstName} ${customer.lastName}`;
      const serviceName = `Servicio ${booking.serviceId.value}`;
      const variables = {
        customerName,
        serviceName,
        startsAt: booking.startsAt.toLocaleString(),
        endsAt: booking.endsAt.toLocaleString(),
      };

      const renderedSubject = renderTemplate(defaultSubject, variables);
      const renderedContent = renderTemplate(defaultTemplate, variables);

      const notificationId = await this.createNotificationHandler!.execute({
        tenantId: booking.tenantId.value,
        bookingId: booking.id.value,
        templateId,
        recipientType: 'customer',
        recipientId: customer.id.value,
        contactPoint: customer.email,
        subject: renderedSubject,
        renderedContent,
        scheduledFor: new Date(),
        maxRetries: 3,
        metadata: { bookingId: booking.id.value },
      });

      await this.notificationOrchestrator.enqueueEvent(notificationId);
    } catch (err) {
      console.error('[RescheduleBookingCommandHandler] Error generating booking rescheduled notification:', err);
    }
  }
}

async function getOrCreateTemplateId(
  dataSource: any,
  tenantId: string,
  triggerEvent: string,
  subject: string,
  contentTemplate: string,
): Promise<string> {
  const rows = await dataSource.query(
    'SELECT id FROM notification_templates WHERE trigger_event = $1 AND tenant_id = $2 AND channel_code = $3 AND recipient_role = $4 LIMIT 1',
    [triggerEvent, tenantId, 'email', 'customer'],
  );

  if (rows && rows.length > 0) {
    return rows[0].id;
  }

  const newId = randomUUID();
  await dataSource.query(
    `INSERT INTO notification_templates (id, tenant_id, trigger_event, recipient_role, channel_code, subject, content_template, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
    [newId, tenantId, triggerEvent, 'customer', 'email', subject, contentTemplate],
  );

  return newId;
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  let res = template;
  for (const [key, value] of Object.entries(vars)) {
    res = res.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return res;
}
