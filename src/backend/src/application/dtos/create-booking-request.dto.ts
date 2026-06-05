export class CreateBookingRequestDto {
  tenantId!: string;
  branchId!: string;
  serviceId!: string;
  customerId!: string;
  startsAt!: Date;
  endsAt!: Date;
  customerTimezone!: string;
  sourceChannel!: string;
  notes?: string;
  customData?: Record<string, unknown>;
}
