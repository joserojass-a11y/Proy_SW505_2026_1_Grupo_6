import { IAgendaSnapshotRepository } from '../../domain/repositories/agenda-snapshot.repository';
import { IResourceRepository } from '../../domain/repositories/resource.repository';
import { ResourceId } from '../../domain/value-objects/resource-id.vo';
import { BranchId } from '../../domain/value-objects/branch-id.vo';
import { GetAvailableSlotsQuery } from './get-available-slots.query';

export class GetAvailableSlotsQueryHandler {
  constructor(
    private readonly agendaSnapshotRepository: IAgendaSnapshotRepository,
    private readonly resourceRepository: IResourceRepository
  ) {}

  async execute(query: GetAvailableSlotsQuery): Promise<any> {
    const parsedDate = new Date(query.date);

    if (query.resourceId) {
      const resourceId = ResourceId.create(query.resourceId);
      const snapshot = await this.agendaSnapshotRepository.findByResourceIdAndDate(resourceId, parsedDate);
      return snapshot ? snapshot.timeline : { slots: [] };
    } else {
      const branchId = BranchId.create(query.branchId);
      const resources = await this.resourceRepository.findByBranchId(branchId);

      const timelines: Record<string, any> = {};
      for (const resource of resources) {
        const snapshot = await this.agendaSnapshotRepository.findByResourceIdAndDate(resource.id, parsedDate);
        timelines[resource.id.value] = snapshot ? snapshot.timeline : { slots: [] };
      }
      return timelines;
    }
  }
}
