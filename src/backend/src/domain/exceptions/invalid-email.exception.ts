import { ValidationException } from './validation.exception';

export class InvalidEmailException extends ValidationException {
  constructor(value: string) {
    super(`Invalid email: ${value}`, 'INVALID_EMAIL');
  }
}
