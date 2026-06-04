import { NotFoundException } from './not-found.exception';

export class TenantNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Tenant not found: ${identifier}`, 'TENANT_NOT_FOUND');
  }
}
