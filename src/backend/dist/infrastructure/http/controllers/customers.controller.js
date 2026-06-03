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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const create_customer_command_handler_1 = require("../../../application/commands/create-customer.command-handler");
const update_customer_command_handler_1 = require("../../../application/commands/update-customer.command-handler");
const get_customer_profile_query_handler_1 = require("../../../application/queries/get-customer-profile.query-handler");
const create_customer_dto_1 = require("../../../application/dtos/create-customer.dto");
const update_customer_dto_1 = require("../../../application/dtos/update-customer.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const decorators_1 = require("../decorators");
let CustomersController = class CustomersController {
    constructor(createCustomerCommandHandler, updateCustomerCommandHandler, getCustomerProfileQueryHandler) {
        this.createCustomerCommandHandler = createCustomerCommandHandler;
        this.updateCustomerCommandHandler = updateCustomerCommandHandler;
        this.getCustomerProfileQueryHandler = getCustomerProfileQueryHandler;
    }
    async create(userId, body) {
        return this.createCustomerCommandHandler.execute({
            userId,
            tenantId: body.tenantId,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            timezone: body.timezone,
            preferences: body.preferences,
            consentSigned: body.consentSigned,
        });
    }
    async getMe(userId) {
        return this.getCustomerProfileQueryHandler.execute({
            userId,
        });
    }
    async updateMe(userId, body) {
        return this.updateCustomerCommandHandler.execute({
            userId,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            timezone: body.timezone,
            preferences: body.preferences,
            consentSigned: body.consentSigned,
        });
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorators_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, decorators_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Put)('me'),
    __param(0, (0, decorators_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "updateMe", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('CLIENT', 'ADMIN', 'OWNER'),
    __metadata("design:paramtypes", [create_customer_command_handler_1.CreateCustomerCommandHandler,
        update_customer_command_handler_1.UpdateCustomerCommandHandler,
        get_customer_profile_query_handler_1.GetCustomerProfileQueryHandler])
], CustomersController);
