import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INFRASTRUCTURE_TOKENS } from './infrastructure/shared/infrastructure.tokens';
import { TenantResolutionMiddleware } from './infrastructure/http/middlewares/tenant-resolution.middleware';

const backendEnvPath = resolve(process.cwd(), '.env');
const workspaceEnvPath = resolve(process.cwd(), '..', '..', '.env');

if (existsSync(backendEnvPath)) {
  loadEnv({ path: backendEnvPath });
} else if (existsSync(workspaceEnvPath)) {
  loadEnv({ path: workspaceEnvPath });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  
  const dataSource = app.get(INFRASTRUCTURE_TOKENS.DATA_SOURCE);
  const tenantResolutionMiddleware = new TenantResolutionMiddleware(dataSource);
  app.use(tenantResolutionMiddleware.use.bind(tenantResolutionMiddleware));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`API operando en el puerto ${port}`);
}

void bootstrap();
