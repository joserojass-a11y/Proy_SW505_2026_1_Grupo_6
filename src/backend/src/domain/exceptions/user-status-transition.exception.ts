import { InvalidTransitionException } from './invalid-transition.exception';

export class UserStatusTransitionException extends InvalidTransitionException {
  constructor(from: string, to: string) {
    super(`Cannot transition user status from ${from} to ${to}`, 'USER_STATUS_TRANSITION_NOT_ALLOWED');
  }
}
