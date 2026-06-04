import { DataSource } from 'typeorm';
import {
  IResourceRepository,
  ResourceTimeOff,
  BranchException,
} from '../../../domain/repositories/resource.repository';
import { Resource } from '../../../domain/entities/resource.entity';
import { ResourceAvailabilityRule } from '../../../domain/entities/resource-availability-rule.entity';
import { ResourceBreak } from '../../../domain/entities/resource-break.entity';
import { ResourceId } from '../../../domain/value-objects/resource-id.vo';
import { TenantId } from '../../../domain/value-objects/tenant-id.vo';
import { BranchId } from '../../../domain/value-objects/branch-id.vo';
import { ResourceAvailabilityRuleId } from '../../../domain/value-objects/availability-rule-id.vo';
import { ResourceBreakId } from '../../../domain/value-objects/break-id.vo';

export class TypeOrmResourceRepository implements IResourceRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: ResourceId): Promise<Resource | null> {
    return null;
  }

  async findByTenantId(tenantId: TenantId): Promise<Resource[]> {
    return [];
  }

  async findByBranchId(branchId: BranchId): Promise<Resource[]> {
    return [];
  }

  async save(resource: Resource): Promise<Resource> {
    return resource;
  }

  async update(resource: Resource): Promise<Resource> {
    return resource;
  }

  async deleteById(id: ResourceId): Promise<void> {}

  async findAvailabilityRulesByResourceId(resourceId: ResourceId): Promise<ResourceAvailabilityRule[]> {
    return [];
  }

  async saveAvailabilityRule(rule: ResourceAvailabilityRule): Promise<ResourceAvailabilityRule> {
    return rule;
  }

  async deleteAvailabilityRuleById(id: ResourceAvailabilityRuleId): Promise<void> {}

  async findBreaksByAvailabilityRuleId(ruleId: ResourceAvailabilityRuleId): Promise<ResourceBreak[]> {
    return [];
  }

  async saveBreak(breakObj: ResourceBreak): Promise<ResourceBreak> {
    return breakObj;
  }

  async deleteBreakById(id: ResourceBreakId): Promise<void> {}

  async findTimeOffByResourceId(resourceId: ResourceId): Promise<ResourceTimeOff[]> {
    return [];
  }

  async findBranchExceptionsByBranchId(branchId: BranchId): Promise<BranchException[]> {
    return [];
  }
}
