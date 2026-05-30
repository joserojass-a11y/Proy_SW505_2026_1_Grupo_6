import { ValidationException } from './validation.exception';

export class InvalidUserRoleException extends ValidationException {
  constructor(value: string) {
    super(`Invalid user role: ${value}`, 'INVALID_USER_ROLE');
  }
}
