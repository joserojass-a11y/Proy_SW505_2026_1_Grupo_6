"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmTenantRepository = void 0;
const tenant_entity_1 = require("../../../domain/entities/tenant.entity");
const user_id_vo_1 = require("../../../domain/value-objects/user-id.vo");
const typeorm_tenant_entity_1 = require("./entities/typeorm-tenant.entity");
class TypeOrmTenantRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get repository() {
        return this.dataSource.getRepository(typeorm_tenant_entity_1.TypeOrmTenantEntity);
    }
    async findById(id) {
        const entity = await this.repository.findOne({ where: { id: id.value } });
        return entity ? this.toDomain(entity) : null;
    }
    async findBySubdomain(subdomain) {
        const entity = await this.repository.findOne({ where: { subdomain } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByOwnerUserId(ownerUserId) {
        const entity = await this.repository.findOne({ where: { ownerUserId } });
        return entity ? this.toDomain(entity) : null;
    }
    async save(tenant) {
        const persisted = await this.repository.save(this.toPersistence(tenant));
        return this.toDomain(persisted);
    }
    async update(tenant) {
        const persisted = await this.repository.save(this.toPersistence(tenant));
        return this.toDomain(persisted);
    }
    toDomain(entity) {
        return tenant_entity_1.Tenant.reconstitute({
            id: entity.id,
            countryCode: entity.countryCode,
            status: entity.status,
            subdomain: entity.subdomain,
            name: entity.name,
            globalSettings: entity.globalSettings,
            ownerUserId: user_id_vo_1.UserId.create(entity.ownerUserId),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
    toPersistence(tenant) {
        const primitives = tenant.toPrimitives();
        const entity = new typeorm_tenant_entity_1.TypeOrmTenantEntity();
        entity.id = primitives.id;
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
exports.TypeOrmTenantRepository = TypeOrmTenantRepository;
