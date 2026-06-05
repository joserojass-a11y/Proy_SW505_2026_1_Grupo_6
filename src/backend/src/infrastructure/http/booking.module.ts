import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateBookingCommandHandler } from '../../application/commands/create-booking.command-handler';
import { CancelBookingCommandHandler } from '../../application/commands/cancel-booking.command-handler';
import { RescheduleBookingCommandHandler } from '../../application/commands/reschedule-booking.command-handler';
import { GetBookingQueryHandler } from '../../application/queries/get-booking.query-handler';
import { ListBookingsQueryHandler } from '../../application/queries/list-bookings.query-handler';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { TypeOrmBookingRepository } from '../persistence/typeorm/typeorm-booking.repository';
import { BookingController } from './controllers/booking.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { AvailabilityServiceMock } from '../services/availability-service.mock';
import { IAvailabilityService } from '../../application/services/availability.interface';
import { DatabaseModule } from '../shared/database.module';
import { CustomersModule } from './customers.module';
import { NotificationsModule } from './notifications.module';
import { CreateNotificationCommandHandler } from '../../application/commands/create-notification.command-handler';

const bookingRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
  useFactory: (dataSource: DataSource) => new TypeOrmBookingRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

const availabilityServiceProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.AVAILABILITY_SERVICE,
  useClass: AvailabilityServiceMock,
};

const createBookingHandlerProvider: Provider = {
  provide: CreateBookingCommandHandler,
  useFactory: (
    bookingRepository: TypeOrmBookingRepository,
    availabilityService: IAvailabilityService,
    customerRepository: any,
    createNotificationHandler: any,
    notificationOrchestrationService: any,
  ) =>
    new CreateBookingCommandHandler(
      bookingRepository,
      availabilityService,
      customerRepository,
      createNotificationHandler,
      notificationOrchestrationService,
    ),
  inject: [
    INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
    INFRASTRUCTURE_TOKENS.AVAILABILITY_SERVICE,
    INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY,
    CreateNotificationCommandHandler,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_ORCHESTRATION_SERVICE,
  ],
};

const cancelBookingHandlerProvider: Provider = {
  provide: CancelBookingCommandHandler,
  useFactory: (
    bookingRepository: TypeOrmBookingRepository,
    customerRepository: any,
    createNotificationHandler: any,
    notificationOrchestrationService: any,
  ) =>
    new CancelBookingCommandHandler(
      bookingRepository,
      customerRepository,
      createNotificationHandler,
      notificationOrchestrationService,
    ),
  inject: [
    INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
    INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY,
    CreateNotificationCommandHandler,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_ORCHESTRATION_SERVICE,
  ],
};

const rescheduleBookingHandlerProvider: Provider = {
  provide: RescheduleBookingCommandHandler,
  useFactory: (
    bookingRepository: TypeOrmBookingRepository,
    availabilityService: IAvailabilityService,
    customerRepository: any,
    createNotificationHandler: any,
    notificationOrchestrationService: any,
  ) =>
    new RescheduleBookingCommandHandler(
      bookingRepository,
      availabilityService,
      customerRepository,
      createNotificationHandler,
      notificationOrchestrationService,
    ),
  inject: [
    INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
    INFRASTRUCTURE_TOKENS.AVAILABILITY_SERVICE,
    INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY,
    CreateNotificationCommandHandler,
    INFRASTRUCTURE_TOKENS.NOTIFICATION_ORCHESTRATION_SERVICE,
  ],
};

const getBookingHandlerProvider: Provider = {
  provide: GetBookingQueryHandler,
  useFactory: (bookingRepository: TypeOrmBookingRepository) => new GetBookingQueryHandler(bookingRepository),
  inject: [INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY],
};

const listBookingsHandlerProvider: Provider = {
  provide: ListBookingsQueryHandler,
  useFactory: (bookingRepository: TypeOrmBookingRepository) => new ListBookingsQueryHandler(bookingRepository),
  inject: [INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY],
};

@Module({
  imports: [DatabaseModule, CustomersModule, NotificationsModule],
  controllers: [BookingController],
  providers: [
    bookingRepositoryProvider,
    availabilityServiceProvider,
    createBookingHandlerProvider,
    cancelBookingHandlerProvider,
    rescheduleBookingHandlerProvider,
    getBookingHandlerProvider,
    listBookingsHandlerProvider,
    JwtAuthGuard,
    Reflector,
  ],
  exports: [
    INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
    INFRASTRUCTURE_TOKENS.AVAILABILITY_SERVICE,
    CreateBookingCommandHandler,
    CancelBookingCommandHandler,
    RescheduleBookingCommandHandler,
    GetBookingQueryHandler,
    ListBookingsQueryHandler,
  ],
})
export class BookingModule {}
