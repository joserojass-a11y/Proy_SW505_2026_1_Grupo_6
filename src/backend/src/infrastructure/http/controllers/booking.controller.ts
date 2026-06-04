import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateBookingCommandHandler } from '../../application/commands/create-booking.command-handler';
import { CancelBookingCommandHandler } from '../../application/commands/cancel-booking.command-handler';
import { RescheduleBookingCommandHandler } from '../../application/commands/reschedule-booking.command-handler';
import { GetBookingQueryHandler } from '../../application/queries/get-booking.query-handler';
import { ListBookingsQueryHandler } from '../../application/queries/list-bookings.query-handler';
import { CreateBookingRequestDto } from '../../application/dtos/create-booking-request.dto';
import { CancelBookingRequestDto } from '../../application/dtos/cancel-booking-request.dto';
import { RescheduleBookingRequestDto } from '../../application/dtos/reschedule-booking-request.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
}

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBookingHandler: CreateBookingCommandHandler,
    private readonly cancelBookingHandler: CancelBookingCommandHandler,
    private readonly rescheduleBookingHandler: RescheduleBookingCommandHandler,
    private readonly getBookingHandler: GetBookingQueryHandler,
    private readonly listBookingsHandler: ListBookingsQueryHandler,
  ) {}

  /**
   * POST /bookings
   * Create a new booking
   *
   * Protected: Requires JWT authentication
   * IMPORTANT: Uses pessimistic locking to prevent double bookings
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(@Body() dto: CreateBookingRequestDto, @CurrentUser() user: JwtPayload) {
    return this.createBookingHandler.execute({
      ...dto,
      createdBy: user.sub,
    });
  }

  /**
   * GET /bookings/:id
   * Retrieve a booking by ID
   *
   * Protected: Requires JWT authentication
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getBooking(@Param('id') bookingId: string, @Query('tenantId') tenantId?: string) {
    return this.getBookingHandler.execute({
      bookingId,
      tenantId,
    });
  }

  /**
   * GET /bookings
   * List bookings with optional filters
   *
   * Protected: Requires JWT authentication
   * Query params:
   * - tenantId: Filter by tenant
   * - customerId: Filter by customer
   * - serviceId: Filter by service
   * - status: Filter by status
   * - limit: Pagination limit (default 20)
   * - offset: Pagination offset (default 0)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async listBookings(
    @Query('tenantId') tenantId?: string,
    @Query('customerId') customerId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.listBookingsHandler.execute({
      tenantId,
      customerId,
      serviceId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  /**
   * POST /bookings/:id/cancel
   * Cancel a booking
   *
   * Protected: Requires JWT authentication
   */
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(@Param('id') bookingId: string, @Body() dto: CancelBookingRequestDto, @CurrentUser() user: JwtPayload) {
    return this.cancelBookingHandler.execute({
      bookingId,
      reasonCode: dto.reasonCode,
      description: dto.description,
      cancelledBy: user.sub,
    });
  }

  /**
   * POST /bookings/:id/reschedule
   * Reschedule a booking to a new time slot
   *
   * Protected: Requires JWT authentication
   * IMPORTANT: Checks for conflicts with the new time slot
   */
  @Post(':id/reschedule')
  @UseGuards(JwtAuthGuard)
  async rescheduleBooking(
    @Param('id') bookingId: string,
    @Body() dto: RescheduleBookingRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rescheduleBookingHandler.execute({
      bookingId,
      newStartsAt: dto.newStartsAt,
      newEndsAt: dto.newEndsAt,
      reason: dto.reason,
      rescheduledBy: user.sub,
    });
  }
}
