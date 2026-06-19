import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { INFRASTRUCTURE_TOKENS } from '../../../src/infrastructure/shared/infrastructure.tokens';
import { startTestDatabase, stopTestDatabase, clearDatabase } from '../helpers/db-test-helper';
import { TypeOrmUserRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-user.repository';

describe('CompaniesController (Tenants) Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: TypeOrmUserRepository;

  beforeAll(async () => {
    dataSource = await startTestDatabase();
    userRepository = new TypeOrmUserRepository(dataSource);

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

  async function getAuthenticatedOwnerToken(email: string): Promise<string> {
    // Registrar Owner
    await request(app.getHttpServer())
      .post('/auth/register-owner')
      .send({ email, password: 'securePassword123', fullName: 'Owner User' });

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

  it('POST /tenants and GET /tenants/:id should create and retrieve tenant successfully', async () => {
    const token = await getAuthenticatedOwnerToken('owner@example.com');

    // Crear Tenant
    const createRes = await request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        zoneId: '123e4567-e89b-12d3-a456-426614174099',
        countryCode: 'PE',
        subdomain: 'my-business',
        name: 'My Business',
        globalSettings: { theme: 'light' },
      })
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.subdomain).toBe('my-business');

    const tenantId = createRes.body.id;

    // Obtener Tenant
    const getRes = await request(app.getHttpServer())
      .get(`/tenants/${tenantId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.id).toBe(tenantId);
    expect(getRes.body.name).toBe('My Business');
  });

  it('POST /tenants should fail if role is CLIENT', async () => {
    // Registrar Client
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'client@example.com', password: 'securePassword123', fullName: 'Client User' });

    const user = await userRepository.findByEmail({ value: 'client@example.com' } as any);
    user!.activate();
    await userRepository.save(user!);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'client@example.com', password: 'securePassword123' });

    const clientToken = loginRes.body.accessToken;

    // Intentar crear Tenant (Debe dar 403 Forbidden ya que solo OWNER tiene permiso)
    await request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        zoneId: '123e4567-e89b-12d3-a456-426614174099',
        countryCode: 'PE',
        subdomain: 'my-business',
        name: 'My Business',
      })
      .expect(403);
  });
});
