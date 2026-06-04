"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const create_tenant_command_handler_1 = require("../../../application/commands/create-tenant.command-handler");
const get_tenant_query_handler_1 = require("../../../application/queries/get-tenant.query-handler");
const create_tenant_dto_1 = require("../../../application/dtos/create-tenant.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const decorators_1 = require("../decorators");
let CompaniesController = class CompaniesController {
    constructor(createTenantCommandHandler, getTenantQueryHandler) {
        this.createTenantCommandHandler = createTenantCommandHandler;
        this.getTenantQueryHandler = getTenantQueryHandler;
    }
    async create(userId, body) {
        return this.createTenantCommandHandler.execute({
            ownerUserId: userId,
            countryCode: body.countryCode,
            subdomain: body.subdomain,
            name: body.name,
            globalSettings: body.globalSettings,
        });
    }
    async getById(tenantId) {
        return this.getTenantQueryHandler.execute({
            tenantId,
        });
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorators_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "getById", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, common_1.Controller)('tenants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER'),
    __metadata("design:paramtypes", [create_tenant_command_handler_1.CreateTenantCommandHandler,
        get_tenant_query_handler_1.GetTenantQueryHandler])
], CompaniesController);
