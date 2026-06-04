"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const users_module_1 = require("./users.module");
const companies_module_1 = require("./companies.module");
const infrastructure_tokens_1 = require("../shared/infrastructure.tokens");
const typeorm_customer_repository_1 = require("../persistence/typeorm/typeorm-customer.repository");
const typeorm_tenant_repository_1 = require("../persistence/typeorm/typeorm-tenant.repository");
const create_customer_command_handler_1 = require("../../application/commands/create-customer.command-handler");
const update_customer_command_handler_1 = require("../../application/commands/update-customer.command-handler");
const get_customer_profile_query_handler_1 = require("../../application/queries/get-customer-profile.query-handler");
const customers_controller_1 = require("./controllers/customers.controller");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const database_module_1 = require("../shared/database.module");
const customerRepositoryProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY,
    useFactory: (dataSource) => new typeorm_customer_repository_1.TypeOrmCustomerRepository(dataSource),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};
const tenantRepositoryProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY,
    useFactory: (dataSource) => new typeorm_tenant_repository_1.TypeOrmTenantRepository(dataSource),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};
const createCustomerHandlerProvider = {
    provide: create_customer_command_handler_1.CreateCustomerCommandHandler,
    useFactory: (customerRepository, tenantRepository) => new create_customer_command_handler_1.CreateCustomerCommandHandler(customerRepository, tenantRepository),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY, infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY],
};
const updateCustomerHandlerProvider = {
    provide: update_customer_command_handler_1.UpdateCustomerCommandHandler,
    useFactory: (customerRepository) => new update_customer_command_handler_1.UpdateCustomerCommandHandler(customerRepository),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY],
};
const getCustomerProfileHandlerProvider = {
    provide: get_customer_profile_query_handler_1.GetCustomerProfileQueryHandler,
    useFactory: (customerRepository) => new get_customer_profile_query_handler_1.GetCustomerProfileQueryHandler(customerRepository),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY],
};
let CustomersModule = class CustomersModule {
};
exports.CustomersModule = CustomersModule;
exports.CustomersModule = CustomersModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, users_module_1.UsersModule, companies_module_1.CompaniesModule],
        controllers: [customers_controller_1.CustomersController],
        providers: [
            customerRepositoryProvider,
            tenantRepositoryProvider,
            createCustomerHandlerProvider,
            updateCustomerHandlerProvider,
            getCustomerProfileHandlerProvider,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            core_1.Reflector,
        ],
        exports: [
            infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.CUSTOMER_REPOSITORY,
            infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY,
            create_customer_command_handler_1.CreateCustomerCommandHandler,
            update_customer_command_handler_1.UpdateCustomerCommandHandler,
            get_customer_profile_query_handler_1.GetCustomerProfileQueryHandler,
        ],
    })
], CustomersModule);
