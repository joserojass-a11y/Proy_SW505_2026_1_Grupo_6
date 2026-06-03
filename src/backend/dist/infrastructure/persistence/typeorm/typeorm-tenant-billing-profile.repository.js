"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmTenantBillingProfileRepository = void 0;
const tenant_billing_profile_entity_1 = require("../../../domain/entities/tenant-billing-profile.entity");
const typeorm_tenant_billing_profile_entity_1 = require("./entities/typeorm-tenant-billing-profile.entity");
class TypeOrmTenantBillingProfileRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get repository() {
        return this.dataSource.getRepository(typeorm_tenant_billing_profile_entity_1.TypeOrmTenantBillingProfileEntity);
    }
    async findByTenantId(tenantId) {
        const entity = await this.repository.findOne({ where: { tenantId: tenantId.value } });
        return entity ? this.toDomain(entity) : null;
    }
    async save(profile) {
        const persisted = await this.repository.save(this.toPersistence(profile));
        return this.toDomain(persisted);
    }
    async update(profile) {
        const persisted = await this.repository.save(this.toPersistence(profile));
        return this.toDomain(persisted);
    }
    toDomain(entity) {
        return tenant_billing_profile_entity_1.TenantBillingProfile.create({
            tenantId: entity.tenantId,
            planTier: entity.planTier,
            maxBranches: entity.maxBranches,
            maxResources: entity.maxResources,
        });
    }
    toPersistence(profile) {
        const primitives = profile.toPrimitives();
        const entity = new typeorm_tenant_billing_profile_entity_1.TypeOrmTenantBillingProfileEntity();
        entity.tenantId = primitives.tenantId;
        entity.planTier = primitives.planTier;
        entity.maxBranches = primitives.maxBranches;
        entity.maxResources = primitives.maxResources;
        return entity;
    }
}
exports.TypeOrmTenantBillingProfileRepository = TypeOrmTenantBillingProfileRepository;
