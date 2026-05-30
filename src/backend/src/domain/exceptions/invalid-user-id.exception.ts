import { ValidationException } from './validation.exception';

export class InvalidUserIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid user id: ${value}`, 'INVALID_USER_ID');
  }
}
