import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { INFRASTRUCTURE_TOKENS } from '../../../src/infrastructure/shared/infrastructure.tokens';
import { startTestDatabase, stopTestDatabase, clearDatabase } from '../helpers/db-test-helper';
import { TypeOrmUserRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-user.repository';
import { TypeOrmTenantRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-tenant.repository';
import { Tenant } from '../../../src/domain/entities/tenant.entity';

describe('CustomersController Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: TypeOrmUserRepository;
  let tenantRepository: TypeOrmTenantRepository;

  beforeAll(async () => {
    dataSource = await startTestDatabase();
    userRepository = new TypeOrmUserRepository(dataSource);
    tenantRepository = new TypeOrmTenantRepository(dataSource);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(INFRASTRUCTURE_TOKENS.DATA_SOURCE)
      .useValue(dataSource)
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
    // Registrar Owner
    await request(app.getHttpServer())
      .post('/auth/register-owner')
      .send({ email: 'owner@example.com', password: 'securePassword123', fullName: 'Owner User' });

    const owner = await userRepository.findByEmail({ value: 'owner@example.com' } as any);
    owner!.activate();
    await userRepository.save(owner!);

    const tenant = Tenant.create({
      id: '123e4567-e89b-12d3-a456-426614174099',
      ownerUserId: owner!.id,
      zoneId: '123e4567-e89b-12d3-a456-426614174099',
      countryCode: 'PE',
      subdomain: 'my-business',
      name: 'My Business',
    });
    await tenantRepository.save(tenant);
    return tenant.id.value;
  }

  async function getAuthenticatedClientToken(email: string): Promise<string> {
    // Registrar Client
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'securePassword123', fullName: 'Client User' });

    // Activar
    const user = await userRepository.findByEmail({ value: email } as any);
    user!.activate();
    await userRepository.save(user!);

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'securePassword123' });

    return loginRes.body.accessToken;
  }

  it('POST, GET, PUT /customers endpoints flow', async () => {
    const tenantId = await setupTenant();
    const token = await getAuthenticatedClientToken('client@example.com');

    // 1. Crear Cliente
    const createRes = await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenantId,
        zoneId: '123e4567-e89b-12d3-a456-426614174099',
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'client@example.com',
        phone: '999999999',
        timezone: 'America/Lima',
        preferences: { theme: 'light' },
        consentSigned: true,
      })
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.firstName).toBe('Juan');

    // 2. Obtener Cliente (me)
    const getRes = await request(app.getHttpServer())
      .get('/customers/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.firstName).toBe('Juan');
    expect(getRes.body.email).toBe('client@example.com');
    expect(getRes.body.preferences).toEqual({ theme: 'light' });

    // 3. Actualizar Cliente (me)
    await request(app.getHttpServer())
      .put('/customers/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Juan Carlos',
        lastName: 'Perez Gomez',
        email: 'client_new@example.com',
        phone: '888888888',
        timezone: 'America/Bogota',
        preferences: { theme: 'dark' },
        consentSigned: false,
      })
      .expect(200);

    // Verificar actualización
    const getResUpdated = await request(app.getHttpServer())
      .get('/customers/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getResUpdated.body.firstName).toBe('Juan Carlos');
    expect(getResUpdated.body.lastName).toBe('Perez Gomez');
    expect(getResUpdated.body.email).toBe('client_new@example.com');
    expect(getResUpdated.body.phone).toBe('888888888');
    expect(getResUpdated.body.preferences).toEqual({ theme: 'dark' });
    expect(getResUpdated.body.consentSigned).toBe(false);
  });
});
