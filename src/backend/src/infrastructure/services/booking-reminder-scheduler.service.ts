import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { CreateNotificationCommandHandler } from '../../application/commands/create-notification.command-handler';

@Injectable()
export class BookingReminderSchedulerService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(INFRASTRUCTURE_TOKENS.DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly createNotificationHandler: CreateNotificationCommandHandler,
    @Inject(INFRASTRUCTURE_TOKENS.NOTIFICATION_ORCHESTRATION_SERVICE)
    private readonly notificationOrchestrator: any,
  ) {}

  async onModuleInit(): Promise<void> {
    console.log('[BookingReminderScheduler] Starting scheduler...');
    // Run every 30 seconds
    this.timer = setInterval(() => {
      this.checkAndSendReminders().catch((err) => {
        console.error('[BookingReminderScheduler] Error running scheduler:', err);
      });
    }, 30000);
  }

  async onModuleDestroy(): Promise<void> {
    console.log('[BookingReminderScheduler] Stopping scheduler...');
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async checkAndSendReminders(): Promise<void> {
    // 1. Process 24h reminders
    await this.processReminderType('reminder.24h', 'reminderLeadTimeHours', 24);
    // 2. Process 1h reminders
    await this.processReminderType('reminder.1h', 'reminderSecondaryLeadTimeHours', 1);
  }

  private async processReminderType(triggerEvent: string, leadTimeSettingKey: string, defaultHours: number): Promise<void> {
    try {
      const query = `
        SELECT 
          b.id as "bookingId",
          b.tenant_id as "tenantId",
          b.starts_at as "startsAt",
          b.ends_at as "endsAt",
          b.service_id as "serviceId",
          c.id as "customerId",
          c.email as "customerEmail",
          c.first_name as "customerFirstName",
          c.last_name as "customerLastName"
        FROM bookings b
        INNER JOIN tenants t ON b.tenant_id = t.id
        INNER JOIN customers c ON b.customer_id = c.id
        WHERE b.status IN ('PENDING', 'CONFIRMED', 'RESCHEDULED')
          AND b.starts_at > NOW()
          AND b.starts_at <= NOW() + COALESCE((t.global_settings->>'${leadTimeSettingKey}')::integer, ${defaultHours}) * INTERVAL '1 hour'
          AND NOT EXISTS (
            SELECT 1 FROM notification_events ne
            INNER JOIN notification_templates nt ON ne.template_id = nt.id
            WHERE ne.booking_id = b.id
              AND nt.trigger_event = $1
          )
      `;

      const bookings = await this.dataSource.query(query, [triggerEvent]);

      for (const booking of bookings) {
        try {
          const defaultSubject = triggerEvent === 'reminder.24h' 
            ? 'Recordatorio de Reserva: Tu cita para {{serviceName}} es mañana'
            : 'Recordatorio de Reserva: Tu cita para {{serviceName}} es en 1 hora';

          const defaultTemplate = triggerEvent === 'reminder.24h'
            ? 'Hola {{customerName}},\n\nTe recordamos que tienes una cita programada para mañana a las {{startsAt}} para el servicio de {{serviceName}}.\n\n¡Te esperamos!'
            : 'Hola {{customerName}},\n\nTe recordamos que tu cita para el servicio de {{serviceName}} es hoy a las {{startsAt}} (en 1 hora).\n\nPor favor, asegúrate de asistir a tiempo.';

          // Fetch or create template in DB
          const templateId = await getOrCreateTemplateId(
            this.dataSource,
            booking.tenantId,
            triggerEvent,
            defaultSubject,
            defaultTemplate
          );

          const customerName = `${booking.customerFirstName} ${booking.customerLastName}`;
          const serviceName = `Servicio ${booking.serviceId}`;
          const variables = {
            customerName,
            serviceName,
            startsAt: new Date(booking.startsAt).toLocaleString(),
            endsAt: new Date(booking.endsAt).toLocaleString(),
          };

          const renderedSubject = renderTemplate(defaultSubject, variables);
          const renderedContent = renderTemplate(defaultTemplate, variables);

          const notificationId = await this.createNotificationHandler.execute({
            tenantId: booking.tenantId,
            bookingId: booking.bookingId,
            templateId,
            recipientType: 'customer',
            recipientId: booking.customerId,
            contactPoint: booking.customerEmail,
            subject: renderedSubject,
            renderedContent,
            scheduledFor: new Date(),
            maxRetries: 3,
            metadata: { bookingId: booking.bookingId },
          });

          await this.notificationOrchestrator.enqueueEvent(notificationId);
          console.log(`[BookingReminderScheduler] Successfully enqueued ${triggerEvent} reminder for booking ${booking.bookingId}`);
        } catch (bookingErr) {
          console.error(`[BookingReminderScheduler] Error processing reminder for booking ${booking.bookingId}:`, bookingErr);
        }
      }
    } catch (err) {
      console.error(`[BookingReminderScheduler] Error processing ${triggerEvent} reminders:`, err);
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
