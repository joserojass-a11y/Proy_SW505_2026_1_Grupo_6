import { ValidationException } from './validation.exception';

export class InvalidServiceIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid service id: ${value}`, 'INVALID_SERVICE_ID');
  }
}