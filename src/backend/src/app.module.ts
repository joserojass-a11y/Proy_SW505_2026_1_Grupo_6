import { Module } from '@nestjs/common';
import { AuthModule } from './infrastructure/http/auth.module';
import { CompaniesModule } from './infrastructure/http/companies.module';
import { CustomersModule } from './infrastructure/http/customers.module';
import { UsersModule } from './infrastructure/http/users.module';
import { HealthModule } from './infrastructure/http/health.module';
import { DatabaseModule } from './infrastructure/shared/database.module';
import { AvailabilityModule } from './infrastructure/http/availability.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CustomersModule,
    HealthModule,
    AvailabilityModule,
  ],
})
export class AppModule {}
