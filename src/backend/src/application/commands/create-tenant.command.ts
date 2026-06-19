export interface CreateTenantCommand {
  ownerUserId: string;
  zoneId: string;
  countryCode: string;
  subdomain: string;
  name: string;
  globalSettings?: Record<string, unknown>;
}
