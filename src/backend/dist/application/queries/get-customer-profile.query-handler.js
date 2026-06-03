"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomerProfileQueryHandler = void 0;
const customer_not_found_exception_1 = require("../../domain/exceptions/customer-not-found.exception");
const user_id_vo_1 = require("../../domain/value-objects/user-id.vo");
class GetCustomerProfileQueryHandler {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(query) {
        const customer = await this.customerRepository.findByUserId(user_id_vo_1.UserId.create(query.userId));
        if (!customer) {
            throw new customer_not_found_exception_1.CustomerNotFoundException(query.userId);
        }
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
exports.GetCustomerProfileQueryHandler = GetCustomerProfileQueryHandler;
