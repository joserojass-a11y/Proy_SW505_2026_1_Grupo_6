export interface GetAvailableSlotsQuery {
  tenantId: string;
  branchId: string;
  serviceId: string;
  resourceId?: string;
  date: string; // YYYY-MM-DD
}
