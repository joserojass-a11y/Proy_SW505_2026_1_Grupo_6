import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';
import { TypeOrmAgendaSnapshotRepository } from '../persistence/typeorm/typeorm-agenda-snapshot.repository';
import { TypeOrmResourceRepository } from '../persistence/typeorm/typeorm-resource.repository';
import { GetAvailableSlotsQueryHandler } from '../../application/queries/get-available-slots.query-handler';
import { AvailabilityController } from './controllers/availability.controller';
import { DatabaseModule } from '../shared/database.module';

const agendaSnapshotRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.AGENDA_SNAPSHOT_REPOSITORY,
  useFactory: (dataSource: DataSource) => new TypeOrmAgendaSnapshotRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

const resourceRepositoryProvider: Provider = {
  provide: INFRASTRUCTURE_TOKENS.RESOURCE_REPOSITORY,
  useFactory: (dataSource: DataSource) => new TypeOrmResourceRepository(dataSource),
  inject: [INFRASTRUCTURE_TOKENS.DATA_SOURCE],
};

const getAvailableSlotsQueryHandlerProvider: Provider = {
  provide: GetAvailableSlotsQueryHandler,
  useFactory: (
    agendaSnapshotRepository: any,
    resourceRepository: any
  ) => new GetAvailableSlotsQueryHandler(agendaSnapshotRepository, resourceRepository),
  inject: [
    INFRASTRUCTURE_TOKENS.AGENDA_SNAPSHOT_REPOSITORY,
    INFRASTRUCTURE_TOKENS.RESOURCE_REPOSITORY,
  ],
};

@Module({
  imports: [DatabaseModule],
  controllers: [AvailabilityController],
  providers: [
    agendaSnapshotRepositoryProvider,
    resourceRepositoryProvider,
    getAvailableSlotsQueryHandlerProvider,
  ],
  exports: [
    INFRASTRUCTURE_TOKENS.AGENDA_SNAPSHOT_REPOSITORY,
    GetAvailableSlotsQueryHandler,
  ],
})
export class AvailabilityModule {}
