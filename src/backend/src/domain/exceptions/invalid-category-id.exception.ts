import { ValidationException } from './validation.exception';

export class InvalidCategoryIdException extends ValidationException {
  constructor(value: string) {
    super(`Invalid category id: ${value}`, 'INVALID_CATEGORY_ID');
  }
}
