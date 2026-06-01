import { Module, Provider } from '@nestjs/common';
import { LoginCommandHandler } from '../../application/commands/login.command-handler';
import { RegisterUserCommandHandler } from '../../application/commands/register-user.command-handler';
import { RegisterOwnerCommandHandler } from '../../application/commands/register-owner.command-handler';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { UsersModule } from './users.module';
import { BcryptPasswordHasherService } from './services/bcrypt-password-hasher.service';
import { Rs256JwtTokenGeneratorService } from './services/rs256-jwt-token-generator.service';
import { TypeOrmUserRepository } from '../persistence/typeorm/typeorm-user.repository';
import { AuthController } from './controllers/auth.controller';

const passwordHasherProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.PASSWORD_HASHER,
  useClass: BcryptPasswordHasherService,
};

const jwtTokenGeneratorProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.JWT_TOKEN_GENERATOR,
  useClass: Rs256JwtTokenGeneratorService,
};

const registerUserHandlerProvider: Provider = {
  provide: RegisterUserCommandHandler,
  useFactory: (userRepository: TypeOrmUserRepository, passwordHasher: BcryptPasswordHasherService) =>
    new RegisterUserCommandHandler(userRepository, passwordHasher),
  inject: [INFRASTRUCTURE_TOKENS.USER_REPOSITORY, INFRASTRUCTURE_TOKENS.PASSWORD_HASHER],
};

const registerOwnerHandlerProvider: Provider = {
  provide: RegisterOwnerCommandHandler,
  useFactory: (userRepository: TypeOrmUserRepository, passwordHasher: BcryptPasswordHasherService) =>
    new RegisterOwnerCommandHandler(userRepository, passwordHasher),
  inject: [INFRASTRUCTURE_TOKENS.USER_REPOSITORY, INFRASTRUCTURE_TOKENS.PASSWORD_HASHER],
};

const loginHandlerProvider: Provider = {
  provide: LoginCommandHandler,
  useFactory: (
    userRepository: TypeOrmUserRepository,
    passwordHasher: BcryptPasswordHasherService,
    jwtTokenGenerator: Rs256JwtTokenGeneratorService,
  ) => new LoginCommandHandler(userRepository, passwordHasher, jwtTokenGenerator),
  inject: [INFRASTRUCTURE_TOKENS.USER_REPOSITORY, INFRASTRUCTURE_TOKENS.PASSWORD_HASHER, INFRASTRUCTURE_TOKENS.JWT_TOKEN_GENERATOR],
};

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    passwordHasherProvider,
    jwtTokenGeneratorProvider,
    registerUserHandlerProvider,
    registerOwnerHandlerProvider,
    loginHandlerProvider,
  ],
  exports: [
    INFRASTRUCTURE_TOKENS.PASSWORD_HASHER,
    INFRASTRUCTURE_TOKENS.JWT_TOKEN_GENERATOR,
    RegisterUserCommandHandler,
    RegisterOwnerCommandHandler,
    LoginCommandHandler,
  ],
})
export class AuthModule {}
