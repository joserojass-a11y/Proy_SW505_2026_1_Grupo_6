import { DataSource } from 'typeorm';
import { startTestDatabase, stopTestDatabase, clearDatabase } from '../helpers/db-test-helper';
import { TypeOrmCustomerRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-customer.repository';
import { TypeOrmUserRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-user.repository';
import { TypeOrmTenantRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-tenant.repository';
import { Customer } from '../../../src/domain/entities/customer.entity';
import { User } from '../../../src/domain/entities/user.entity';
import { Tenant } from '../../../src/domain/entities/tenant.entity';
import { CustomerId } from '../../../src/domain/value-objects/customer-id.vo';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { TenantId } from '../../../src/domain/value-objects/tenant-id.vo';

describe('TypeOrmCustomerRepository Integration Tests', () => {
  let dataSource: DataSource;
  let customerRepository: TypeOrmCustomerRepository;
  let userRepository: TypeOrmUserRepository;
  let tenantRepository: TypeOrmTenantRepository;

  const validUserId = '123e4567-e89b-12d3-a456-426614174001';
  const validTenantId = '123e4567-e89b-12d3-a456-426614174002';
  const validCustomerId = '123e4567-e89b-12d3-a456-426614174003';
  const dummyHash = 'a'.repeat(60);

  beforeAll(async () => {
    dataSource = await startTestDatabase();
    customerRepository = new TypeOrmCustomerRepository(dataSource);
    userRepository = new TypeOrmUserRepository(dataSource);
    tenantRepository = new TypeOrmTenantRepository(dataSource);
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  it('should save a customer and find it by id and userId', async () => {
    // 1. Crear y guardar usuario propietario (para el tenant)
    const ownerUser = User.create({
      id: '123e4567-e89b-12d3-a456-426614174099',
      email: 'owner@example.com',
      passwordHash: dummyHash,
      fullName: 'Owner User',
      role: 'OWNER',
      status: 'ACTIVE',
    });
    await userRepository.save(ownerUser);

    // 2. Crear y guardar tenant
    const tenant = Tenant.create({
      id: validTenantId,
      ownerUserId: ownerUser.id,
      countryCode: 'PE',
      subdomain: 'my-tenant',
      name: 'My Tenant',
    });
    await tenantRepository.save(tenant);

    // 3. Crear y guardar usuario cliente (para el cliente)
    const clientUser = User.create({
      id: validUserId,
      email: 'customer@example.com',
      passwordHash: dummyHash,
      fullName: 'Customer User',
      role: 'CLIENT',
      status: 'ACTIVE',
    });
    await userRepository.save(clientUser);

    // 4. Crear y guardar cliente (Customer)
    const customer = Customer.create({
      id: validCustomerId,
      tenantId: validTenantId,
      userId: validUserId,
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'juan@example.com',
      phone: '999999999',
      timezone: 'America/Lima',
      preferences: { notify: 'email' },
      consentSigned: true,
    });

    const savedCustomer = await customerRepository.save(customer);
    expect(savedCustomer.id.value).toBe(validCustomerId);

    // 5. Buscar por ID
    const foundById = await customerRepository.findById(CustomerId.create(validCustomerId));
    expect(foundById).not.toBeNull();
    expect(foundById!.firstName).toBe('Juan');
    expect(foundById!.preferences).toEqual({ notify: 'email' });

    // 6. Buscar por UserId
    const foundByUserId = await customerRepository.findByUserId(UserId.create(validUserId));
    expect(foundByUserId).not.toBeNull();
    expect(foundByUserId!.id.value).toBe(validCustomerId);
  });
});
