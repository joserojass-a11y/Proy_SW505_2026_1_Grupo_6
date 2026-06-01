export interface UpdateCustomerCommand {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  preferences?: Record<string, unknown>;
  consentSigned?: boolean;
}
