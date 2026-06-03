"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const users_module_1 = require("./users.module");
const infrastructure_tokens_1 = require("../shared/infrastructure.tokens");
const typeorm_tenant_repository_1 = require("../persistence/typeorm/typeorm-tenant.repository");
const typeorm_tenant_billing_profile_repository_1 = require("../persistence/typeorm/typeorm-tenant-billing-profile.repository");
const create_tenant_command_handler_1 = require("../../application/commands/create-tenant.command-handler");
const get_tenant_query_handler_1 = require("../../application/queries/get-tenant.query-handler");
const companies_controller_1 = require("./controllers/companies.controller");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const database_module_1 = require("../shared/database.module");
const companyRepositoryProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY,
    useFactory: (dataSource) => new typeorm_tenant_repository_1.TypeOrmTenantRepository(dataSource),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};
const tenantBillingProfileRepositoryProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_BILLING_PROFILE_REPOSITORY,
    useFactory: (dataSource) => new typeorm_tenant_billing_profile_repository_1.TypeOrmTenantBillingProfileRepository(dataSource),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};
const createTenantHandlerProvider = {
    provide: create_tenant_command_handler_1.CreateTenantCommandHandler,
    useFactory: (tenantRepository, userRepository, tenantBillingProfileRepository) => new create_tenant_command_handler_1.CreateTenantCommandHandler(tenantRepository, userRepository, tenantBillingProfileRepository),
    inject: [
        infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY,
        infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY,
        infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_BILLING_PROFILE_REPOSITORY,
    ],
};
const getTenantHandlerProvider = {
    provide: get_tenant_query_handler_1.GetTenantQueryHandler,
    useFactory: (tenantRepository) => new get_tenant_query_handler_1.GetTenantQueryHandler(tenantRepository),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY],
};
let CompaniesModule = class CompaniesModule {
};
exports.CompaniesModule = CompaniesModule;
exports.CompaniesModule = CompaniesModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, users_module_1.UsersModule],
        controllers: [companies_controller_1.CompaniesController],
        providers: [
            companyRepositoryProvider,
            tenantBillingProfileRepositoryProvider,
            createTenantHandlerProvider,
            getTenantHandlerProvider,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            core_1.Reflector,
        ],
        exports: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.TENANT_REPOSITORY, create_tenant_command_handler_1.CreateTenantCommandHandler, get_tenant_query_handler_1.GetTenantQueryHandler],
    })
], CompaniesModule);
