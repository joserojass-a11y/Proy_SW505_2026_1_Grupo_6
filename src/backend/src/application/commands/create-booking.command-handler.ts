import { randomUUID } from 'crypto';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import { Booking } from '../../domain/entities/booking.entity';
import { BookingId } from '../../domain/value-objects/booking-id.vo';
import { BranchId } from '../../domain/value-objects/branch-id.vo';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { ServiceId } from '../../domain/value-objects/service-id.vo';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { CreateBookingCommand } from './create-booking.command';
import { CreateBookingResponseDto } from '../dtos/create-booking-response.dto';
import { IAvailabilityService } from '../services/availability.interface';

/**
 * CreateBookingCommandHandler
 *
 * This handler implements the critical business logic for booking creation:
 * 1. Validates the booking request
 * 2. Checks availability using the availability service
 * 3. Uses pessimistic locking (SELECT FOR UPDATE) to prevent double bookings
 * 4. Persists the booking if no conflicts are detected
 *
 * The use of pessimistic locking ensures ACID guarantees:
 * - ATOMICITY: The entire transaction succeeds or fails
 * - CONSISTENCY: No double bookings can occur
 * - ISOLATION: Concurrent requests are serialized
 * - DURABILITY: Once committed, the booking is persistent
 */
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { CreateNotificationCommandHandler } from './create-notification.command-handler';

export class CreateBookingCommandHandler {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityService: IAvailabilityService,
    private readonly customerRepository?: CustomerRepository,
    private readonly createNotificationHandler?: CreateNotificationCommandHandler,
    private readonly notificationOrchestrator?: any,
  ) {}

  async execute(command: CreateBookingCommand): Promise<CreateBookingResponseDto> {
    // Create value objects from command
    const tenantId = TenantId.create(command.tenantId);
    const branchId = BranchId.create(command.branchId);
    const serviceId = ServiceId.create(command.serviceId);
    const customerId = CustomerId.create(command.customerId);
    const createdBy = UserId.create(command.createdBy);

    // Validate date range
    if (command.startsAt >= command.endsAt) {
      throw new Error('Invalid date range: starts_at must be before ends_at');
    }

    // Check availability using the availability service
    const isAvailable = await this.availabilityService.checkAvailability(
      command.serviceId,
      command.startsAt,
      command.endsAt,
    );

    if (!isAvailable) {
      throw new Error('Service is not available for the requested time slot');
    }

    // Create the booking aggregate
    const booking = Booking.create({
      id: BookingId.create(randomUUID()),
      tenantId,
      branchId,
      serviceId,
      customerId,
      startsAt: command.startsAt,
      endsAt: command.endsAt,
      customerTimezone: command.customerTimezone,
      sourceChannel: command.sourceChannel,
      notes: command.notes,
      customData: command.customData,
      createdBy,
      status: 'PENDING',
    });

    // Save with pessimistic locking
    // The repository uses SELECT FOR UPDATE to prevent concurrent bookings
    const savedBooking = await (this.bookingRepository as any).createWithLocking(booking);

    // Trigger Notification integration asynchronously/after commit
    if (this.customerRepository && this.createNotificationHandler && this.notificationOrchestrator) {
      this.sendBookingConfirmationNotification(savedBooking).catch((err) => {
        console.error('[CreateBookingCommandHandler] Failed to queue booking notification:', err);
      });
    }

    return new CreateBookingResponseDto(
      savedBooking.id.value,
      savedBooking.status.value,
      savedBooking.startsAt,
      savedBooking.endsAt,
      savedBooking.createdAt!,
    );
  }

  private async sendBookingConfirmationNotification(booking: Booking): Promise<void> {
    try {
      const customer = await this.customerRepository!.findById(booking.customerId);
      if (!customer) {
        console.warn(`[CreateBookingCommandHandler] Customer not found for notification: ${booking.customerId.value}`);
        return;
      }

      const dataSource = (this.bookingRepository as any).dataSource;
      if (!dataSource) {
        console.warn('[CreateBookingCommandHandler] DataSource is missing, cannot resolve template.');
        return;
      }

      const defaultSubject = 'Reserva Confirmada: Cita para {{serviceName}}';
      const defaultTemplate = 'Hola {{customerName}},\n\nTu reserva para el servicio {{serviceName}} ha sido confirmada con éxito.\n\nDetalles:\n- Fecha: {{startsAt}}\n- Estado: Confirmada\n\nGracias por su preferencia.';

      const templateId = await getOrCreateTemplateId(
        dataSource,
        booking.tenantId.value,
        'booking.confirmed',
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
      console.error('[CreateBookingCommandHandler] Error generating booking confirmation notification:', err);
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
