export class BookingDetailDto {
  id!: string;
  tenantId!: string;
  branchId!: string;
  serviceId!: string;
  customerId!: string;
  startsAt!: Date;
  endsAt!: Date;
  customerTimezone!: string;
  status!: string;
  sourceChannel!: string;
  notes?: string;
  customData?: Record<string, unknown>;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: {
    id: string;
    tenantId: string;
    branchId: string;
    serviceId: string;
    customerId: string;
    startsAt: Date;
    endsAt: Date;
    customerTimezone: string;
    status: string;
    sourceChannel: string;
    notes?: string;
    customData?: Record<string, unknown>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    Object.assign(this, data);
  }
}
