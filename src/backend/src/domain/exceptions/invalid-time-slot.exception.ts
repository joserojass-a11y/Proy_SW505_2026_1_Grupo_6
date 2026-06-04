import { ValidationException } from './validation.exception';

export class InvalidTimeSlotException extends ValidationException {
  constructor(message: string) {
    super(message, 'INVALID_TIME_SLOT');
  }
}
