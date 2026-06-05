import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { INFRASTRUCTURE_TOKENS } from '../../../src/infrastructure/shared/infrastructure.tokens';
import { startTestDatabase, stopTestDatabase, clearDatabase } from '../helpers/db-test-helper';
import { TypeOrmUserRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-user.repository';
import { TypeOrmTenantRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-tenant.repository';
import { TypeOrmCustomerRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-customer.repository';
import { Tenant } from '../../../src/domain/entities/tenant.entity';
import { Customer } from '../../../src/domain/entities/customer.entity';

describe('BookingController Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: TypeOrmUserRepository;
  let tenantRepository: TypeOrmTenantRepository;
  let customerRepository: TypeOrmCustomerRepository;

  beforeAll(async () => {
    dataSource = await startTestDatabase();
    userRepository = new TypeOrmUserRepository(dataSource);
    tenantRepository = new TypeOrmTenantRepository(dataSource);
    customerRepository = new TypeOrmCustomerRepository(dataSource);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(INFRASTRUCTURE_TOKENS.DATA_SOURCE)
      .useValue(dataSource)
      // Availability Service is already mocked in BookingModule
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  async function setupTenant(): Promise<string> {
    await request(app.getHttpServer())
      .post('/auth/register-owner')
      .send({ email: 'owner@example.com', password: 'securePassword123', fullName: 'Owner User' });

    const owner = await userRepository.findByEmail({ value: 'owner@example.com' } as any);
    owner!.activate();
    await userRepository.save(owner!);

    const tenant = Tenant.create({
      id: '123e4567-e89b-12d3-a456-426614174099',
      ownerUserId: owner!.id,
      countryCode: 'PE',
      subdomain: 'my-business',
      name: 'My Business',
    });
    await tenantRepository.save(tenant);
    return tenant.id.value;
  }

  async function getAuthenticatedClientToken(email: string): Promise<{ token: string, userId: string }> {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'securePassword123', fullName: 'Client User' });

    const user = await userRepository.findByEmail({ value: email } as any);
    user!.activate();
    await userRepository.save(user!);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'securePassword123' });

    return { token: loginRes.body.accessToken, userId: user!.id.value };
  }

  it('Debe permitir crear, obtener y listar reservas', async () => {
    const tenantId = await setupTenant();
    const { token, userId } = await getAuthenticatedClientToken('client@example.com');

    // Create a customer first so it can be associated with the booking
    const customer = Customer.create({
      id: '223e4567-e89b-12d3-a456-426614174099',
      tenantId,
      userId,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'client@example.com',
      phone: '123456789',
      timezone: 'UTC',
      consentSigned: true,
    });
    await customerRepository.save(customer);

    const serviceId = '323e4567-e89b-12d3-a456-426614174099';
    const resourceId = '423e4567-e89b-12d3-a456-426614174099';

    // 1. Create a booking (Happy Path)
    const createRes = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenantId,
        branchId: '823e4567-e89b-12d3-a456-426614174099',
        customerId: customer.id.value,
        serviceId,
        resourceId,
        startsAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endsAt: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1h
        customerTimezone: 'UTC',
        sourceChannel: 'WEB',
        notes: 'Test note',
      })
      .expect(201);

    const bookingId = createRes.body.id;
    expect(bookingId).toBeDefined();

    // 2. Get the booking by ID
    const getRes = await request(app.getHttpServer())
      .get(`/bookings/${bookingId}?tenantId=${tenantId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.id).toBe(bookingId);
    expect(getRes.body.tenantId).toBe(tenantId);
    expect(getRes.body.customerId).toBe(customer.id.value);

    // 3. List bookings
    const listRes = await request(app.getHttpServer())
      .get(`/bookings?tenantId=${tenantId}&customerId=${customer.id.value}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body[0].id).toBe(bookingId);
  });

  it('Debe prevenir el doble agendamiento (Double Booking) manejando locks negativos [Caso Negativo]', async () => {
    const tenantId = await setupTenant();
    const { token, userId } = await getAuthenticatedClientToken('doublebooking@example.com');

    const customer = Customer.create({
      id: '523e4567-e89b-12d3-a456-426614174099',
      tenantId,
      userId,
      firstName: 'Double',
      lastName: 'Booking',
      email: 'doublebooking@example.com',
      phone: '123456789',
      timezone: 'UTC',
      consentSigned: true,
    });
    await customerRepository.save(customer);

    const serviceId = '623e4567-e89b-12d3-a456-426614174099';
    const resourceId = '723e4567-e89b-12d3-a456-426614174099';
    const startsAt = new Date(Date.now() + 172800000).toISOString(); // In 2 days
    const endsAt = new Date(Date.now() + 172800000 + 3600000).toISOString();

    const payload = {
      tenantId,
      branchId: '823e4567-e89b-12d3-a456-426614174099',
      customerId: customer.id.value,
      serviceId,
      resourceId,
      startsAt,
      endsAt,
      customerTimezone: 'UTC',
      sourceChannel: 'WEB',
    };

    // First booking
    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    // Second booking on the exact same resource and time slot
    // The Availability Service Mock will pass, but the pessimistic lock in TypeORM might reject it if it conflicts
    // Actually, in integration, since Availability Service is mocked, it might allow it if the mock always says "true".
    // Wait, let's see how TypeOrmBookingRepository handles `findOverlappingBookings`.
    // It should detect the conflict and the command handler should throw a ConflictException.
    const conflictRes = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(409); // Conflict HTTP status

    expect(conflictRes.body.message).toContain('already exists');
  });
});
