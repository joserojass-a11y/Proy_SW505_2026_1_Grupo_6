import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { UsersModule } from './users.module';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { TypeOrmTenantRepository } from '../persistence/typeorm/typeorm-tenant.repository';
import { TypeOrmTenantBillingProfileRepository } from '../persistence/typeorm/typeorm-tenant-billing-profile.repository';
import { CreateTenantCommandHandler } from '../../application/commands/create-tenant.command-handler';
import { GetTenantQueryHandler } from '../../application/queries/get-tenant.query-handler';
import { CompaniesController } from './controllers/companies.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { DatabaseModule } from '../shared/database.module';

const companyRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY,
  useFactory: (dataSource: DataSource) => new TypeOrmTenantRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

const tenantBillingProfileRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.TENANT_BILLING_PROFILE_REPOSITORY,
  useFactory: (dataSource: DataSource) => new TypeOrmTenantBillingProfileRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

const createTenantHandlerProvider: Provider = {
  provide: CreateTenantCommandHandler,
  useFactory: (
    tenantRepository: TypeOrmTenantRepository,
    userRepository: unknown,
    tenantBillingProfileRepository: TypeOrmTenantBillingProfileRepository,
  ) => new CreateTenantCommandHandler(tenantRepository, userRepository as never, tenantBillingProfileRepository),
  inject: [
    INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY,
    INFRASTRUCTURE_TOKENS.USER_REPOSITORY,
    INFRASTRUCTURE_TOKENS.TENANT_BILLING_PROFILE_REPOSITORY,
  ],
};

const getTenantHandlerProvider: Provider = {
  provide: GetTenantQueryHandler,
  useFactory: (tenantRepository: TypeOrmTenantRepository) => new GetTenantQueryHandler(tenantRepository),
  inject: [INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY],
};

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [CompaniesController],
  providers: [
    companyRepositoryProvider,
    tenantBillingProfileRepositoryProvider,
    createTenantHandlerProvider,
    getTenantHandlerProvider,
    JwtAuthGuard,
    RolesGuard,
    Reflector,
  ],
  exports: [INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY, CreateTenantCommandHandler, GetTenantQueryHandler],
})
export class CompaniesModule {}
