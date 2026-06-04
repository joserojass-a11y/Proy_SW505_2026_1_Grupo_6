import { ConflictException } from './conflict.exception';

export class TenantAlreadyExistsException extends ConflictException {
  constructor(ownerUserId: string) {
    super(`A tenant already exists for owner ${ownerUserId}`, 'TENANT_ALREADY_EXISTS');
  }
}
