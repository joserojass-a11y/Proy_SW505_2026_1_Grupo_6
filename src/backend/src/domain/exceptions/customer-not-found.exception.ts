import { NotFoundException } from './not-found.exception';

export class CustomerNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Customer not found: ${identifier}`, 'CUSTOMER_NOT_FOUND');
  }
}
