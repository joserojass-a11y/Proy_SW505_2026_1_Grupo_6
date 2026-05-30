import { ConflictException } from './conflict.exception';

export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`A user with email ${email} already exists`, 'USER_ALREADY_EXISTS');
  }
}
