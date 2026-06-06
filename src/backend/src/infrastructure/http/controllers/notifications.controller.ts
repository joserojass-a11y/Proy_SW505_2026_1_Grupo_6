import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { INFRASTRUCTURE_TOKENS } from '../../shared/infrastructure.tokens';
import { NotificationEventRepository } from '../../../domain/repositories/notification-event.repository';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    @Inject(INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY)
    private readonly notificationEventRepository: NotificationEventRepository,
  ) {}

  @Get()
  async getNotifications(
    @Query('bookingId') bookingId?: string,
    @Query('recipientId') recipientId?: string,
  ) {
    if (bookingId) {
      const events = await this.notificationEventRepository.findByBookingId(bookingId);
      return events.map(e => e.toPrimitives());
    }
    if (recipientId) {
      const events = await this.notificationEventRepository.findByRecipientId(recipientId);
      return events.map(e => e.toPrimitives());
    }
    const pending = await this.notificationEventRepository.findPendingEvents();
    return pending.map(e => e.toPrimitives());
  }
}
