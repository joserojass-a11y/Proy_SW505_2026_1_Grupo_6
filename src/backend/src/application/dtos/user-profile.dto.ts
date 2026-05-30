import { UserRoleValue } from '../../domain/value-objects/user-role.vo';
import { UserStatusValue } from '../../domain/value-objects/user-status.vo';

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleValue;
  status: UserStatusValue;
  createdAt: string;
  updatedAt: string;
}
