import { SetMetadata } from '@nestjs/common';
import { UserRoleValue } from '../../../domain/value-objects/user-role.vo';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleValue[]) => SetMetadata(ROLES_KEY, roles);
