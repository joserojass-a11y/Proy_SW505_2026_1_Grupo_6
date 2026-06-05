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
  ) =>
    new CreateBookingCommandHandler(
      bookingRepository,
      availabilityService,
    ),
  inject: [
    INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
    INFRASTRUCTURE_TOKENS.AVAILABILITY_SERVICE,
  ],
};

const cancelBookingHandlerProvider: Provider = {
  provide: CancelBookingCommandHandler,
  useFactory: (
    bookingRepository: TypeOrmBookingRepository,
  ) =>
    new CancelBookingCommandHandler(
      bookingRepository,
    ),
  inject: [
    INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
  ],
};

const rescheduleBookingHandlerProvider: Provider = {
  provide: RescheduleBookingCommandHandler,
  useFactory: (
    bookingRepository: TypeOrmBookingRepository,
    availabilityService: IAvailabilityService,
  ) =>
    new RescheduleBookingCommandHandler(
      bookingRepository,
      availabilityService,
    ),
  inject: [
    INFRASTRUCTURE_TOKENS.BOOKING_REPOSITORY,
    INFRASTRUCTURE_TOKENS.AVAILABILITY_SERVICE,
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
  imports: [DatabaseModule],
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
