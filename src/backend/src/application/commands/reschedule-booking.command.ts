export interface RescheduleBookingCommand {
  bookingId: string;
  newStartsAt: Date;
  newEndsAt: Date;
  reason?: string;
  rescheduledBy: string;
}
