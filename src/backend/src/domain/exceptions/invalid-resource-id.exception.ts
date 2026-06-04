import { ValidationException } from './validation.exception';

export class InvalidResourceIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid resource id: ${value}`, 'INVALID_RESOURCE_ID');
  }
}
