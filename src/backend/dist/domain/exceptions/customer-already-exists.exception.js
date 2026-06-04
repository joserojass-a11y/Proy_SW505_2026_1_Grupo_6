"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAlreadyExistsException = void 0;
const conflict_exception_1 = require("./conflict.exception");
class CustomerAlreadyExistsException extends conflict_exception_1.ConflictException {
    constructor(userId) {
        super(`A customer already exists for user ${userId}`, 'CUSTOMER_ALREADY_EXISTS');
    }
}
exports.CustomerAlreadyExistsException = CustomerAlreadyExistsException;
