import { Email } from '../../../../src/domain/value-objects/email.vo';
import { UserId } from '../../../../src/domain/value-objects/user-id.vo';
import { CustomerId } from '../../../../src/domain/value-objects/customer-id.vo';
import { TenantId } from '../../../../src/domain/value-objects/tenant-id.vo';
import { FullName } from '../../../../src/domain/value-objects/full-name.vo';
import { PasswordHash } from '../../../../src/domain/value-objects/password-hash.vo';
import { UserRole } from '../../../../src/domain/value-objects/user-role.vo';
import { UserStatus } from '../../../../src/domain/value-objects/user-status.vo';
import { InvalidEmailException } from '../../../../src/domain/exceptions/invalid-email.exception';
import { InvalidUserIdException } from '../../../../src/domain/exceptions/invalid-user-id.exception';
import { InvalidFullNameException } from '../../../../src/domain/exceptions/invalid-full-name.exception';
import { InvalidPasswordHashException } from '../../../../src/domain/exceptions/invalid-password-hash.exception';
import { InvalidUserRoleException } from '../../../../src/domain/exceptions/invalid-user-role.exception';
import { InvalidUserStatusException } from '../../../../src/domain/exceptions/invalid-user-status.exception';

describe('Value Objects Unit Tests', () => {
  describe('Email', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase and trim it', () => {
      const email = Email.create('  TEST@example.com  ');
      expect(email.value).toBe('test@example.com');
    });

    it('should throw InvalidEmailException for invalid email format', () => {
      expect(() => Email.create('invalid-email')).toThrow(InvalidEmailException);
      expect(() => Email.create('test@')).toThrow(InvalidEmailException);
      expect(() => Email.create('test@example')).toThrow(InvalidEmailException);
    });

    it('should check for equality', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      const email3 = Email.create('different@example.com');
      expect(email1.equals(email2)).toBe(true);
      expect(email1.equals(email3)).toBe(false);
    });
  });

  describe('UserId, CustomerId, TenantId', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const invalidUuid = 'not-a-uuid';

    it('should create valid IDs', () => {
      const userId = UserId.create(validUuid);
      const customerId = CustomerId.create(validUuid);
      const tenantId = TenantId.create(validUuid);

      expect(userId.value).toBe(validUuid);
      expect(customerId.value).toBe(validUuid);
      expect(tenantId.value).toBe(validUuid);
    });

    it('should throw InvalidUserIdException for invalid UUIDs', () => {
      expect(() => UserId.create(invalidUuid)).toThrow(InvalidUserIdException);
      expect(() => CustomerId.create(invalidUuid)).toThrow(InvalidUserIdException);
      expect(() => TenantId.create(invalidUuid)).toThrow(InvalidUserIdException);
    });

    it('should handle fromNullable for UserId', () => {
      expect(UserId.fromNullable(null)).toBeNull();
      expect(UserId.fromNullable(undefined)).toBeNull();
      const userId = UserId.fromNullable(validUuid);
      expect(userId).not.toBeNull();
      expect(userId!.value).toBe(validUuid);
    });

    it('should check for equality', () => {
      const userId1 = UserId.create(validUuid);
      const userId2 = UserId.create(validUuid);
      const userId3 = UserId.create('123e4567-e89b-12d3-a456-426614174001');

      expect(userId1.equals(userId2)).toBe(true);
      expect(userId1.equals(userId3)).toBe(false);
    });
  });

  describe('FullName', () => {
    it('should create a valid full name', () => {
      const name = FullName.create('Juan Perez');
      expect(name.value).toBe('Juan Perez');
    });

    it('should normalize extra whitespaces and trim', () => {
      const name = FullName.create('   Juan    Perez   ');
      expect(name.value).toBe('Juan Perez');
    });

    it('should throw InvalidFullNameException if too short or too long', () => {
      expect(() => FullName.create('Jo')).toThrow(InvalidFullNameException);
      expect(() => FullName.create('a'.repeat(256))).toThrow(InvalidFullNameException);
    });

    it('should throw InvalidFullNameException if not a string', () => {
      expect(() => FullName.create(null as any)).toThrow(InvalidFullNameException);
    });
  });

  describe('PasswordHash', () => {
    const validHash = 'a'.repeat(60); // standard bcrypt length is 60

    it('should create a valid password hash', () => {
      const hash = PasswordHash.create(validHash);
      expect(hash.value).toBe(validHash);
    });

    it('should throw InvalidPasswordHashException if too short or too long', () => {
      expect(() => PasswordHash.create('short')).toThrow(InvalidPasswordHashException);
      expect(() => PasswordHash.create('a'.repeat(256))).toThrow(InvalidPasswordHashException);
    });
  });

  describe('UserRole', () => {
    it('should create valid roles', () => {
      const role1 = UserRole.create('CLIENT');
      const role2 = UserRole.create('ADMIN');
      const role3 = UserRole.create('OWNER');

      expect(role1.value).toBe('CLIENT');
      expect(role2.value).toBe('ADMIN');
      expect(role3.value).toBe('OWNER');

      expect(role1.isClient()).toBe(true);
      expect(role2.isAdmin()).toBe(true);
      expect(role3.isOwner()).toBe(true);
    });

    it('should helper factories work', () => {
      expect(UserRole.client().isClient()).toBe(true);
      expect(UserRole.admin().isAdmin()).toBe(true);
      expect(UserRole.owner().isOwner()).toBe(true);
    });

    it('should throw InvalidUserRoleException for invalid roles', () => {
      expect(() => UserRole.create('INVALID')).toThrow(InvalidUserRoleException);
    });
  });

  describe('UserStatus', () => {
    it('should create valid statuses', () => {
      const status1 = UserStatus.create('PENDING');
      const status2 = UserStatus.create('ACTIVE');
      const status3 = UserStatus.create('BLOCKED');

      expect(status1.value).toBe('PENDING');
      expect(status2.value).toBe('ACTIVE');
      expect(status3.value).toBe('BLOCKED');

      expect(status1.isPending()).toBe(true);
      expect(status2.isActive()).toBe(true);
      expect(status3.isBlocked()).toBe(true);
    });

    it('should helper factories work', () => {
      expect(UserStatus.pending().isPending()).toBe(true);
      expect(UserStatus.active().isActive()).toBe(true);
      expect(UserStatus.blocked().isBlocked()).toBe(true);
    });

    it('should throw InvalidUserStatusException for invalid statuses', () => {
      expect(() => UserStatus.create('INVALID')).toThrow(InvalidUserStatusException);
    });
  });
});
