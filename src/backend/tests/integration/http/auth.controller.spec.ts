import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { INFRASTRUCTURE_TOKENS } from '../../../src/infrastructure/shared/infrastructure.tokens';
import { startTestDatabase, stopTestDatabase, clearDatabase } from '../helpers/db-test-helper';
import { TypeOrmUserRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-user.repository';
import { User } from '../../../src/domain/entities/user.entity';

describe('AuthController Integration Tests', () => {
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

  it('POST /auth/register should register a user successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'securePassword123',
        fullName: 'Test User',
      })
      .expect(201);

    expect(response.body.id).toBeDefined();

    const foundUser = await userRepository.findByEmail(
      await userRepository.findById(response.body.id).then((u) => u!.email)
    );
    expect(foundUser).not.toBeNull();
    expect(foundUser!.email.value).toBe('test@example.com');
    expect(foundUser!.role.isClient()).toBe(true);
  });

  it('POST /auth/register-owner should register an owner successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register-owner')
      .send({
        email: 'owner@example.com',
        password: 'securePassword123',
        fullName: 'Owner User',
      })
      .expect(201);

    expect(response.body.id).toBeDefined();

    const foundUser = await userRepository.findById(response.body.id);
    expect(foundUser).not.toBeNull();
    expect(foundUser!.role.isOwner()).toBe(true);
  });

  it('POST /auth/login should authenticate user and return access token', async () => {
    // 1. Registrar usuario
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'login@example.com',
        password: 'securePassword123',
        fullName: 'Login User',
      })
      .expect(201);

    // Activar usuario ya que se crea como PENDING
    const user = await userRepository.findByEmail({ value: 'login@example.com' } as any);
    user!.activate();
    await userRepository.save(user!);

    // 2. Login
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login@example.com',
        password: 'securePassword123',
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.tokenType).toBe('Bearer');
  });

  it('POST /auth/logout should return 204', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(204);
  });
});
