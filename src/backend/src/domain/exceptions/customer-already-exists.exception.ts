import { ConflictException } from './conflict.exception';

export class CustomerAlreadyExistsException extends ConflictException {
  constructor(userId: string) {
    super(`A customer already exists for user ${userId}`, 'CUSTOMER_ALREADY_EXISTS');
  }
}
