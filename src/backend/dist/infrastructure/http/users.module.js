"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const get_user_profile_query_handler_1 = require("../../application/queries/get-user-profile.query-handler");
const update_profile_command_handler_1 = require("../../application/commands/update-profile.command-handler");
const infrastructure_tokens_1 = require("../shared/infrastructure.tokens");
const typeorm_user_repository_1 = require("../persistence/typeorm/typeorm-user.repository");
const profile_controller_1 = require("./controllers/profile.controller");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const core_1 = require("@nestjs/core");
const database_module_1 = require("../shared/database.module");
const userRepositoryProvider = {
    provide: infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY,
    useFactory: (dataSource) => new typeorm_user_repository_1.TypeOrmUserRepository(dataSource),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};
const updateProfileHandlerProvider = {
    provide: update_profile_command_handler_1.UpdateProfileCommandHandler,
    useFactory: (userRepository) => new update_profile_command_handler_1.UpdateProfileCommandHandler(userRepository),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY],
};
const getUserProfileHandlerProvider = {
    provide: get_user_profile_query_handler_1.GetUserProfileQueryHandler,
    useFactory: (userRepository) => new get_user_profile_query_handler_1.GetUserProfileQueryHandler(userRepository),
    inject: [infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY],
};
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [profile_controller_1.ProfileController],
        providers: [
            userRepositoryProvider,
            updateProfileHandlerProvider,
            getUserProfileHandlerProvider,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            core_1.Reflector,
        ],
        exports: [
            infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.USER_REPOSITORY,
            update_profile_command_handler_1.UpdateProfileCommandHandler,
            get_user_profile_query_handler_1.GetUserProfileQueryHandler,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
        ],
    })
], UsersModule);
