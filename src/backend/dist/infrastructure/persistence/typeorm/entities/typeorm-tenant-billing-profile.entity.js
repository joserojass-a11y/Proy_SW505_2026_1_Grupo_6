"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmTenantBillingProfileEntitySchema = exports.TypeOrmTenantBillingProfileEntity = void 0;
const typeorm_1 = require("typeorm");
class TypeOrmTenantBillingProfileEntity {
}
exports.TypeOrmTenantBillingProfileEntity = TypeOrmTenantBillingProfileEntity;
exports.TypeOrmTenantBillingProfileEntitySchema = new typeorm_1.EntitySchema({
    target: TypeOrmTenantBillingProfileEntity,
    name: 'TenantBillingProfile',
    tableName: 'tenant_billing_profiles',
    columns: {
        tenantId: { type: 'uuid', primary: true, name: 'tenant_id' },
        planTier: { type: 'varchar', length: 20, name: 'plan_tier', default: 'BASIC' },
        maxBranches: { type: 'integer', name: 'max_branches', default: 1 },
        maxResources: { type: 'integer', name: 'max_resources', default: 10 },
    },
});
