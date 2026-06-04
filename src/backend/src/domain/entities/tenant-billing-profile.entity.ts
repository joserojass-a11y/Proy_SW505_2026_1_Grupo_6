import { TenantId } from '../value-objects/tenant-id.vo';

export type TenantPlanTier = 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

export interface TenantBillingProfilePrimitives {
  tenantId: string;
  planTier: TenantPlanTier;
  maxBranches: number;
  maxResources: number;
}

export interface CreateTenantBillingProfileProps {
  tenantId: TenantId | string;
  planTier?: TenantPlanTier;
  maxBranches?: number;
  maxResources?: number;
}

export class TenantBillingProfile {
  private constructor(
    private _tenantId: TenantId,
    private _planTier: TenantPlanTier,
    private _maxBranches: number,
    private _maxResources: number,
  ) {}

  static create(props: CreateTenantBillingProfileProps): TenantBillingProfile {
    return new TenantBillingProfile(
      props.tenantId instanceof TenantId ? props.tenantId : TenantId.create(props.tenantId),
      props.planTier ?? 'BASIC',
      props.maxBranches ?? 1,
      props.maxResources ?? 10,
    );
  }

  get tenantId(): TenantId { return this._tenantId; }
  get planTier(): TenantPlanTier { return this._planTier; }
  get maxBranches(): number { return this._maxBranches; }
  get maxResources(): number { return this._maxResources; }

  toPrimitives(): TenantBillingProfilePrimitives {
    return {
      tenantId: this._tenantId.value,
      planTier: this._planTier,
      maxBranches: this._maxBranches,
      maxResources: this._maxResources,
    };
  }
}
