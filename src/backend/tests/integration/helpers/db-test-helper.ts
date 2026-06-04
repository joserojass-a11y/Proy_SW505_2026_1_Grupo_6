import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { existsSync } from 'fs';
import { TypeOrmUserEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-user.entity';
import { TypeOrmTenantEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-tenant.entity';
import { TypeOrmTenantBillingProfileEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-tenant-billing-profile.entity';
import { TypeOrmCustomerEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-customer.entity';
import { TypeOrmBookingEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-booking.entity';
import { TypeOrmBookingStatusHistoryEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-booking-status-history.entity';
import { TypeOrmBookingRescheduleEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-booking-reschedule.entity';
import { TypeOrmBookingCancellationEntitySchema } from '../../../src/infrastructure/persistence/typeorm/entities/typeorm-booking-cancellation.entity';
import * as path from 'path';

let container: StartedPostgreSqlContainer | null = null;
let dataSource: DataSource | null = null;

export async function startTestDatabase(): Promise<DataSource> {
  if (dataSource) {
    return dataSource;
  }

  const isDocker = existsSync('/.dockerenv') || process.env.IS_DOCKER === 'true';
  let connectionUri: string;

  if (isDocker) {
    // En Docker, usamos el contenedor de PostgreSQL existente (de docker-compose)
    // para evitar levantar otro contenedor (lo cual fallaría sin socket de Docker).
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:JoSeSiTo%25_10@postgres:5432/reservas_db';
    
    // Nos aseguramos de usar una base de datos de pruebas (reservas_test) para no alterar datos de desarrollo.
    const urlObj = new URL(databaseUrl);
    const dbName = 'reservas_test';
    
    // Conectamos temporalmente a la BD por defecto para crear reservas_test si no existe
    urlObj.pathname = '/postgres';
    const client = new Client({ connectionString: urlObj.toString() });
    try {
      await client.connect();
      await client.query(`CREATE DATABASE ${dbName};`);
    } catch (err: any) {
      // Ignorar si ya existe (código 42P04 en Postgres)
      if (err.code !== '42P04') {
        console.warn('Advertencia al crear base de datos de pruebas:', err.message);
      }
    } finally {
      await client.end();
    }

    urlObj.pathname = `/${dbName}`;
    connectionUri = urlObj.toString();
  } else {
    // Localmente, intentamos levantar un contenedor de PostgreSQL dinámico con Testcontainers
    try {
      container = await new PostgreSqlContainer('postgres:15-alpine')
        .withDatabase('reservas_test')
        .withUsername('test')
        .withPassword('test')
        .start();

      connectionUri = container.getConnectionUri();
    } catch (err) {
      console.warn('No se pudo iniciar Testcontainers. Intentando conectar al PostgreSQL local...');
      // Fallback: Si Testcontainers falla (por ejemplo, Docker Desktop no está iniciado),
      // intentamos conectar al postgres local leyendo la configuración de .env
      const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:JoSeSiTo%25_10@postgres:5432/reservas_db';
      const urlObj = new URL(databaseUrl);
      
      // Reemplazamos el host "postgres" por "localhost" para conexión local fuera de docker
      if (urlObj.hostname === 'postgres') {
        urlObj.hostname = 'localhost';
      }
      
      const dbName = 'reservas_test';
      urlObj.pathname = '/postgres';
      
      const client = new Client({ connectionString: urlObj.toString() });
      try {
        await client.connect();
        await client.query(`CREATE DATABASE ${dbName};`);
      } catch (dbErr: any) {
        if (dbErr.code !== '42P04') {
          console.warn('Advertencia al crear base de datos de pruebas local:', dbErr.message);
        }
      } finally {
        await client.end();
      }

      urlObj.pathname = `/${dbName}`;
      connectionUri = urlObj.toString();
    }
  }

  // Configurar e inicializar DataSource de TypeORM apuntando al contenedor
  dataSource = new DataSource({
    type: 'postgres',
    url: connectionUri,
    entities: [
      TypeOrmUserEntitySchema,
      TypeOrmTenantEntitySchema,
      TypeOrmTenantBillingProfileEntitySchema,
      TypeOrmCustomerEntitySchema,
      TypeOrmBookingEntitySchema,
      TypeOrmBookingStatusHistoryEntitySchema,
      TypeOrmBookingRescheduleEntitySchema,
      TypeOrmBookingCancellationEntitySchema,
    ],
    migrations: [
      path.resolve(__dirname, '../../../src/infrastructure/persistence/typeorm/migrations/*.ts'),
    ],
    migrationsRun: false,
    synchronize: true,
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
