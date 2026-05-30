import { DataSource, Not } from 'typeorm';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserStatus } from '../../../domain/value-objects/user-status.vo';
import { TypeOrmUserEntity } from './entities/typeorm-user.entity';

export class TypeOrmUserRepository implements UserRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmUserEntity);
  }

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email: email.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async existsByEmail(email: Email, excludeUserId?: UserId): Promise<boolean> {
    const count = await this.repository.count({
      where: excludeUserId
        ? { email: email.value, id: Not(excludeUserId.value) }
        : { email: email.value },
    });

    return count > 0;
  }

  async save(user: User): Promise<User> {
    const persisted = await this.repository.save(this.toPersistence(user));
    return this.toDomain(persisted);
  }

  async update(user: User): Promise<User> {
    const persisted = await this.repository.save(this.toPersistence(user));
    return this.toDomain(persisted);
  }

  async updateStatus(id: UserId, status: UserStatus): Promise<void> {
    await this.repository.update(
      { id: id.value },
      {
        status: status.value,
        updatedAt: new Date(),
      },
    );
  }

  async deleteById(id: UserId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }

  private toDomain(entity: TypeOrmUserEntity): User {
    return User.reconstitute({
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      fullName: entity.fullName,
      role: entity.role,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toPersistence(user: User): TypeOrmUserEntity {
    const primitives = user.toPrimitives();
    const entity = new TypeOrmUserEntity();

    entity.id = primitives.id;
    entity.email = primitives.email;
    entity.passwordHash = primitives.passwordHash;
    entity.fullName = primitives.fullName;
    entity.role = primitives.role;
    entity.status = primitives.status;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;

    return entity;
  }
}
