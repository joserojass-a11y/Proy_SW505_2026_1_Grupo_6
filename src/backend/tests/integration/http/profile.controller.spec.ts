import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { INFRASTRUCTURE_TOKENS } from '../../../src/infrastructure/shared/infrastructure.tokens';
import { startTestDatabase, stopTestDatabase, clearDatabase } from '../helpers/db-test-helper';
import { TypeOrmUserRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-user.repository';

describe('ProfileController Integration Tests', () => {
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

  async function getAuthenticatedUserToken(email: string): Promise<string> {
    // Registrar
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'securePassword123', fullName: 'Test User' });

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

  it('GET /profile should return 401 if unauthorized', async () => {
    await request(app.getHttpServer())
      .get('/profile')
      .expect(401);
  });

  it('GET /profile should return user profile if authorized', async () => {
    const email = 'user@example.com';
    const token = await getAuthenticatedUserToken(email);

    const response = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.email).toBe(email);
    expect(response.body.fullName).toBe('Test User');
  });

  it('PUT /profile should update profile info', async () => {
    const email = 'user2@example.com';
    const token = await getAuthenticatedUserToken(email);

    await request(app.getHttpServer())
      .put('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'New Name' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.fullName).toBe('New Name');
  });
});
