import { ValidationException } from './validation.exception';

export class InvalidPasswordHashException extends ValidationException {
  constructor() {
    super('Password hash is invalid', 'INVALID_PASSWORD_HASH');
  }
}
