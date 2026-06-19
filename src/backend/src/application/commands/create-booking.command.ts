export interface CreateBookingCommand {
  tenantId: string;
  branchId: string;
  serviceId: string;
  resourceId: string;
  customerId: string;
  startsAt: Date;
  endsAt: Date;
  customerTimezone: string;
  sourceChannel: string;
  notes?: string;
  customData?: Record<string, unknown>;
  createdBy: string;
}
