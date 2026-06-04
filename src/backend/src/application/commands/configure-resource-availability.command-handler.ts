import { randomUUID } from 'crypto';
import { ResourceAvailabilityRule } from '../../domain/entities/resource-availability-rule.entity';
import { ResourceBreak } from '../../domain/entities/resource-break.entity';
import { IResourceRepository } from '../../domain/repositories/resource.repository';
import { ResourceNotFoundException } from '../../domain/exceptions/resource-not-found.exception';
import { ResourceId } from '../../domain/value-objects/resource-id.vo';
import { ResourceAvailabilityRuleId } from '../../domain/value-objects/availability-rule-id.vo';
import { ResourceBreakId } from '../../domain/value-objects/break-id.vo';
import { ConfigureResourceAvailabilityCommand } from './configure-resource-availability.command';

export interface ConfigureResourceAvailabilityResponseDto {
  id: string; // The configured Resource's ID
}

export class ConfigureResourceAvailabilityCommandHandler {
  constructor(private readonly resourceRepository: IResourceRepository) {}

  async execute(
    command: ConfigureResourceAvailabilityCommand
  ): Promise<ConfigureResourceAvailabilityResponseDto> {
    const resourceId = ResourceId.create(command.resourceId);
    const resource = await this.resourceRepository.findById(resourceId);

    if (!resource) {
      throw new ResourceNotFoundException(command.resourceId);
    }

    const toMinutes = (time: string): number => {
      const parts = time.trim().split(':');
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      return h * 60 + m;
    };

    for (const rule of command.rules) {
      const ruleId = ResourceAvailabilityRuleId.create(randomUUID());
      const ruleEntity = ResourceAvailabilityRule.create({
        id: ruleId,
        resourceId: resource.id,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        validFrom: rule.validFrom,
        validTo: rule.validTo,
      });

      await this.resourceRepository.saveAvailabilityRule(ruleEntity);

      if (rule.breaks && rule.breaks.length > 0) {
        const ruleStart = toMinutes(rule.startTime);
        const ruleEnd = toMinutes(rule.endTime);

        for (const brk of rule.breaks) {
          const breakStart = toMinutes(brk.startTime);
          const breakEnd = toMinutes(brk.endTime);

          if (breakStart < ruleStart || breakEnd > ruleEnd) {
            throw new Error(
              `Break (${brk.startTime} - ${brk.endTime}) must be within availability rule hours (${rule.startTime} - ${rule.endTime})`
            );
          }

          const breakEntity = ResourceBreak.create({
            id: ResourceBreakId.create(randomUUID()),
            availabilityRuleId: ruleId,
            startTime: brk.startTime,
            endTime: brk.endTime,
          });

          await this.resourceRepository.saveBreak(breakEntity);
        }
      }
    }

    return {
      id: resource.id.value,
    };
  }
}
