"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmCustomerRepository = void 0;
const customer_entity_1 = require("../../../domain/entities/customer.entity");
const typeorm_customer_entity_1 = require("./entities/typeorm-customer.entity");
class TypeOrmCustomerRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get repository() {
        return this.dataSource.getRepository(typeorm_customer_entity_1.TypeOrmCustomerEntity);
    }
    async findById(id) {
        const entity = await this.repository.findOne({ where: { id: id.value } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByUserId(userId) {
        const entity = await this.repository.findOne({ where: { userId: userId.value } });
        return entity ? this.toDomain(entity) : null;
    }
    async save(customer) {
        const persisted = await this.repository.save(this.toPersistence(customer));
        return this.toDomain(persisted);
    }
    async update(customer) {
        const persisted = await this.repository.save(this.toPersistence(customer));
        return this.toDomain(persisted);
    }
    toDomain(entity) {
        return customer_entity_1.Customer.reconstitute({
            id: entity.id,
            tenantId: entity.tenantId,
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
    toPersistence(customer) {
        const primitives = customer.toPrimitives();
        const entity = new typeorm_customer_entity_1.TypeOrmCustomerEntity();
        entity.id = primitives.id;
        entity.tenantId = primitives.tenantId;
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
exports.TypeOrmCustomerRepository = TypeOrmCustomerRepository;
