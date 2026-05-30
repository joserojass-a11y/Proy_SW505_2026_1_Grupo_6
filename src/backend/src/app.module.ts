import { Module } from '@nestjs/common';
import { AuthModule } from './infrastructure/http/auth.module';
import { UsersModule } from './infrastructure/http/users.module';

@Module({
  imports: [AuthModule, UsersModule],
})
export class AppModule {}
