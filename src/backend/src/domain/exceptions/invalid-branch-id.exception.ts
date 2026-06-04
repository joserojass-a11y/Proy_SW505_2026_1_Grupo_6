import { ValidationException } from './validation.exception';

export class InvalidBranchIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid branch id: ${value}`, 'INVALID_BRANCH_ID');
  }
}
