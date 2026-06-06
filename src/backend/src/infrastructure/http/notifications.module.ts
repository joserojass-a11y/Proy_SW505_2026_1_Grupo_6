import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { TypeOrmNotificationEventRepository } from '../persistence/typeorm/typeorm-notification-event.repository';
import { TypeOrmNotificationPreferenceRepository } from '../persistence/typeorm/typeorm-notification-preference.repository';
import { DatabaseModule } from '../shared/database.module';
import { SmtpEmailService } from '../email/smtp-email.service';
import { RedisNotificationQueueService } from '../services/redis-notification-queue.service';
import { NotificationOrchestrationService } from '../services/notification-orchestration.service';
import { CreateNotificationCommandHandler } from '../../application/commands/create-notification.command-handler';
import { RecordNotificationFailureCommandHandler } from '../../application/commands/record-notification-failure.command-handler';
import { MarkNotificationAsSentCommandHandler } from '../../application/commands/mark-notification-as-sent.command-handler';
import { CreateNotificationPreferenceCommandHandler } from '../../application/commands/create-notification-preference.command-handler';
import { UpdateNotificationPreferenceCommandHandler } from '../../application/commands/update-notification-preference.command-handler';
import { GetPendingNotificationsQueryHandler } from '../../application/queries/get-pending-notifications.query-handler';
import { GetCustomerPreferencesQueryHandler } from '../../application/queries/get-customer-preferences.query-handler';
import { GetNotificationHistoryQueryHandler } from '../../application/queries/get-notification-history.query-handler';
import { BookingReminderSchedulerService } from '../services/booking-reminder-scheduler.service';
import { CustomersModule } from './customers.module';
import { BookingNotificationSubscriber } from '../services/booking-notification-subscriber.service';
import { NotificationsController } from './controllers/notifications.controller';



/**
 * Provider: NotificationEventRepository
 */
const notificationEventRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    new TypeOrmNotificationEventRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

/**
 * Provider: NotificationPreferenceRepository
 */
const notificationPreferenceRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.NOTIFICATION_PREFERENCE_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    new TypeOrmNotificationPreferenceRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

/**
 * Provider: EmailService
 * Inyecta SmtpEmailService para envío de emails
 */
const emailServiceProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.EMAIL_SERVICE,
  useClass: SmtpEmailService,
};

/**
 * Provider: NotificationQueueService
 * Inyecta RedisNotificationQueueService para gestión de cola
 */
const notificationQueueServiceProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.NOTIFICATION_QUEUE_SERVICE,
  useClass: RedisNotificationQueueService,
};

/**
 * Provider: Command Handlers
 */
const createNotificationHandlerProvider: Provider = {
  provide: CreateNotificationCommandHandler,
  useFactory: (repository) => new CreateNotificationCommandHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY],
};

const recordNotificationFailureHandlerProvider: Provider = {
  provide: RecordNotificationFailureCommandHandler,
  useFactory: (repository) => new RecordNotificationFailureCommandHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY],
};

const markNotificationAsSentHandlerProvider: Provider = {
  provide: MarkNotificationAsSentCommandHandler,
  useFactory: (repository) => new MarkNotificationAsSentCommandHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY],
};

const createNotificationPreferenceHandlerProvider: Provider = {
  provide: CreateNotificationPreferenceCommandHandler,
  useFactory: (repository) => new CreateNotificationPreferenceCommandHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_PREFERENCE_REPOSITORY],
};

const updateNotificationPreferenceHandlerProvider: Provider = {
  provide: UpdateNotificationPreferenceCommandHandler,
  useFactory: (repository) => new UpdateNotificationPreferenceCommandHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_PREFERENCE_REPOSITORY],
};

/**
 * Provider: Query Handlers
 */
const getPendingNotificationsHandlerProvider: Provider = {
  provide: GetPendingNotificationsQueryHandler,
  useFactory: (repository) => new GetPendingNotificationsQueryHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY],
};

const getCustomerPreferencesHandlerProvider: Provider = {
  provide: GetCustomerPreferencesQueryHandler,
  useFactory: (repository) => new GetCustomerPreferencesQueryHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_PREFERENCE_REPOSITORY],
};

const getNotificationHistoryHandlerProvider: Provider = {
  provide: GetNotificationHistoryQueryHandler,
  useFactory: (repository) => new GetNotificationHistoryQueryHandler(repository),
  inject: [INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY],
};

/**
 * Provider: NotificationOrchestrationService
 * Servicio que orquesta el flujo completo de notificaciones
 */
const notificationOrchestrationServiceProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.NOTIFICATION_ORCHESTRATION_SERVICE,
  useFactory: (
    eventRepository,
    prefRepository,
    emailService,
    queueService,
    getPendingHandler,
    markAsSentHandler,
    recordFailureHandler,
  ) =>
    new NotificationOrchestrationService(
      eventRepository,
      prefRepository,
      emailService,
      queueService,
      getPendingHandler,
      markAsSentHandler,
      recordFailureHandler,
    ),
  inject: [
    INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_PREFERENCE_REPOSITORY,
    INFRASTRUCTURE_TOKENS.EMAIL_SERVICE,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_QUEUE_SERVICE,
    GetPendingNotificationsQueryHandler,
    MarkNotificationAsSentCommandHandler,
    RecordNotificationFailureCommandHandler,
  ],
};

/**
 * NotificationsModule
 *
 * Módulo centralizado para:
 * - Persistencia (repositorios)
 * - Servicios de email (SMTP)
 * - Gestión de cola asíncrona (Redis)
 * - Orquestación (ProcessQueue)
 * - Handlers CQS (Commands/Queries)
 */
@Module({
  imports: [DatabaseModule, CustomersModule],
  controllers: [NotificationsController],
  providers: [
    // Repositories
    notificationEventRepositoryProvider,
    notificationPreferenceRepositoryProvider,
    // Services
    emailServiceProvider,
    notificationQueueServiceProvider,
    // Command Handlers
    createNotificationHandlerProvider,
    recordNotificationFailureHandlerProvider,
    markNotificationAsSentHandlerProvider,
    createNotificationPreferenceHandlerProvider,
    updateNotificationPreferenceHandlerProvider,
    // Query Handlers
    getPendingNotificationsHandlerProvider,
    getCustomerPreferencesHandlerProvider,
    getNotificationHistoryHandlerProvider,
    // Orchestration Service
    notificationOrchestrationServiceProvider,
    BookingReminderSchedulerService,
    BookingNotificationSubscriber,
  ],
  exports: [
    INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_PREFERENCE_REPOSITORY,
    INFRASTRUCTURE_TOKENS.EMAIL_SERVICE,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_QUEUE_SERVICE,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_ORCHESTRATION_SERVICE,
    CreateNotificationCommandHandler,
    RecordNotificationFailureCommandHandler,
    MarkNotificationAsSentCommandHandler,
    CreateNotificationPreferenceCommandHandler,
    UpdateNotificationPreferenceCommandHandler,
    GetPendingNotificationsQueryHandler,
    GetCustomerPreferencesQueryHandler,
    GetNotificationHistoryQueryHandler,
  ],
})
export class NotificationsModule {}
