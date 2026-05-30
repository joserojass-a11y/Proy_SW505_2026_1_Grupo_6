import { NotFoundException } from './not-found.exception';

export class UserNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, 'USER_NOT_FOUND');
  }
}
