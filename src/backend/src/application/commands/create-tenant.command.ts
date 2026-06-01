export interface CreateTenantCommand {
  ownerUserId: string;
  countryCode: string;
  subdomain: string;
  name: string;
  globalSettings?: Record<string, unknown>;
}
