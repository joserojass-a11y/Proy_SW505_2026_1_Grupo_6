import { Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { existsSync } from 'fs';
import { INFRASTRUCTURE_TOKENS } from './infrastructure.tokens';
import { TypeOrmUserEntitySchema } from '../persistence/typeorm/entities/typeorm-user.entity';
import { TypeOrmTenantEntitySchema } from '../persistence/typeorm/entities/typeorm-tenant.entity';
import { TypeOrmTenantBillingProfileEntitySchema } from '../persistence/typeorm/entities/typeorm-tenant-billing-profile.entity';
import { TypeOrmCustomerEntitySchema } from '../persistence/typeorm/entities/typeorm-customer.entity';
import { TypeOrmBookingEntitySchema } from '../persistence/typeorm/entities/typeorm-booking.entity';
import { TypeOrmBookingStatusHistoryEntitySchema } from '../persistence/typeorm/entities/typeorm-booking-status-history.entity';
import { TypeOrmBookingCancellationEntitySchema } from '../persistence/typeorm/entities/typeorm-booking-cancellation.entity';
import { TypeOrmBookingRescheduleEntitySchema } from '../persistence/typeorm/entities/typeorm-booking-reschedule.entity';

function buildDataSourceOptions(): DataSourceOptions {
  const isDocker = existsSync('/.dockerenv') || process.env.IS_DOCKER === 'true';
  const isLocal = !isDocker || process.platform === 'win32';

  let databaseUrl = process.env.DATABASE_URL;
  if (isLocal && databaseUrl) {
    try {
      const parsedUrl = new URL(databaseUrl);
      if (parsedUrl.hostname === 'postgres') {
        parsedUrl.hostname = 'localhost';
        databaseUrl = parsedUrl.toString();
      }
    } catch (err) {
      if (databaseUrl.includes('@postgres:')) {
        databaseUrl = databaseUrl.replace('@postgres:', '@localhost:');
      }
    }
  }

  let host = process.env.DB_HOST;
  if (isLocal && host === 'postgres') {
    host = 'localhost';
  }

  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT ?? 5432);

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [
        TypeOrmUserEntitySchema,
        TypeOrmTenantEntitySchema,
        TypeOrmTenantBillingProfileEntitySchema,
        TypeOrmCustomerEntitySchema,
        TypeOrmBookingEntitySchema,
        TypeOrmBookingStatusHistoryEntitySchema,
        TypeOrmBookingCancellationEntitySchema,
        TypeOrmBookingRescheduleEntitySchema
      ],
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
    entities: [
      TypeOrmUserEntitySchema,
      TypeOrmTenantEntitySchema,
      TypeOrmTenantBillingProfileEntitySchema,
      TypeOrmCustomerEntitySchema,
      TypeOrmBookingEntitySchema,
      TypeOrmBookingStatusHistoryEntitySchema,
      TypeOrmBookingCancellationEntitySchema,
      TypeOrmBookingRescheduleEntitySchema
    ],
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
