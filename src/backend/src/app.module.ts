import { Module } from '@nestjs/common';
import { AuthModule } from './infrastructure/http/auth.module';
import { UsersModule } from './infrastructure/http/users.module';
import { HealthModule } from './infrastructure/http/health.module';

@Module({
  imports: [AuthModule, UsersModule, HealthModule],
})
export class AppModule {}
