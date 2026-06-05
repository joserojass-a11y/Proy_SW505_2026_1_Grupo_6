import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { UsersModule } from './users.module';
import { CompaniesModule } from './companies.module';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { TypeOrmCustomerRepository } from '../persistence/typeorm/typeorm-customer.repository';
import { CreateCustomerCommandHandler } from '../../application/commands/create-customer.command-handler';
import { UpdateCustomerCommandHandler } from '../../application/commands/update-customer.command-handler';
import { GetCustomerProfileQueryHandler } from '../../application/queries/get-customer-profile.query-handler';
import { CustomersController } from './controllers/customers.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { DatabaseModule } from '../shared/database.module';

const customerRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY,
  useFactory: (dataSource: DataSource) => new TypeOrmCustomerRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

const createCustomerHandlerProvider: Provider = {
  provide: CreateCustomerCommandHandler,
  useFactory: (customerRepository: TypeOrmCustomerRepository, tenantRepository: any) =>
    new CreateCustomerCommandHandler(customerRepository, tenantRepository),
  inject: [INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY, INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY],
};

const updateCustomerHandlerProvider: Provider = {
  provide: UpdateCustomerCommandHandler,
  useFactory: (customerRepository: TypeOrmCustomerRepository) => new UpdateCustomerCommandHandler(customerRepository),
  inject: [INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY],
};

const getCustomerProfileHandlerProvider: Provider = {
  provide: GetCustomerProfileQueryHandler,
  useFactory: (customerRepository: TypeOrmCustomerRepository) => new GetCustomerProfileQueryHandler(customerRepository),
  inject: [INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY],
};

@Module({
  imports: [DatabaseModule, UsersModule, CompaniesModule],
  controllers: [CustomersController],
  providers: [
    customerRepositoryProvider,
    createCustomerHandlerProvider,
    updateCustomerHandlerProvider,
    getCustomerProfileHandlerProvider,
    JwtAuthGuard,
    RolesGuard,
    Reflector,
  ],
  exports: [
    INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY,
    INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY,
    CreateCustomerCommandHandler,
    UpdateCustomerCommandHandler,
    GetCustomerProfileQueryHandler,
  ],
})
export class CustomersModule {}
