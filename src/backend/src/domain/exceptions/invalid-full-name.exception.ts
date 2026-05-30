import { ValidationException } from './validation.exception';

export class InvalidFullNameException extends ValidationException {
  constructor() {
    super('Full name must contain between 3 and 255 characters', 'INVALID_FULL_NAME');
  }
}
