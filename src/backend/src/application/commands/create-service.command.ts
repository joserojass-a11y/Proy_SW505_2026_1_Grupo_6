export interface CreateServiceCommand {
  tenantId: string;
  categoryId: string;
  name: string;
  baseDurationMinutes: number;
  basePrice: number;
  customAttributes?: Record<string, unknown>;
  isActive?: boolean;
}
