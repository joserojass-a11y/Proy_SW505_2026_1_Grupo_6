"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const typeorm_1 = require("typeorm");
const typeorm_tenant_entity_1 = require("../persistence/typeorm/entities/typeorm-tenant.entity");
const typeorm_tenant_billing_profile_entity_1 = require("../persistence/typeorm/entities/typeorm-tenant-billing-profile.entity");
const typeorm_customer_entity_1 = require("../persistence/typeorm/entities/typeorm-customer.entity");
const typeorm_user_entity_1 = require("../persistence/typeorm/entities/typeorm-user.entity");
const backendEnvPath = (0, path_1.resolve)(process.cwd(), '.env');
const workspaceEnvPath = (0, path_1.resolve)(process.cwd(), '..', '..', '.env');
if ((0, fs_1.existsSync)(backendEnvPath)) {
    (0, dotenv_1.config)({ path: backendEnvPath });
}
else if ((0, fs_1.existsSync)(workspaceEnvPath)) {
    (0, dotenv_1.config)({ path: workspaceEnvPath });
}
const databaseUrl = process.env.DATABASE_URL;
const host = process.env.DB_HOST;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const port = Number(process.env.DB_PORT ?? 5432);
if (!databaseUrl && (!host || !username || typeof password !== 'string' || password.length === 0 || !database)) {
    throw new Error('Database connection is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in .env.');
}
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    ...(databaseUrl ? { url: databaseUrl } : { host, port, username, password, database }),
    entities: [typeorm_user_entity_1.TypeOrmUserEntitySchema, typeorm_tenant_entity_1.TypeOrmTenantEntitySchema, typeorm_tenant_billing_profile_entity_1.TypeOrmTenantBillingProfileEntitySchema, typeorm_customer_entity_1.TypeOrmCustomerEntitySchema],
    migrations: [(0, path_1.resolve)(__dirname, '../persistence/typeorm/migrations/*.{ts,js}')],
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING === 'true',
});
