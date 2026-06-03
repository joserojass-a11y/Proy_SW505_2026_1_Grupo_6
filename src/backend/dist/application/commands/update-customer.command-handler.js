"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerCommandHandler = void 0;
const customer_not_found_exception_1 = require("../../domain/exceptions/customer-not-found.exception");
const user_id_vo_1 = require("../../domain/value-objects/user-id.vo");
const email_vo_1 = require("../../domain/value-objects/email.vo");
class UpdateCustomerCommandHandler {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(command) {
        const customer = await this.customerRepository.findByUserId(user_id_vo_1.UserId.create(command.userId));
        if (!customer) {
            throw new customer_not_found_exception_1.CustomerNotFoundException(command.userId);
        }
        customer.updateProfile({
            firstName: command.firstName,
            lastName: command.lastName,
            email: command.email ? email_vo_1.Email.create(command.email) : undefined,
            phone: command.phone,
            timezone: command.timezone,
            preferences: command.preferences,
            consentSigned: command.consentSigned,
        });
        const savedCustomer = await this.customerRepository.update(customer);
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
exports.UpdateCustomerCommandHandler = UpdateCustomerCommandHandler;
