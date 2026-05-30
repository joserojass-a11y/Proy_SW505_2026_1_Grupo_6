import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code);
  }
}
