import { DataSource } from 'typeorm';
import { TenantBillingProfileRepository } from '../../../domain/repositories/tenant-billing-profile.repository';
import { TenantBillingProfile } from '../../../domain/entities/tenant-billing-profile.entity';
import { TenantId } from '../../../domain/value-objects/tenant-id.vo';
import { TypeOrmTenantBillingProfileEntity } from './entities/typeorm-tenant-billing-profile.entity';

export class TypeOrmTenantBillingProfileRepository implements TenantBillingProfileRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmTenantBillingProfileEntity);
  }

  async findByTenantId(tenantId: TenantId): Promise<TenantBillingProfile | null> {
    const entity = await this.repository.findOne({ where: { tenantId: tenantId.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(profile: TenantBillingProfile): Promise<TenantBillingProfile> {
    const persisted = await this.repository.save(this.toPersistence(profile));
    return this.toDomain(persisted);
  }

  async update(profile: TenantBillingProfile): Promise<TenantBillingProfile> {
    const persisted = await this.repository.save(this.toPersistence(profile));
    return this.toDomain(persisted);
  }

  private toDomain(entity: TypeOrmTenantBillingProfileEntity): TenantBillingProfile {
    return TenantBillingProfile.create({
      tenantId: entity.tenantId,
      planTier: entity.planTier,
      maxBranches: entity.maxBranches,
      maxResources: entity.maxResources,
    });
  }

  private toPersistence(profile: TenantBillingProfile): TypeOrmTenantBillingProfileEntity {
    const primitives = profile.toPrimitives();
    const entity = new TypeOrmTenantBillingProfileEntity();

    entity.tenantId = primitives.tenantId;
    entity.planTier = primitives.planTier;
    entity.maxBranches = primitives.maxBranches;
    entity.maxResources = primitives.maxResources;

    return entity;
  }
}
