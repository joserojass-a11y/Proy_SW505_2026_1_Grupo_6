import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { TypeOrmUserEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-user.entity';
import { TypeOrmTenantEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-tenant.entity';
import { TypeOrmTenantBillingProfileEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-tenant-billing-profile.entity';
import { TypeOrmCustomerEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-customer.entity';
import * as path from 'path';

let container: StartedPostgreSqlContainer | null = null;
let dataSource: DataSource | null = null;

export async function startTestDatabase(): Promise<DataSource> {
  if (dataSource) {
    return dataSource;
  }

  // Levantar contenedor de PostgreSQL usando la imagen del docker-compose.yml
  container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('reservas_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const connectionUri = container.getConnectionUri();

  // Configurar e inicializar DataSource de TypeORM apuntando al contenedor
  dataSource = new DataSource({
    type: 'postgres',
    url: connectionUri,
    entities: [
      TypeOrmUserEntitySchema,
      TypeOrmTenantEntitySchema,
      TypeOrmTenantBillingProfileEntitySchema,
      TypeOrmCustomerEntitySchema,
    ],
    migrations: [
      path.resolve(__dirname, '../../../src/infrastructure/persistence/typeorm/migrations/*.ts'),
    ],
    migrationsRun: true,
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  return dataSource;
}

export async function stopTestDatabase(): Promise<void> {
  if (dataSource) {
    await dataSource.destroy();
    dataSource = null;
  }
  if (container) {
    await container.stop();
    container = null;
  }
}

export async function clearDatabase(ds: DataSource): Promise<void> {
  // Limpiar las tablas entre ejecuciones de pruebas para mantener el aislamiento
  const entities = ds.entityMetadatas;
  const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');
  if (tableNames.length > 0) {
    await ds.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
  }
}
