import { RegisterUserCommandHandler } from '../../../src/application/commands/register-user.command-handler';
import { RegisterOwnerCommandHandler } from '../../../src/application/commands/register-owner.command-handler';
import { LoginCommandHandler } from '../../../src/application/commands/login.command-handler';
import { CreateTenantCommandHandler } from '../../../src/application/commands/create-tenant.command-handler';
import { CreateCustomerCommandHandler } from '../../../src/application/commands/create-customer.command-handler';
import { UpdateProfileCommandHandler } from '../../../src/application/commands/update-profile.command-handler';
import { UpdateCustomerCommandHandler } from '../../../src/application/commands/update-customer.command-handler';
import { GetUserProfileQueryHandler } from '../../../src/application/queries/get-user-profile.query-handler';
import { GetTenantQueryHandler } from '../../../src/application/queries/get-tenant.query-handler';
import { GetCustomerProfileQueryHandler } from '../../../src/application/queries/get-customer-profile.query-handler';

import { User } from '../../../src/domain/entities/user.entity';
import { Tenant } from '../../../src/domain/entities/tenant.entity';
import { Customer } from '../../../src/domain/entities/customer.entity';
import { Email } from '../../../src/domain/value-objects/email.vo';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { TenantId } from '../../../src/domain/value-objects/tenant-id.vo';

import { UserAlreadyExistsException } from '../../../src/domain/exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../../../src/domain/exceptions/user-not-found.exception';
import { TenantNotFoundException } from '../../../src/domain/exceptions/tenant-not-found.exception';
import { TenantAlreadyExistsException } from '../../../src/domain/exceptions/tenant-already-exists.exception';
import { CustomerAlreadyExistsException } from '../../../src/domain/exceptions/customer-already-exists.exception';
import { CustomerNotFoundException } from '../../../src/domain/exceptions/customer-not-found.exception';
import { InvalidCredentialsException } from '../../../src/application/exceptions/invalid-credentials.exception';

describe('CQS Handlers Unit Tests', () => {
  const validUuid1 = '123e4567-e89b-12d3-a456-426614174001';
  const validUuid2 = '123e4567-e89b-12d3-a456-426614174002';
  const validUuid3 = '123e4567-e89b-12d3-a456-426614174003';
  const dummyHash = 'a'.repeat(60);

  // Mock repositories
  let mockUserRepo: any;
  let mockTenantRepo: any;
  let mockTenantBillingRepo: any;
  let mockCustomerRepo: any;
  let mockHasher: any;
  let mockJwt: any;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn().mockResolvedValue(false),
      save: jest.fn((u) => Promise.resolve(u)),
      update: jest.fn((u) => Promise.resolve(u)),
    };
    mockTenantRepo = {
      findById: jest.fn(),
      findByOwnerUserId: jest.fn(),
      save: jest.fn((t) => Promise.resolve(t)),
    };
    mockTenantBillingRepo = {
      save: jest.fn((b) => Promise.resolve(b)),
    };
    mockCustomerRepo = {
      findByUserId: jest.fn(),
      save: jest.fn((c) => Promise.resolve(c)),
      update: jest.fn((c) => Promise.resolve(c)),
    };
    mockHasher = {
      hash: jest.fn(() => Promise.resolve(dummyHash)),
      compare: jest.fn(() => Promise.resolve(true)),
    };
    mockJwt = {
      generateToken: jest.fn(() => Promise.resolve('jwt_token')),
    };
  });

  describe('RegisterUserCommandHandler', () => {
    it('should register a new client user successfully', async () => {
      const handler = new RegisterUserCommandHandler(mockUserRepo, mockHasher);
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await handler.execute({
        email: 'client@example.com',
        password: 'securePassword123',
        fullName: 'Client User',
      });

      expect(result.id).toBeDefined();
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      expect(mockHasher.hash).toHaveBeenCalledWith('securePassword123');
    });

    it('should throw UserAlreadyExistsException if email is already taken', async () => {
      const handler = new RegisterUserCommandHandler(mockUserRepo, mockHasher);
      const existingUser = User.create({
        id: validUuid1,
        email: 'client@example.com',
        passwordHash: dummyHash,
        fullName: 'Existing Client',
      });
      mockUserRepo.findByEmail.mockResolvedValue(existingUser);

      await expect(
        handler.execute({
          email: 'client@example.com',
          password: 'securePassword123',
          fullName: 'Client User',
        })
      ).rejects.toThrow(UserAlreadyExistsException);
    });
  });

  describe('RegisterOwnerCommandHandler', () => {
    it('should register a new owner user successfully', async () => {
      const handler = new RegisterOwnerCommandHandler(mockUserRepo, mockHasher);
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await handler.execute({
        email: 'owner@example.com',
        password: 'securePassword123',
        fullName: 'Owner User',
      });

      expect(result.id).toBeDefined();
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      // Verify role assigned is OWNER
      const savedUser = mockUserRepo.save.mock.calls[0][0];
      expect(savedUser.role.isOwner()).toBe(true);
    });
  });

  describe('LoginCommandHandler', () => {
    it('should login successfully and return access token', async () => {
      const handler = new LoginCommandHandler(mockUserRepo, mockHasher, mockJwt);
      const user = User.reconstitute({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: dummyHash,
        fullName: 'Active User',
        role: 'CLIENT',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserRepo.findByEmail.mockResolvedValue(user);

      const result = await handler.execute({
        email: 'user@example.com',
        password: 'correctPassword',
      });

      expect(result.accessToken).toBe('jwt_token');
      expect(mockHasher.compare).toHaveBeenCalledWith('correctPassword', dummyHash);
    });

    it('should throw UserNotFoundException if user does not exist', async () => {
      const handler = new LoginCommandHandler(mockUserRepo, mockHasher, mockJwt);
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        handler.execute({
          email: 'nonexistent@example.com',
          password: 'password',
        })
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidCredentialsException if password is incorrect', async () => {
      const handler = new LoginCommandHandler(mockUserRepo, mockHasher, mockJwt);
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: dummyHash,
        fullName: 'User',
      });
      mockUserRepo.findByEmail.mockResolvedValue(user);
      mockHasher.compare.mockResolvedValue(false);

      await expect(
        handler.execute({
          email: 'user@example.com',
          password: 'wrongPassword',
        })
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException if user is blocked or pending', async () => {
      const handler = new LoginCommandHandler(mockUserRepo, mockHasher, mockJwt);
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: dummyHash,
        fullName: 'User',
        status: 'PENDING',
      });
      mockUserRepo.findByEmail.mockResolvedValue(user);

      await expect(
        handler.execute({
          email: 'user@example.com',
          password: 'password',
        })
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('CreateTenantCommandHandler', () => {
    it('should create tenant and billing profile successfully', async () => {
      const handler = new CreateTenantCommandHandler(mockTenantRepo, mockUserRepo, mockTenantBillingRepo);
      const ownerUser = User.reconstitute({
        id: validUuid1,
        email: 'owner@example.com',
        passwordHash: dummyHash,
        fullName: 'Owner User',
        role: 'OWNER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserRepo.findById.mockResolvedValue(ownerUser);
      mockTenantRepo.findByOwnerUserId.mockResolvedValue(null);

      const result = await handler.execute({
        ownerUserId: validUuid1,
        zoneId: validUuid3,
        countryCode: 'PE',
        subdomain: 'my-business',
        name: 'My Business',
        globalSettings: { theme: 'light' },
      });

      expect(result.id).toBeDefined();
      expect(result.subdomain).toBe('my-business');
      expect(mockTenantRepo.save).toHaveBeenCalledTimes(1);
      expect(mockTenantBillingRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw TenantNotFoundException if owner user does not exist', async () => {
      const handler = new CreateTenantCommandHandler(mockTenantRepo, mockUserRepo, mockTenantBillingRepo);
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute({
          ownerUserId: validUuid1,
          zoneId: validUuid3,
          countryCode: 'PE',
          subdomain: 'my-business',
          name: 'My Business',
        })
      ).rejects.toThrow(TenantNotFoundException);
    });

    it('should throw TenantNotFoundException if user exists but is not an owner', async () => {
      const handler = new CreateTenantCommandHandler(mockTenantRepo, mockUserRepo, mockTenantBillingRepo);
      const clientUser = User.create({
        id: validUuid1,
        email: 'client@example.com',
        passwordHash: dummyHash,
        fullName: 'Client User',
        role: 'CLIENT',
      });
      mockUserRepo.findById.mockResolvedValue(clientUser);

      await expect(
        handler.execute({
          ownerUserId: validUuid1,
          zoneId: validUuid3,
          countryCode: 'PE',
          subdomain: 'my-business',
          name: 'My Business',
        })
      ).rejects.toThrow(TenantNotFoundException);
    });

    it('should throw TenantAlreadyExistsException if owner already has a tenant', async () => {
      const handler = new CreateTenantCommandHandler(mockTenantRepo, mockUserRepo, mockTenantBillingRepo);
      const ownerUser = User.reconstitute({
        id: validUuid1,
        email: 'owner@example.com',
        passwordHash: dummyHash,
        fullName: 'Owner User',
        role: 'OWNER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const tenant = Tenant.create({
        id: validUuid1,
        ownerUserId: validUuid1,
        zoneId: validUuid3,
        countryCode: 'PE',
        subdomain: 'existing',
        name: 'Existing',
      });
      mockUserRepo.findById.mockResolvedValue(ownerUser);
      mockTenantRepo.findByOwnerUserId.mockResolvedValue(tenant);

      await expect(
        handler.execute({
          ownerUserId: validUuid1,
          zoneId: validUuid3,
          countryCode: 'PE',
          subdomain: 'new',
          name: 'New',
        })
      ).rejects.toThrow(TenantAlreadyExistsException);
    });
  });

  describe('CreateCustomerCommandHandler', () => {
    it('should create customer successfully', async () => {
      const handler = new CreateCustomerCommandHandler(mockCustomerRepo, mockTenantRepo);
      const tenant = Tenant.create({
        id: validUuid2,
        ownerUserId: validUuid1,
        zoneId: validUuid3,
        countryCode: 'PE',
        subdomain: 'my-tenant',
        name: 'My Tenant',
      });
      mockTenantRepo.findById.mockResolvedValue(tenant);
      mockCustomerRepo.findByUserId.mockResolvedValue(null);

      const result = await handler.execute({
        tenantId: validUuid2,
        userId: validUuid3,
        zoneId: validUuid3,
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
        phone: '999999999',
        timezone: 'America/Lima',
        consentSigned: true,
        preferences: {},
      });

      expect(result.id).toBeDefined();
      expect(result.firstName).toBe('Juan');
      expect(mockCustomerRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw TenantNotFoundException if tenant does not exist', async () => {
      const handler = new CreateCustomerCommandHandler(mockCustomerRepo, mockTenantRepo);
      mockTenantRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute({
          tenantId: validUuid2,
          userId: validUuid3,
          zoneId: validUuid3,
          firstName: 'Juan',
          lastName: 'Perez',
          email: 'juan@example.com',
          phone: '999999999',
          timezone: 'America/Lima',
          consentSigned: true,
        })
      ).rejects.toThrow(TenantNotFoundException);
    });

    it('should throw CustomerAlreadyExistsException if customer already exists for user', async () => {
      const handler = new CreateCustomerCommandHandler(mockCustomerRepo, mockTenantRepo);
      const tenant = Tenant.create({
        id: validUuid2,
        ownerUserId: validUuid1,
        zoneId: validUuid3,
        countryCode: 'PE',
        subdomain: 'my-tenant',
        name: 'My Tenant',
      });
      const customer = Customer.create({
        id: validUuid1,
        tenantId: validUuid2,
        zoneId: validUuid3,
        userId: validUuid3,
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
        phone: '999999999',
        timezone: 'America/Lima',
        consentSigned: true,
      });
      mockTenantRepo.findById.mockResolvedValue(tenant);
      mockCustomerRepo.findByUserId.mockResolvedValue(customer);

      await expect(
        handler.execute({
          tenantId: validUuid2,
          userId: validUuid3,
          zoneId: validUuid3,
          firstName: 'Juan',
          lastName: 'Perez',
          email: 'juan@example.com',
          phone: '999999999',
          timezone: 'America/Lima',
          consentSigned: true,
        })
      ).rejects.toThrow(CustomerAlreadyExistsException);
    });
  });

  describe('UpdateProfileCommandHandler & UpdateCustomerCommandHandler', () => {
    it('should update user profile successfully', async () => {
      const handler = new UpdateProfileCommandHandler(mockUserRepo);
      const user = User.create({
        id: validUuid1,
        email: 'old@example.com',
        passwordHash: dummyHash,
        fullName: 'Old Name',
      });
      mockUserRepo.findById.mockResolvedValue(user);

      await handler.execute({
        userId: validUuid1,
        fullName: 'New Name',
        email: 'new@example.com',
      });

      expect(user.fullName.value).toBe('New Name');
      expect(user.email.value).toBe('new@example.com');
      expect(mockUserRepo.update).toHaveBeenCalledWith(user);
    });

    it('should update customer successfully', async () => {
      const handler = new UpdateCustomerCommandHandler(mockCustomerRepo);
      const customer = Customer.create({
        id: validUuid1,
        tenantId: validUuid2,
        zoneId: validUuid3,
        userId: validUuid3,
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
        phone: '999999999',
        timezone: 'America/Lima',
        consentSigned: true,
      });
      mockCustomerRepo.findByUserId.mockResolvedValue(customer);

      await handler.execute({
        userId: validUuid3,
        firstName: 'Carlos',
        lastName: 'Gomez',
        email: 'carlos@example.com',
        phone: '888888888',
        timezone: 'America/Bogota',
        consentSigned: false,
        preferences: { theme: 'dark' },
      });

      expect(customer.firstName).toBe('Carlos');
      expect(customer.lastName).toBe('Gomez');
      expect(customer.email.value).toBe('carlos@example.com');
      expect(customer.phone).toBe('888888888');
      expect(customer.timezone).toBe('America/Bogota');
      expect(customer.consentSigned).toBe(false);
      expect(customer.preferences).toEqual({ theme: 'dark' });
      expect(mockCustomerRepo.update).toHaveBeenCalledWith(customer);
    });
  });

  describe('Query Handlers', () => {
    it('should execute GetUserProfileQueryHandler successfully', async () => {
      const handler = new GetUserProfileQueryHandler(mockUserRepo);
      const user = User.create({
        id: validUuid1,
        email: 'user@example.com',
        passwordHash: dummyHash,
        fullName: 'User Profile',
      });
      mockUserRepo.findById.mockResolvedValue(user);

      const result = await handler.execute({ userId: validUuid1 });
      expect(result.id).toBe(validUuid1);
      expect(result.fullName).toBe('User Profile');
    });

    it('should execute GetTenantQueryHandler successfully', async () => {
      const handler = new GetTenantQueryHandler(mockTenantRepo);
      const tenant = Tenant.create({
        id: validUuid1,
        ownerUserId: validUuid2,
        zoneId: validUuid3,
        countryCode: 'PE',
        subdomain: 'test-tenant',
        name: 'Test Tenant',
      });
      mockTenantRepo.findById.mockResolvedValue(tenant);

      const result = await handler.execute({ tenantId: validUuid1 });
      expect(result.id).toBe(validUuid1);
      expect(result.name).toBe('Test Tenant');
    });

    it('should execute GetCustomerProfileQueryHandler successfully', async () => {
      const handler = new GetCustomerProfileQueryHandler(mockCustomerRepo);
      const customer = Customer.create({
        id: validUuid1,
        tenantId: validUuid2,
        zoneId: validUuid3,
        userId: validUuid3,
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
        phone: '999999999',
        timezone: 'America/Lima',
        consentSigned: true,
      });
      mockCustomerRepo.findByUserId.mockResolvedValue(customer);

      const result = await handler.execute({ userId: validUuid3 });
      expect(result.id).toBe(validUuid1);
      expect(result.firstName).toBe('Juan');
    });
  });
});
