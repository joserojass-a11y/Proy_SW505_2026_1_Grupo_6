import { ValidationException } from './validation.exception';

export class InvalidScheduleSlotIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid schedule slot id: ${value}`, 'INVALID_SCHEDULE_SLOT_ID');
  }
}
