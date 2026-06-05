export interface ListBookingsQuery {
  tenantId?: string;
  customerId?: string;
  serviceId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
