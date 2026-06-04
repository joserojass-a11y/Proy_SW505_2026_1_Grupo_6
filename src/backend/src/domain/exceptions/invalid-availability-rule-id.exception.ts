import { ValidationException } from './validation.exception';

export class InvalidAvailabilityRuleIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid availability rule id: ${value}`, 'INVALID_AVAILABILITY_RULE_ID');
  }
}
