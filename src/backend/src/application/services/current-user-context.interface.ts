import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRoleValue } from '../../domain/value-objects/user-role.vo';

export interface CurrentUserContext {
  userId: UserId;
  role: UserRoleValue;
}
