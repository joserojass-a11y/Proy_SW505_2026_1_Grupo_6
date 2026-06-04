"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmUserRepository = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../domain/entities/user.entity");
const typeorm_user_entity_1 = require("./entities/typeorm-user.entity");
class TypeOrmUserRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get repository() {
        return this.dataSource.getRepository(typeorm_user_entity_1.TypeOrmUserEntity);
    }
    async findById(id) {
        const entity = await this.repository.findOne({ where: { id: id.value } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByEmail(email) {
        const entity = await this.repository.findOne({ where: { email: email.value } });
        return entity ? this.toDomain(entity) : null;
    }
    async existsByEmail(email, excludeUserId) {
        const count = await this.repository.count({
            where: excludeUserId
                ? { email: email.value, id: (0, typeorm_1.Not)(excludeUserId.value) }
                : { email: email.value },
        });
        return count > 0;
    }
    async save(user) {
        const persisted = await this.repository.save(this.toPersistence(user));
        return this.toDomain(persisted);
    }
    async update(user) {
        const persisted = await this.repository.save(this.toPersistence(user));
        return this.toDomain(persisted);
    }
    async updateStatus(id, status) {
        await this.repository.update({ id: id.value }, {
            status: status.value,
            updatedAt: new Date(),
        });
    }
    async deleteById(id) {
        await this.repository.delete({ id: id.value });
    }
    toDomain(entity) {
        return user_entity_1.User.reconstitute({
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
    toPersistence(user) {
        const primitives = user.toPrimitives();
        const entity = new typeorm_user_entity_1.TypeOrmUserEntity();
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
exports.TypeOrmUserRepository = TypeOrmUserRepository;
