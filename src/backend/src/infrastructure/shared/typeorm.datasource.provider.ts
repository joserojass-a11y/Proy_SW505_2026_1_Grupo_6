import { Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { INFRASTRUCTURE_TOKENS } from './infrastructure.tokens';
import { TypeOrmUserEntitySchema } from '../persistence/typeorm/entities/typeorm-user.entity';
import { TypeOrmTenantEntitySchema } from '../persistence/typeorm/entities/typeorm-tenant.entity';
import { TypeOrmTenantBillingProfileEntitySchema } from '../persistence/typeorm/entities/typeorm-tenant-billing-profile.entity';
import { TypeOrmCustomerEntitySchema } from '../persistence/typeorm/entities/typeorm-customer.entity';

function buildDataSourceOptions(): DataSourceOptions {
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
      entities: [TypeOrmUserEntitySchema, TypeOrmTenantEntitySchema, TypeOrmTenantBillingProfileEntitySchema, TypeOrmCustomerEntitySchema],
      migrations: [__dirname + '/persistence/typeorm/migrations/*.{ts,js}'],
      migrationsRun: true,
      synchronize: false,
      logging: process.env.TYPEORM_LOGGING === 'true',
    };
  }

  if (!host || !username || typeof password !== 'string' || password.length === 0 || !database) {
    throw new Error(
      'Database connection is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in .env.',
    );
  }

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [TypeOrmUserEntitySchema, TypeOrmTenantEntitySchema, TypeOrmTenantBillingProfileEntitySchema, TypeOrmCustomerEntitySchema],
    migrations: [__dirname + '/persistence/typeorm/migrations/*.{ts,js}'],
    migrationsRun: true,
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING === 'true',
  };
}

let dataSourceInitializationPromise: Promise<DataSource> | null = null;

export const typeormDataSourceProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.DATA_SOURCE,
  useFactory: async (): Promise<DataSource> => {
    const dataSource = new DataSource(buildDataSourceOptions());
    if (dataSource.isInitialized) {
      return dataSource;
    }

    dataSourceInitializationPromise ??= dataSource.initialize();
    return dataSourceInitializationPromise;
  },
};
