export interface CancelBookingCommand {
  bookingId: string;
  reasonCode: string;
  description?: string;
  cancelledBy: string;
}
