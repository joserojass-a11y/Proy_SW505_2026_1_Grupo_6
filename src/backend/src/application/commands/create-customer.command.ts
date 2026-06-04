export interface CreateCustomerCommand {
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  preferences?: Record<string, unknown>;
  consentSigned: boolean;
}
