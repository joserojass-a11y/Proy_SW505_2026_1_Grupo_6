import { ValidationException } from './validation.exception';

export class InvalidResourceTypeIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid resource type id: ${value}`, 'INVALID_RESOURCE_TYPE_ID');
  }
}
