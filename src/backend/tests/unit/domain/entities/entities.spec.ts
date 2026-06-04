import { User } from '../../../../src/domain/entities/user.entity';
import { Tenant } from '../../../../src/domain/entities/tenant.entity';
import { TenantBillingProfile } from '../../../../src/domain/entities/tenant-billing-profile.entity';
import { Customer } from '../../../../src/domain/entities/customer.entity';
import { UserId } from '../../../../src/domain/value-objects/user-id.vo';
import { Email } from '../../../../src/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../src/domain/value-objects/password-hash.vo';
import { FullName } from '../../../../src/domain/value-objects/full-name.vo';
import { UserRole } from '../../../../src/domain/value-objects/user-role.vo';
import { UserStatus } from '../../../../src/domain/value-objects/user-status.vo';
import { TenantId } from '../../../../src/domain/value-objects/tenant-id.vo';
import { CustomerId } from '../../../../src/domain/value-objects/customer-id.vo';
import { UserStatusTransitionException } from '../../../../src/domain/exceptions/user-status-transition.exception';

describe('Domain Entities Unit Tests', () => {
  const validUuid1 = '123e4567-e89b-12d3-a456-426614174001';
  const validUuid2 = '123e4567-e89b-12d3-a456-426614174002';
  const validUuid3 = '123e4567-e89b-12d3-a456-426614174003';

  describe('User Entity', () => {
    it('should create and reconstitute a user entity', () => {
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Test User',
      });

      expect(user.id.value).toBe(validUuid1);
      expect(user.email.value).toBe('user@example.com');
      expect(user.fullName.value).toBe('Test User');
      expect(user.role.value).toBe('CLIENT');
      expect(user.status.value).toBe('PENDING');

      const reconstituted = User.reconstitute({
        id: validUuid1,
        email: 'reconstituted@example.com',
        passwordHash: 'c'.repeat(60),
        fullName: 'Reconstituted User',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(reconstituted.id.value).toBe(validUuid1);
      expect(reconstituted.email.value).toBe('reconstituted@example.com');
      expect(reconstituted.role.value).toBe('ADMIN');
      expect(reconstituted.status.value).toBe('ACTIVE');
    });

    it('should update profile and touch updatedAt', () => {
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Test User',
      });

      const originalUpdatedAt = user.updatedAt;
      // Sleep a bit or modify manually to check update date changes
      const customDate = new Date();
      customDate.setHours(customDate.getHours() + 1);

      user.updateProfile({ fullName: 'Updated Name', email: 'updated@example.com' });
      user.touch(customDate);

      expect(user.fullName.value).toBe('Updated Name');
      expect(user.email.value).toBe('updated@example.com');
      expect(user.updatedAt.getTime()).toBe(customDate.getTime());
    });

    it('should change password hash', () => {
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Test User',
      });

      const newHash = 'c'.repeat(60);
      user.changePasswordHash(newHash);
      expect(user.passwordHash.value).toBe(newHash);
    });

    it('should handle role assignments', () => {
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Test User',
      });

      user.assignRole('OWNER');
      expect(user.role.value).toBe('OWNER');
    });

    it('should manage status transitions correctly', () => {
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Test User',
        status: 'PENDING',
      });

      // PENDING -> ACTIVE (Allowed)
      user.activate();
      expect(user.status.isActive()).toBe(true);

      // ACTIVE -> BLOCKED (Allowed)
      user.block();
      expect(user.status.isBlocked()).toBe(true);

      // BLOCKED -> ACTIVE (Allowed)
      user.activate();
      expect(user.status.isActive()).toBe(true);
    });

    it('should throw UserStatusTransitionException on invalid transitions', () => {
      const user = User.reconstitute({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Test User',
        role: 'CLIENT',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // ACTIVE -> PENDING (Not allowed)
      expect(() => user.markPending()).toThrow(UserStatusTransitionException);
    });
  });

  describe('Tenant Entity', () => {
    it('should create and reconstitute a tenant', () => {
      const tenant = Tenant.create({
        id: validUuid1,
        countryCode: 'pe',
        subdomain: 'my-tenant',
        name: 'My Tenant',
        ownerUserId: validUuid2,
      });

      expect(tenant.id.value).toBe(validUuid1);
      expect(tenant.countryCode).toBe('PE'); // Normalized
      expect(tenant.subdomain).toBe('my-tenant');
      expect(tenant.name).toBe('My Tenant');
      expect(tenant.ownerUserId.value).toBe(validUuid2);
      expect(tenant.status).toBe('ACTIVE');

      const reconstituted = Tenant.reconstitute({
        id: validUuid1,
        countryCode: 'PE',
        subdomain: 'my-tenant',
        name: 'My Tenant',
        status: 'SUSPENDED',
        ownerUserId: validUuid2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(reconstituted.status).toBe('SUSPENDED');
    });

    it('should throw errors for invalid normalization inputs', () => {
      expect(() =>
        Tenant.create({
          id: validUuid1,
          countryCode: 'pe1', // invalid
          subdomain: 'my-tenant',
          name: 'My Tenant',
          ownerUserId: validUuid2,
        })
      ).toThrow('Invalid country code');

      expect(() =>
        Tenant.create({
          id: validUuid1,
          countryCode: 'PE',
          subdomain: 'invalid_subdomain', // invalid format
          name: 'My Tenant',
          ownerUserId: validUuid2,
        })
      ).toThrow('Invalid subdomain');

      expect(() =>
        Tenant.create({
          id: validUuid1,
          countryCode: 'PE',
          subdomain: 'sub',
          name: ' ', // too short/empty
          ownerUserId: validUuid2,
        })
      ).toThrow('Tenant name is invalid');
    });

    it('should change status', () => {
      const tenant = Tenant.create({
        id: validUuid1,
        countryCode: 'PE',
        subdomain: 'my-tenant',
        name: 'My Tenant',
        ownerUserId: validUuid2,
      });

      tenant.suspend();
      expect(tenant.status).toBe('SUSPENDED');

      tenant.activate();
      expect(tenant.status).toBe('ACTIVE');

      tenant.markTrialExpired();
      expect(tenant.status).toBe('TRIAL_EXPIRED');
    });
  });

  describe('TenantBillingProfile Entity', () => {
    it('should create and retrieve properties correctly', () => {
      const profile = TenantBillingProfile.create({
        tenantId: validUuid1,
        planTier: 'PREMIUM',
        maxBranches: 5,
        maxResources: 50,
      });

      expect(profile.tenantId.value).toBe(validUuid1);
      expect(profile.planTier).toBe('PREMIUM');
      expect(profile.maxBranches).toBe(5);
      expect(profile.maxResources).toBe(50);

      const defaultProfile = TenantBillingProfile.create({
        tenantId: validUuid1,
      });
      expect(defaultProfile.planTier).toBe('BASIC');
      expect(defaultProfile.maxBranches).toBe(1);
      expect(defaultProfile.maxResources).toBe(10);
    });
  });

  describe('Customer Entity', () => {
    it('should create and reconstitute a customer', () => {
      const customer = Customer.create({
        id: validUuid1,
        tenantId: validUuid2,
        userId: validUuid3,
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
        phone: '999999999',
        timezone: 'America/Lima',
        preferences: { notificationChannel: 'email' },
        consentSigned: true,
      });

      expect(customer.id.value).toBe(validUuid1);
      expect(customer.firstName).toBe('Juan');
      expect(customer.lastName).toBe('Perez');
      expect(customer.email.value).toBe('juan@example.com');
      expect(customer.phone).toBe('999999999');
      expect(customer.timezone).toBe('America/Lima');
      expect(customer.preferences).toEqual({ notificationChannel: 'email' });
      expect(customer.consentSigned).toBe(true);
    });

    it('should update profile properties', () => {
      const customer = Customer.create({
        id: validUuid1,
        tenantId: validUuid2,
        userId: validUuid3,
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
        phone: '999999999',
        timezone: 'America/Lima',
        consentSigned: true,
      });

      customer.updateProfile({
        firstName: 'Carlos',
        lastName: 'Gomez',
        email: 'carlos@example.com',
        phone: '888888888',
        timezone: 'America/Bogota',
        preferences: { theme: 'dark' },
        consentSigned: false,
      });

      expect(customer.firstName).toBe('Carlos');
      expect(customer.lastName).toBe('Gomez');
      expect(customer.email.value).toBe('carlos@example.com');
      expect(customer.phone).toBe('888888888');
      expect(customer.timezone).toBe('America/Bogota');
      expect(customer.preferences).toEqual({ theme: 'dark' });
      expect(customer.consentSigned).toBe(false);
    });
  });
});
