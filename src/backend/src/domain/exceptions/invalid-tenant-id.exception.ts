import { DomainException } from './domain.exception';

export class InvalidTenantIdException extends DomainException {
  constructor(value: string) {
    super(`Invalid tenant ID: ${value}`, 'INVALID_TENANT_ID');
  }
}
