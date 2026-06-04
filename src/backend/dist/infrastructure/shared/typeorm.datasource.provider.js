"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormDataSourceProvider = void 0;
const typeorm_1 = require("typeorm");
const infrastructure_tokens_1 = require("./infrastructure.tokens");
const typeorm_user_entity_1 = require("../persistence/typeorm/entities/typeorm-user.entity");
const typeorm_tenant_entity_1 = require("../persistence/typeorm/entities/typeorm-tenant.entity");
const typeorm_tenant_billing_profile_entity_1 = require("../persistence/typeorm/entities/typeorm-tenant-billing-profile.entity");
const typeorm_customer_entity_1 = require("../persistence/typeorm/entities/typeorm-customer.entity");
function buildDataSourceOptions() {
    const databaseUrl = process.env.DATABASE_URL;
    const host = process.env.DB_HOST;
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;
    const port = Number(process.env.DB_PORT ?? 5432);
    if (databaseUrl) {
        return {
            type: 'postgres',
            url: databaseUrl,
            entities: [typeorm_user_entity_1.TypeOrmUserEntitySchema, typeorm_tenant_entity_1.TypeOrmTenantEntitySchema, typeorm_tenant_billing_profile_entity_1.TypeOrmTenantBillingProfileEntitySchema, typeorm_customer_entity_1.TypeOrmCustomerEntitySchema],
            migrations: [__dirname + '/persistence/typeorm/migrations/*.{ts,js}'],
            migrationsRun: true,
            synchronize: false,
            logging: process.env.TYPEORM_LOGGING === 'true',
        };
    }
    if (!host || !username || typeof password !== 'string' || password.length === 0 || !database) {
        throw new Error('Database connection is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in .env.');
    }
    return {
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        entities: [typeorm_user_entity_1.TypeOrmUserEntitySchema, typeorm_tenant_entity_1.TypeOrmTenantEntitySchema, typeorm_tenant_billing_profile_entity_1.TypeOrmTenantBillingProfileEntitySchema, typeorm_customer_entity_1.TypeOrmCustomerEntitySchema],
        migrations: [__dirname + '/persistence/typeorm/migrations/*.{ts,js}'],
        migrationsRun: true,
        synchronize: false,
        logging: process.env.TYPEORM_LOGGING === 'true',
    };
}
let dataSourceInitializationPromise = null;
exports.typeormDataSourceProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.DATA_SOURCE,
    useFactory: async () => {
        const dataSource = new typeorm_1.DataSource(buildDataSourceOptions());
        if (dataSource.isInitialized) {
            return dataSource;
        }
        dataSourceInitializationPromise ??= dataSource.initialize();
        return dataSourceInitializationPromise;
    },
};
