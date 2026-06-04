import { randomUUID } from 'crypto';
import { ResourceId } from '../value-objects/resource-id.vo';
import { ScheduleSlot } from '../entities/schedule-slot.entity';
import { IResourceRepository } from '../repositories/resource.repository';
import { TimeRange } from '../value-objects/time-range.vo';

export class SlotGeneratorService {
  constructor(private readonly resourceRepository: IResourceRepository) {}

  async generateSlotsForDateRange(
    resourceId: ResourceId,
    startDate: Date,
    endDate: Date,
    serviceDurationMinutes: number
  ): Promise<ScheduleSlot[]> {
    const resource = await this.resourceRepository.findById(resourceId);
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId.value}`);
    }

    const rules = await this.resourceRepository.findAvailabilityRulesByResourceId(resourceId);
    const timeOffs = await this.resourceRepository.findTimeOffByResourceId(resourceId);
    const branchExceptions = await this.resourceRepository.findBranchExceptionsByBranchId(resource.branchId);

    const rulesWithBreaks = await Promise.all(
      rules.map(async (rule) => {
        const breaks = await this.resourceRepository.findBreaksByAvailabilityRuleId(rule.id);
        return { rule, breaks };
      })
    );

    const generatedSlots: ScheduleSlot[] = [];

    const formatDateKey = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const current = new Date(startDate);
    const end = new Date(endDate);

    const startMidnight = new Date(
      Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), 0, 0, 0, 0)
    );
    const endMidnight = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999)
    );

    const loopDate = new Date(startMidnight);

    const toMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    while (loopDate <= endMidnight) {
      const jsDay = loopDate.getUTCDay();
      const dayOfWeekMapped = jsDay === 0 ? 7 : jsDay;

      const activeRuleWrapper = rulesWithBreaks.find(({ rule }) => {
        return rule.dayOfWeek === dayOfWeekMapped && rule.isValidOn(loopDate);
      });

      if (activeRuleWrapper) {
        const { rule, breaks } = activeRuleWrapper;

        const ruleStartMins = toMinutes(rule.shift.startTime);
        const ruleEndMins = toMinutes(rule.shift.endTime);

        let currentSlotStartMins = ruleStartMins;

        while (true) {
          const currentSlotEndMins = currentSlotStartMins + serviceDurationMinutes;
          if (currentSlotEndMins > ruleEndMins) {
            break;
          }

          const slotStart = new Date(
            Date.UTC(
              loopDate.getUTCFullYear(),
              loopDate.getUTCMonth(),
              loopDate.getUTCDate(),
              Math.floor(currentSlotStartMins / 60),
              currentSlotStartMins % 60,
              0,
              0
            )
          );
          const slotEnd = new Date(
            Date.UTC(
              loopDate.getUTCFullYear(),
              loopDate.getUTCMonth(),
              loopDate.getUTCDate(),
              Math.floor(currentSlotEndMins / 60),
              currentSlotEndMins % 60,
              0,
              0
            )
          );

          const slotRange = TimeRange.create(slotStart, slotEnd);

          const overlapsBreak = breaks.some((brk) => {
            const bStartMins = toMinutes(brk.period.startTime);
            const bEndMins = toMinutes(brk.period.endTime);
            return currentSlotStartMins < bEndMins && bStartMins < currentSlotEndMins;
          });

          const overlapsTimeOff = timeOffs.some((to) => {
            const toRange = TimeRange.create(new Date(to.startDatetime), new Date(to.endDatetime));
            return slotRange.overlaps(toRange);
          });

          const overlapsBranchException = branchExceptions.some((exc) => {
            if (exc.isFullDay) {
              const excDateKey = formatDateKey(new Date(exc.startDatetime));
              const currentDayKey = formatDateKey(loopDate);
              return excDateKey === currentDayKey;
            }
            const excRange = TimeRange.create(new Date(exc.startDatetime), new Date(exc.endDatetime));
            return slotRange.overlaps(excRange);
          });

          if (!overlapsBreak && !overlapsTimeOff && !overlapsBranchException) {
            const slot = ScheduleSlot.create({
              id: randomUUID(),
              resourceId,
              startsAt: slotStart,
              endsAt: slotEnd,
              status: 'AVAILABLE',
            });
            generatedSlots.push(slot);
          }

          currentSlotStartMins = currentSlotEndMins;
        }
      }

      loopDate.setUTCDate(loopDate.getUTCDate() + 1);
    }

    return generatedSlots;
  }
}
