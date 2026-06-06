import { DataSource } from 'typeorm';
import { TenantRepository } from '../../../domain/repositories/tenant.repository';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { TenantId } from '../../../domain/value-objects/tenant-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { TypeOrmTenantEntity } from './entities/typeorm-tenant.entity';

export class TypeOrmTenantRepository implements TenantRepository {
  constructor(private readonly dataSource: DataSource) { }

  private get repository() {
    return this.dataSource.getRepository(TypeOrmTenantEntity);
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    const entity = await this.repository.findOne({ where: { subdomain } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Tenant | null> {
    const entity = await this.repository.findOne({ where: { ownerUserId } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const persisted = await this.repository.save(this.toPersistence(tenant));
    return this.toDomain(persisted);
  }

  async update(tenant: Tenant): Promise<Tenant> {
    const persisted = await this.repository.save(this.toPersistence(tenant));
    return this.toDomain(persisted);
  }

  private toDomain(entity: TypeOrmTenantEntity): Tenant {
    return Tenant.reconstitute({
      id: entity.id,
      zoneId: entity.zoneId,
      countryCode: entity.countryCode,
      status: entity.status,
      subdomain: entity.subdomain,
      name: entity.name,
      globalSettings: entity.globalSettings,
      ownerUserId: UserId.create(entity.ownerUserId),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toPersistence(tenant: Tenant): TypeOrmTenantEntity {
    const primitives = tenant.toPrimitives();
    const entity = new TypeOrmTenantEntity();

    entity.id = primitives.id;
    entity.zoneId = primitives.zoneId;
    entity.countryCode = primitives.countryCode;
    entity.status = primitives.status;
    entity.subdomain = primitives.subdomain;
    entity.name = primitives.name;
    entity.globalSettings = primitives.globalSettings;
    entity.ownerUserId = primitives.ownerUserId;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;

    return entity;
  }
}
