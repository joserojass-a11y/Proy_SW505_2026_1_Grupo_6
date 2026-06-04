"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantCommandHandler = void 0;
const crypto_1 = require("crypto");
const tenant_entity_1 = require("../../domain/entities/tenant.entity");
const tenant_billing_profile_entity_1 = require("../../domain/entities/tenant-billing-profile.entity");
const tenant_already_exists_exception_1 = require("../../domain/exceptions/tenant-already-exists.exception");
const tenant_id_vo_1 = require("../../domain/value-objects/tenant-id.vo");
const user_id_vo_1 = require("../../domain/value-objects/user-id.vo");
const tenant_not_found_exception_1 = require("../../domain/exceptions/tenant-not-found.exception");
class CreateTenantCommandHandler {
    constructor(tenantRepository, userRepository, tenantBillingProfileRepository) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.tenantBillingProfileRepository = tenantBillingProfileRepository;
    }
    async execute(command) {
        const ownerUserId = user_id_vo_1.UserId.create(command.ownerUserId);
        const ownerUser = await this.userRepository.findById(ownerUserId);
        if (!ownerUser) {
            throw new tenant_not_found_exception_1.TenantNotFoundException(command.ownerUserId);
        }
        if (!ownerUser.role.isOwner()) {
            throw new tenant_not_found_exception_1.TenantNotFoundException(`OWNER:${command.ownerUserId}`);
        }
        const existingTenant = await this.tenantRepository.findByOwnerUserId(ownerUserId.value);
        if (existingTenant) {
            throw new tenant_already_exists_exception_1.TenantAlreadyExistsException(ownerUserId.value);
        }
        const tenant = tenant_entity_1.Tenant.create({
            id: tenant_id_vo_1.TenantId.create((0, crypto_1.randomUUID)()),
            ownerUserId,
            countryCode: command.countryCode,
            subdomain: command.subdomain,
            name: command.name,
            globalSettings: command.globalSettings,
        });
        const savedTenant = await this.tenantRepository.save(tenant);
        await this.tenantBillingProfileRepository.save(tenant_billing_profile_entity_1.TenantBillingProfile.create({ tenantId: savedTenant.id }));
        return this.toDto(savedTenant);
    }
    toDto(tenant) {
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
exports.CreateTenantCommandHandler = CreateTenantCommandHandler;
