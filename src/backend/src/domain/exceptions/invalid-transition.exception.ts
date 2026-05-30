import { DomainException } from './domain.exception';

export class InvalidTransitionException extends DomainException {
  constructor(message: string, code = 'INVALID_TRANSITION') {
    super(message, code);
  }
}
