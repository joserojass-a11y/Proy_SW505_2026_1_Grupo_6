import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetUserProfileQueryHandler } from '../../application/queries/get-user-profile.query-handler';
import { UpdateProfileCommandHandler } from '../../application/commands/update-profile.command-handler';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { typeormDataSourceProvider } from '../shared/typeorm.datasource.provider';
import { TypeOrmUserRepository } from '../persistence/typeorm/typeorm-user.repository';
import { ProfileController } from './controllers/profile.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Reflector } from '@nestjs/core';

const userRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.USER_REPOSITORY,
  useFactory: (dataSource: DataSource) => new TypeOrmUserRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

const updateProfileHandlerProvider: Provider = {
  provide: UpdateProfileCommandHandler,
  useFactory: (userRepository: TypeOrmUserRepository) => new UpdateProfileCommandHandler(userRepository),
  inject: [INFRASTRUCTURE_TOKENS.USER_REPOSITORY],
};

const getUserProfileHandlerProvider: Provider = {
  provide: GetUserProfileQueryHandler,
  useFactory: (userRepository: TypeOrmUserRepository) => new GetUserProfileQueryHandler(userRepository),
  inject: [INFRASTRUCTURE_TOKENS.USER_REPOSITORY],
};

@Module({
  controllers: [ProfileController],
  providers: [
    typeormDataSourceProvider,
    userRepositoryProvider,
    updateProfileHandlerProvider,
    getUserProfileHandlerProvider,
    JwtAuthGuard,
    RolesGuard,
    Reflector,
  ],
  exports: [
    INFRASTRUCTURE_TOKENS.DATA_SOURCE,
    INFRASTRUCTURE_TOKENS.USER_REPOSITORY,
    UpdateProfileCommandHandler,
    GetUserProfileQueryHandler,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class UsersModule {}
