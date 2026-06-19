import { Zone } from '../entities/zone.entity';
import { ZoneId } from '../value-objects/zone-id.vo';

export interface IZoneRepository {
  findById(id: ZoneId): Promise<Zone | null>;
  findByCode(code: string): Promise<Zone | null>;
  findAll(): Promise<Zone[]>;
  save(zone: Zone): Promise<Zone>;
}
