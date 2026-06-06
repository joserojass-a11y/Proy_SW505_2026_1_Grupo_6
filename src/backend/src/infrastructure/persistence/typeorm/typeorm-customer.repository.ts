import { DataSource } from 'typeorm';
import { CustomerRepository } from '../../../domain/repositories/customer.repository';
import { Customer } from '../../../domain/entities/customer.entity';
import { CustomerId } from '../../../domain/value-objects/customer-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { TypeOrmCustomerEntity } from './entities/typeorm-customer.entity';

export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmCustomerEntity);
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: UserId): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { userId: userId.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const persisted = await this.repository.save(this.toPersistence(customer));
    return this.toDomain(persisted);
  }

  async update(customer: Customer): Promise<Customer> {
    const persisted = await this.repository.save(this.toPersistence(customer));
    return this.toDomain(persisted);
  }

  private toDomain(entity: TypeOrmCustomerEntity): Customer {
    return Customer.reconstitute({
      id: entity.id,
      tenantId: entity.tenantId,
      zoneId: entity.zoneId,
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      timezone: entity.timezone,
      preferences: entity.preferences,
      consentSigned: entity.consentSigned,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toPersistence(customer: Customer): TypeOrmCustomerEntity {
    const primitives = customer.toPrimitives();
    const entity = new TypeOrmCustomerEntity();

    entity.id = primitives.id;
    entity.tenantId = primitives.tenantId;
    entity.zoneId = primitives.zoneId;
    entity.userId = primitives.userId;
    entity.firstName = primitives.firstName;
    entity.lastName = primitives.lastName;
    entity.email = primitives.email;
    entity.phone = primitives.phone;
    entity.timezone = primitives.timezone;
    entity.preferences = primitives.preferences;
    entity.consentSigned = primitives.consentSigned;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;

    return entity;
  }
}
