export class RescheduleBookingRequestDto {
  newStartsAt!: Date;
  newEndsAt!: Date;
  reason?: string;
}
