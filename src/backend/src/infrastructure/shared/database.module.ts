import { Global, Module } from '@nestjs/common';
import { typeormDataSourceProvider } from './typeorm.datasource.provider';

@Global()
@Module({
  providers: [typeormDataSourceProvider],
  exports: [typeormDataSourceProvider],
})
export class DatabaseModule {}
