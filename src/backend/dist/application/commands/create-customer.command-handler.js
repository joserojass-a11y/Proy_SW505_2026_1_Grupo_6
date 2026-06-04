"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerCommandHandler = void 0;
const crypto_1 = require("crypto");
const customer_entity_1 = require("../../domain/entities/customer.entity");
const customer_already_exists_exception_1 = require("../../domain/exceptions/customer-already-exists.exception");
const tenant_not_found_exception_1 = require("../../domain/exceptions/tenant-not-found.exception");
const email_vo_1 = require("../../domain/value-objects/email.vo");
const customer_id_vo_1 = require("../../domain/value-objects/customer-id.vo");
const user_id_vo_1 = require("../../domain/value-objects/user-id.vo");
const tenant_id_vo_1 = require("../../domain/value-objects/tenant-id.vo");
class CreateCustomerCommandHandler {
    constructor(customerRepository, tenantRepository) {
        this.customerRepository = customerRepository;
        this.tenantRepository = tenantRepository;
    }
    async execute(command) {
        const tenantId = tenant_id_vo_1.TenantId.create(command.tenantId);
        const tenant = await this.tenantRepository.findById(tenantId);
        if (!tenant) {
            throw new tenant_not_found_exception_1.TenantNotFoundException(command.tenantId);
        }
        const userId = user_id_vo_1.UserId.create(command.userId);
        const existingCustomer = await this.customerRepository.findByUserId(userId);
        if (existingCustomer) {
            throw new customer_already_exists_exception_1.CustomerAlreadyExistsException(userId.value);
        }
        const customer = customer_entity_1.Customer.create({
            id: customer_id_vo_1.CustomerId.create((0, crypto_1.randomUUID)()),
            tenantId,
            userId,
            firstName: command.firstName,
            lastName: command.lastName,
            email: email_vo_1.Email.create(command.email),
            phone: command.phone,
            timezone: command.timezone,
            preferences: command.preferences,
            consentSigned: command.consentSigned,
        });
        const savedCustomer = await this.customerRepository.save(customer);
        return this.toDto(savedCustomer);
    }
    toDto(customer) {
        const primitives = customer.toPrimitives();
        return {
            id: primitives.id,
            tenantId: primitives.tenantId,
            userId: primitives.userId,
            firstName: primitives.firstName,
            lastName: primitives.lastName,
            email: primitives.email,
            phone: primitives.phone,
            timezone: primitives.timezone,
            preferences: primitives.preferences,
            consentSigned: primitives.consentSigned,
            createdAt: primitives.createdAt.toISOString(),
            updatedAt: primitives.updatedAt.toISOString(),
        };
    }
}
exports.CreateCustomerCommandHandler = CreateCustomerCommandHandler;
