import { DomainException } from './domain.exception';

export class InvalidCustomerIdException extends DomainException {
  constructor(value: string) {
    super(`Invalid customer ID: ${value}`, 'INVALID_CUSTOMER_ID');
  }
}
