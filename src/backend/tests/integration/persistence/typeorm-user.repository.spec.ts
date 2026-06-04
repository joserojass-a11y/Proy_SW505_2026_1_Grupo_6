import { DataSource } from 'typeorm';
import { startTestDatabase, stopTestDatabase, clearDatabase } from '../helpers/db-test-helper';
import { TypeOrmUserRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-user.repository';
import { User } from '../../../src/domain/entities/user.entity';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { Email } from '../../../src/domain/value-objects/email.vo';
import { UserStatus } from '../../../src/domain/value-objects/user-status.vo';

describe('TypeOrmUserRepository Integration Tests', () => {
  let dataSource: DataSource;
  let userRepository: TypeOrmUserRepository;

  const validUuid1 = '123e4567-e89b-12d3-a456-426614174001';
  const validUuid2 = '123e4567-e89b-12d3-a456-426614174002';

  beforeAll(async () => {
    // Levanta el contenedor de Postgres y configura TypeORM
    dataSource = await startTestDatabase();
    userRepository = new TypeOrmUserRepository(dataSource);
  });

  afterAll(async () => {
    // Apaga el contenedor
    await stopTestDatabase();
  });

  beforeEach(async () => {
    // Limpia las tablas antes de cada test para asegurar aislamiento
    await clearDatabase(dataSource);
  });

  it('should save a user and find it by id', async () => {
    const user = User.create({
      id: validUuid1,
      email: 'test@example.com',
      passwordHash: 'a'.repeat(60),
      fullName: 'Test User',
      role: 'CLIENT',
      status: 'PENDING',
    });

    const savedUser = await userRepository.save(user);
    expect(savedUser.id.value).toBe(validUuid1);

    const foundUser = await userRepository.findById(UserId.create(validUuid1));
    expect(foundUser).not.toBeNull();
    expect(foundUser!.email.value).toBe('test@example.com');
    expect(foundUser!.fullName.value).toBe('Test User');
    expect(foundUser!.role.value).toBe('CLIENT');
    expect(foundUser!.status.value).toBe('PENDING');
  });

  it('should find user by email', async () => {
    const user = User.create({
      id: validUuid1,
      email: 'test@example.com',
      passwordHash: 'a'.repeat(60),
      fullName: 'Test User',
    });
    await userRepository.save(user);

    const foundUser = await userRepository.findByEmail(Email.create('test@example.com'));
    expect(foundUser).not.toBeNull();
    expect(foundUser!.id.value).toBe(validUuid1);

    const nonexistent = await userRepository.findByEmail(Email.create('nonexistent@example.com'));
    expect(nonexistent).toBeNull();
  });

  it('should verify if email exists', async () => {
    const user = User.create({
      id: validUuid1,
      email: 'test@example.com',
      passwordHash: 'a'.repeat(60),
      fullName: 'Test User',
    });
    await userRepository.save(user);

    const exists = await userRepository.existsByEmail(Email.create('test@example.com'));
    expect(exists).toBe(true);

    const existsExcludeSelf = await userRepository.existsByEmail(
      Email.create('test@example.com'),
      UserId.create(validUuid1)
    );
    expect(existsExcludeSelf).toBe(false);

    const existsExcludeOther = await userRepository.existsByEmail(
      Email.create('test@example.com'),
      UserId.create(validUuid2)
    );
    expect(existsExcludeOther).toBe(true);

    const notExists = await userRepository.existsByEmail(Email.create('other@example.com'));
    expect(notExists).toBe(false);
  });

  it('should update user information and status', async () => {
    const user = User.create({
      id: validUuid1,
      email: 'test@example.com',
      passwordHash: 'a'.repeat(60),
      fullName: 'Test User',
      status: 'PENDING',
    });
    await userRepository.save(user);

    user.updateProfile({ fullName: 'Updated Name' });
    const updatedUser = await userRepository.update(user);
    expect(updatedUser.fullName.value).toBe('Updated Name');

    await userRepository.updateStatus(UserId.create(validUuid1), UserStatus.active());
    const foundUser = await userRepository.findById(UserId.create(validUuid1));
    expect(foundUser!.status.isActive()).toBe(true);
  });

  it('should delete user by id', async () => {
    const user = User.create({
      id: validUuid1,
      email: 'test@example.com',
      passwordHash: 'a'.repeat(60),
      fullName: 'Test User',
    });
    await userRepository.save(user);

    await userRepository.deleteById(UserId.create(validUuid1));
    const foundUser = await userRepository.findById(UserId.create(validUuid1));
    expect(foundUser).toBeNull();
  });
});
