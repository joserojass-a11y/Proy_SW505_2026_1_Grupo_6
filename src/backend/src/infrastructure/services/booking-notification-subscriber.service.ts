import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEventPublisher } from '../../shared/domain-event-publisher';
import { BookingConfirmedEvent } from '../../domain/events/booking-confirmed.event';
import { BookingRescheduledEvent } from '../../domain/events/booking-rescheduled.event';
import { BookingCancelledEvent } from '../../domain/events/booking-cancelled.event';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { CreateNotificationCommandHandler } from '../../application/commands/create-notification.command-handler';
import { Booking } from '../../domain/entities/booking.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class BookingNotificationSubscriber implements OnModuleInit {
  constructor(
    @Inject(INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly createNotificationHandler: CreateNotificationCommandHandler,
    @Inject(INFRASTRUCTURE_TOKENS.NOTIFICATION_ORCHESTRATION_SERVICE)
    private readonly notificationOrchestrator: any,
  ) {}

  onModuleInit(): void {
    DomainEventPublisher.subscribe(BookingConfirmedEvent, async (event) => {
      await this.sendBookingConfirmationNotification(event.booking);
    });

    DomainEventPublisher.subscribe(BookingRescheduledEvent, async (event) => {
      await this.sendBookingRescheduledNotification(event.booking);
    });

    DomainEventPublisher.subscribe(BookingCancelledEvent, async (event) => {
      await this.sendBookingCancelledNotification(event.booking);
    });
  }

  private async sendBookingConfirmationNotification(booking: Booking): Promise<void> {
    try {
      const customer = await this.customerRepository.findById(booking.customerId);
      if (!customer) {
        console.warn(`[BookingNotificationSubscriber] Customer not found for notification: ${booking.customerId.value}`);
        return;
      }

      const dataSource = (this.customerRepository as any).dataSource;
      if (!dataSource) {
        console.warn('[BookingNotificationSubscriber] DataSource is missing, cannot resolve template.');
        return;
      }

      const defaultSubject = 'Reserva Confirmada: Cita para {{serviceName}}';
      const defaultTemplate = 'Hola {{customerName}},\n\nTu reserva para el servicio {{serviceName}} ha sido confirmada con éxito.\n\nDetalles:\n- Fecha: {{startsAt}}\n- Estado: Confirmada\n\nGracias por su preferencia.';

      const templateId = await this.getOrCreateTemplateId(
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

      const renderedSubject = this.renderTemplate(defaultSubject, variables);
      const renderedContent = this.renderTemplate(defaultTemplate, variables);

      const notificationId = await this.createNotificationHandler.execute({
        tenantId: booking.tenantId.value,
        bookingId: booking.id.value,
        templateId,
        recipientType: 'customer',
        recipientId: customer.id.value,
        contactPoint: customer.email.value,
        subject: renderedSubject,
        renderedContent,
        scheduledFor: new Date(),
        maxRetries: 3,
        metadata: { bookingId: booking.id.value },
      });

      await this.notificationOrchestrator.enqueueEvent(notificationId);
    } catch (err) {
      console.error('[BookingNotificationSubscriber] Error generating booking confirmation notification:', err);
    }
  }

  private async sendBookingRescheduledNotification(booking: Booking): Promise<void> {
    try {
      const customer = await this.customerRepository.findById(booking.customerId);
      if (!customer) {
        console.warn(`[BookingNotificationSubscriber] Customer not found for notification: ${booking.customerId.value}`);
        return;
      }

      const dataSource = (this.customerRepository as any).dataSource;
      if (!dataSource) {
        console.warn('[BookingNotificationSubscriber] DataSource is missing, cannot resolve template.');
        return;
      }

      const defaultSubject = 'Reserva Reprogramada: Cita para {{serviceName}}';
      const defaultTemplate = 'Hola {{customerName}},\n\nTu reserva para el servicio {{serviceName}} ha sido reprogramada con éxito.\n\nNueva fecha y hora:\n- Fecha: {{startsAt}}\n\nSi tienes alguna duda, ponte en contacto con nosotros.';

      const templateId = await this.getOrCreateTemplateId(
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

      const renderedSubject = this.renderTemplate(defaultSubject, variables);
      const renderedContent = this.renderTemplate(defaultTemplate, variables);

      const notificationId = await this.createNotificationHandler.execute({
        tenantId: booking.tenantId.value,
        bookingId: booking.id.value,
        templateId,
        recipientType: 'customer',
        recipientId: customer.id.value,
        contactPoint: customer.email.value,
        subject: renderedSubject,
        renderedContent,
        scheduledFor: new Date(),
        maxRetries: 3,
        metadata: { bookingId: booking.id.value },
      });

      await this.notificationOrchestrator.enqueueEvent(notificationId);
    } catch (err) {
      console.error('[BookingNotificationSubscriber] Error generating booking rescheduled notification:', err);
    }
  }

  private async sendBookingCancelledNotification(booking: Booking): Promise<void> {
    try {
      const customer = await this.customerRepository.findById(booking.customerId);
      if (!customer) {
        console.warn(`[BookingNotificationSubscriber] Customer not found for notification: ${booking.customerId.value}`);
        return;
      }

      const dataSource = (this.customerRepository as any).dataSource;
      if (!dataSource) {
        console.warn('[BookingNotificationSubscriber] DataSource is missing, cannot resolve template.');
        return;
      }

      const defaultSubject = 'Reserva Cancelada: Cita para {{serviceName}}';
      const defaultTemplate = 'Hola {{customerName}},\n\nTe informamos que tu reserva para el servicio {{serviceName}} programada para el {{startsAt}} ha sido cancelada.\n\nSi crees que esto es un error, por favor ponte en contacto con nosotros.';

      const templateId = await this.getOrCreateTemplateId(
        dataSource,
        booking.tenantId.value,
        'booking.cancelled',
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

      const renderedSubject = this.renderTemplate(defaultSubject, variables);
      const renderedContent = this.renderTemplate(defaultTemplate, variables);

      const notificationId = await this.createNotificationHandler.execute({
        tenantId: booking.tenantId.value,
        bookingId: booking.id.value,
        templateId,
        recipientType: 'customer',
        recipientId: customer.id.value,
        contactPoint: customer.email.value,
        subject: renderedSubject,
        renderedContent,
        scheduledFor: new Date(),
        maxRetries: 3,
        metadata: { bookingId: booking.id.value },
      });

      await this.notificationOrchestrator.enqueueEvent(notificationId);
    } catch (err) {
      console.error('[BookingNotificationSubscriber] Error generating booking cancellation notification:', err);
    }
  }

  private async getOrCreateTemplateId(
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

  private renderTemplate(template: string, vars: Record<string, string>): string {
    let res = template;
    for (const [key, value] of Object.entries(vars)) {
      res = res.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    }
    return res;
  }
}
