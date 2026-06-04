export class CreateBookingResponseDto {
  id!: string;
  status!: string;
  startsAt!: Date;
  endsAt!: Date;
  createdAt!: Date;

  constructor(id: string, status: string, startsAt: Date, endsAt: Date, createdAt: Date) {
    this.id = id;
    this.status = status;
    this.startsAt = startsAt;
    this.endsAt = endsAt;
    this.createdAt = createdAt;
  }
}
