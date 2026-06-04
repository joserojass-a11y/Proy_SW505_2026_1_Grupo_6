"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantBillingProfile = void 0;
const tenant_id_vo_1 = require("../value-objects/tenant-id.vo");
class TenantBillingProfile {
    constructor(_tenantId, _planTier, _maxBranches, _maxResources) {
        this._tenantId = _tenantId;
        this._planTier = _planTier;
        this._maxBranches = _maxBranches;
        this._maxResources = _maxResources;
    }
    static create(props) {
        return new TenantBillingProfile(props.tenantId instanceof tenant_id_vo_1.TenantId ? props.tenantId : tenant_id_vo_1.TenantId.create(props.tenantId), props.planTier ?? 'BASIC', props.maxBranches ?? 1, props.maxResources ?? 10);
    }
    get tenantId() { return this._tenantId; }
    get planTier() { return this._planTier; }
    get maxBranches() { return this._maxBranches; }
    get maxResources() { return this._maxResources; }
    toPrimitives() {
        return {
            tenantId: this._tenantId.value,
            planTier: this._planTier,
            maxBranches: this._maxBranches,
            maxResources: this._maxResources,
        };
    }
}
exports.TenantBillingProfile = TenantBillingProfile;
