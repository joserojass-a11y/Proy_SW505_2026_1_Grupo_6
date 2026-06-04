import { ValidationException } from './validation.exception';

export class InvalidBreakIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid break id: ${value}`, 'INVALID_BREAK_ID');
  }
}
