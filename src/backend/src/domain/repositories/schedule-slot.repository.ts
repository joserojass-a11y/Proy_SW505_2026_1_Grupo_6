import { ScheduleSlot } from '../entities/schedule-slot.entity';
import { ScheduleSlotId } from '../value-objects/schedule-slot-id.vo';
import { ResourceId } from '../value-objects/resource-id.vo';
import { TimeRange } from '../value-objects/time-range.vo';

export interface IScheduleSlotRepository {
  findById(id: ScheduleSlotId): Promise<ScheduleSlot | null>;
  findByResourceIdAndTimeRange(resourceId: ResourceId, timeRange: TimeRange): Promise<ScheduleSlot[]>;
  save(slot: ScheduleSlot): Promise<ScheduleSlot>;
  saveMany(slots: ScheduleSlot[]): Promise<ScheduleSlot[]>;
  deleteById(id: ScheduleSlotId): Promise<void>;
}
