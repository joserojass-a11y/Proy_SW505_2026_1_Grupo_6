"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTenantQueryHandler = void 0;
const tenant_not_found_exception_1 = require("../../domain/exceptions/tenant-not-found.exception");
const tenant_id_vo_1 = require("../../domain/value-objects/tenant-id.vo");
class GetTenantQueryHandler {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    async execute(query) {
        const tenant = await this.tenantRepository.findById(tenant_id_vo_1.TenantId.create(query.tenantId));
        if (!tenant) {
            throw new tenant_not_found_exception_1.TenantNotFoundException(query.tenantId);
        }
        const primitives = tenant.toPrimitives();
        return {
            id: primitives.id,
            ownerUserId: primitives.ownerUserId,
            countryCode: primitives.countryCode,
            status: primitives.status,
            subdomain: primitives.subdomain,
            name: primitives.name,
            globalSettings: primitives.globalSettings,
            createdAt: primitives.createdAt.toISOString(),
            updatedAt: primitives.updatedAt.toISOString(),
        };
    }
}
exports.GetTenantQueryHandler = GetTenantQueryHandler;
