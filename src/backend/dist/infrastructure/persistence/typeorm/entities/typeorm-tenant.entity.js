"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmTenantEntitySchema = exports.TypeOrmTenantEntity = void 0;
const typeorm_1 = require("typeorm");
class TypeOrmTenantEntity {
}
exports.TypeOrmTenantEntity = TypeOrmTenantEntity;
exports.TypeOrmTenantEntitySchema = new typeorm_1.EntitySchema({
    target: TypeOrmTenantEntity,
    name: 'Tenant',
    tableName: 'tenants',
    columns: {
        id: { type: 'uuid', primary: true, generated: 'uuid', name: 'id', default: () => 'gen_random_uuid()' },
        countryCode: { type: 'varchar', length: 2, name: 'country_code' },
        status: { type: 'varchar', length: 20, name: 'status', default: 'ACTIVE' },
        subdomain: { type: 'varchar', length: 100, unique: true, name: 'subdomain' },
        name: { type: 'varchar', length: 255, name: 'name' },
        globalSettings: { type: 'jsonb', name: 'global_settings', default: () => "'{}'::jsonb" },
        ownerUserId: { type: 'uuid', unique: true, name: 'owner_user_id' },
        createdAt: { type: 'timestamptz', createDate: true, name: 'created_at', default: () => 'NOW()' },
        updatedAt: { type: 'timestamptz', updateDate: true, name: 'updated_at', default: () => 'NOW()' },
    },
});
