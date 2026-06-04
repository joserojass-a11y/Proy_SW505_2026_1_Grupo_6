import { DataSource } from 'typeorm';
import {
  IAgendaSnapshotRepository,
  AgendaSnapshot,
} from '../../../domain/repositories/agenda-snapshot.repository';
import { ResourceId } from '../../../domain/value-objects/resource-id.vo';
import { randomUUID } from 'crypto';

export class TypeOrmAgendaSnapshotRepository implements IAgendaSnapshotRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findByResourceIdAndDate(resourceId: ResourceId, date: Date): Promise<AgendaSnapshot | null> {
    const dateStr = date.toISOString().split('T')[0];

    const rows = await this.dataSource.query(
      'SELECT id, resource_id as "resourceId", date, timeline, last_calculated_at as "lastCalculatedAt" FROM agenda_daily_snapshots WHERE resource_id = $1 AND date = $2',
      [resourceId.value, dateStr]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      resourceId: row.resourceId,
      date: new Date(row.date),
      timeline: row.timeline,
      lastCalculatedAt: new Date(row.lastCalculatedAt),
    };
  }

  async upsert(resourceId: ResourceId, date: Date, timeline: any): Promise<void> {
    const id = randomUUID();
    const dateStr = date.toISOString().split('T')[0];
    const lastCalculatedAt = new Date();

    await this.dataSource.query(
      `INSERT INTO agenda_daily_snapshots (id, resource_id, date, timeline, last_calculated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (resource_id, date) 
       DO UPDATE SET 
         timeline = EXCLUDED.timeline, 
         last_calculated_at = EXCLUDED.last_calculated_at`,
      [id, resourceId.value, dateStr, JSON.stringify(timeline), lastCalculatedAt]
    );
  }
}
