"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmUserEntitySchema = exports.TypeOrmUserEntity = void 0;
const typeorm_1 = require("typeorm");
class TypeOrmUserEntity {
}
exports.TypeOrmUserEntity = TypeOrmUserEntity;
exports.TypeOrmUserEntitySchema = new typeorm_1.EntitySchema({
    target: TypeOrmUserEntity,
    name: 'User',
    tableName: 'users',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
            name: 'id',
            default: () => 'gen_random_uuid()',
        },
        email: {
            type: 'varchar',
            length: 255,
            unique: true,
            name: 'email',
        },
        passwordHash: {
            type: 'varchar',
            length: 255,
            name: 'password_hash',
        },
        fullName: {
            type: 'varchar',
            length: 255,
            name: 'full_name',
        },
        role: {
            type: 'varchar',
            length: 20,
            default: 'CLIENT',
            name: 'role',
        },
        status: {
            type: 'varchar',
            length: 20,
            default: 'PENDING',
            name: 'status',
        },
        createdAt: {
            type: 'timestamptz',
            createDate: true,
            name: 'created_at',
            default: () => 'NOW()',
        },
        updatedAt: {
            type: 'timestamptz',
            updateDate: true,
            name: 'updated_at',
            default: () => 'NOW()',
        },
    },
});
