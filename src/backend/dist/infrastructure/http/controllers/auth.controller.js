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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const login_command_handler_1 = require("../../../application/commands/login.command-handler");
const register_user_command_handler_1 = require("../../../application/commands/register-user.command-handler");
const register_owner_command_handler_1 = require("../../../application/commands/register-owner.command-handler");
const login_dto_1 = require("../../../application/dtos/login.dto");
const register_user_dto_1 = require("../../../application/dtos/register-user.dto");
let AuthController = class AuthController {
    constructor(registerUserCommandHandler, registerOwnerCommandHandler, loginCommandHandler) {
        this.registerUserCommandHandler = registerUserCommandHandler;
        this.registerOwnerCommandHandler = registerOwnerCommandHandler;
        this.loginCommandHandler = loginCommandHandler;
    }
    async register(body) {
        return this.registerUserCommandHandler.execute({
            email: body.email,
            password: body.password,
            fullName: body.fullName,
        });
    }
    async registerOwner(body) {
        return this.registerOwnerCommandHandler.execute({
            email: body.email,
            password: body.password,
            fullName: body.fullName,
        });
    }
    async login(body) {
        return this.loginCommandHandler.execute({
            email: body.email,
            password: body.password,
        });
    }
    async logout() {
        return undefined;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_user_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('register-owner'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_user_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerOwner", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(204),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [register_user_command_handler_1.RegisterUserCommandHandler,
        register_owner_command_handler_1.RegisterOwnerCommandHandler,
        login_command_handler_1.LoginCommandHandler])
], AuthController);
