import { ValidationException } from './validation.exception';

export class InvalidUserStatusException extends ValidationException {
  constructor(value: string) {
    super(`Invalid user status: ${value}`, 'INVALID_USER_STATUS');
  }
}
