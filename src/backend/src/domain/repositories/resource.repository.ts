import { Resource } from '../entities/resource.entity';
import { ResourceAvailabilityRule } from '../entities/resource-availability-rule.entity';
import { ResourceBreak } from '../entities/resource-break.entity';
import { ResourceId } from '../value-objects/resource-id.vo';
import { TenantId } from '../value-objects/tenant-id.vo';
import { BranchId } from '../value-objects/branch-id.vo';
import { ResourceAvailabilityRuleId } from '../value-objects/availability-rule-id.vo';
import { ResourceBreakId } from '../value-objects/break-id.vo';

export interface ResourceTimeOff {
  id: string;
  resourceId: string;
  startDatetime: Date;
  endDatetime: Date;
  reason: string;
}

export interface BranchException {
  id: string;
  tenantId: string;
  branchId: string;
  startDatetime: Date;
  endDatetime: Date;
  reason: string;
  isFullDay: boolean;
}

export interface IResourceRepository {
  // Resource operations
  findById(id: ResourceId): Promise<Resource | null>;
  findByTenantId(tenantId: TenantId): Promise<Resource[]>;
  findByBranchId(branchId: BranchId): Promise<Resource[]>;
  save(resource: Resource): Promise<Resource>;
  update(resource: Resource): Promise<Resource>;
  deleteById(id: ResourceId): Promise<void>;

  // Availability Rule operations
  findAvailabilityRulesByResourceId(resourceId: ResourceId): Promise<ResourceAvailabilityRule[]>;
  saveAvailabilityRule(rule: ResourceAvailabilityRule): Promise<ResourceAvailabilityRule>;
  deleteAvailabilityRuleById(id: ResourceAvailabilityRuleId): Promise<void>;

  // Break operations
  findBreaksByAvailabilityRuleId(ruleId: ResourceAvailabilityRuleId): Promise<ResourceBreak[]>;
  saveBreak(breakObj: ResourceBreak): Promise<ResourceBreak>;
  deleteBreakById(id: ResourceBreakId): Promise<void>;

  // Exceptions / Time Off operations
  findTimeOffByResourceId(resourceId: ResourceId): Promise<ResourceTimeOff[]>;
  findBranchExceptionsByBranchId(branchId: BranchId): Promise<BranchException[]>;
}
