"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNotFoundException = void 0;
const not_found_exception_1 = require("./not-found.exception");
class CustomerNotFoundException extends not_found_exception_1.NotFoundException {
    constructor(identifier) {
        super(`Customer not found: ${identifier}`, 'CUSTOMER_NOT_FOUND');
    }
}
exports.CustomerNotFoundException = CustomerNotFoundException;
