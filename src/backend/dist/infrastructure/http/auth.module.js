"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const login_command_handler_1 = require("../../application/commands/login.command-handler");
const register_user_command_handler_1 = require("../../application/commands/register-user.command-handler");
const register_owner_command_handler_1 = require("../../application/commands/register-owner.command-handler");
const infrastructure_tokens_1 = require("../shared/infrastructure.tokens");
const users_module_1 = require("./users.module");
const bcrypt_password_hasher_service_1 = require("./services/bcrypt-password-hasher.service");
const rs256_jwt_token_generator_service_1 = require("./services/rs256-jwt-token-generator.service");
const auth_controller_1 = require("./controllers/auth.controller");
const passwordHasherProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.PASSWORD_HASHER,
    useClass: bcrypt_password_hasher_service_1.BcryptPasswordHasherService,
};
const jwtTokenGeneratorProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.JWT_TOKEN_GENERATOR,
    useClass: rs256_jwt_token_generator_service_1.Rs256JwtTokenGeneratorService,
};
const registerUserHandlerProvider = {
    provide: register_user_command_handler_1.RegisterUserCommandHandler,
    useFactory: (userRepository, passwordHasher) => new register_user_command_handler_1.RegisterUserCommandHandler(userRepository, passwordHasher),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY, infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.PASSWORD_HASHER],
};
const registerOwnerHandlerProvider = {
    provide: register_owner_command_handler_1.RegisterOwnerCommandHandler,
    useFactory: (userRepository, passwordHasher) => new register_owner_command_handler_1.RegisterOwnerCommandHandler(userRepository, passwordHasher),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY, infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.PASSWORD_HASHER],
};
const loginHandlerProvider = {
    provide: login_command_handler_1.LoginCommandHandler,
    useFactory: (userRepository, passwordHasher, jwtTokenGenerator) => new login_command_handler_1.LoginCommandHandler(userRepository, passwordHasher, jwtTokenGenerator),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY, infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.PASSWORD_HASHER, infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.JWT_TOKEN_GENERATOR],
};
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [auth_controller_1.AuthController],
        providers: [
            passwordHasherProvider,
            jwtTokenGeneratorProvider,
            registerUserHandlerProvider,
            registerOwnerHandlerProvider,
            loginHandlerProvider,
        ],
        exports: [
            infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.PASSWORD_HASHER,
            infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.JWT_TOKEN_GENERATOR,
            register_user_command_handler_1.RegisterUserCommandHandler,
            register_owner_command_handler_1.RegisterOwnerCommandHandler,
            login_command_handler_1.LoginCommandHandler,
        ],
    })
], AuthModule);
