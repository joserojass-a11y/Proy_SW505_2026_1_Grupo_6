import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, code);
  }
}
