import { ValidationException } from './validation.exception';

export class InvalidTimeRangeException extends ValidationException {
  constructor(message: string) {
    super(message, 'INVALID_TIME_RANGE');
  }
}
