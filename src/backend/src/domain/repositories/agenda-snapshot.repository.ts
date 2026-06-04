import { ResourceId } from '../value-objects/resource-id.vo';

export interface AgendaSnapshot {
  id: string;
  resourceId: string;
  date: Date;
  timeline: any; // The JSONB timeline containing the slot data
  lastCalculatedAt: Date;
}

export interface IAgendaSnapshotRepository {
  findByResourceIdAndDate(resourceId: ResourceId, date: Date): Promise<AgendaSnapshot | null>;
  upsert(resourceId: ResourceId, date: Date, timeline: any): Promise<void>;
}
