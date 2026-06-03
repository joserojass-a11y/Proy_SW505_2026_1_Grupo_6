"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidUserRoleException = void 0;
const validation_exception_1 = require("./validation.exception");
class InvalidUserRoleException extends validation_exception_1.ValidationException {
    constructor(value) {
        super(`Invalid user role: ${value}`, 'INVALID_USER_ROLE');
    }
}
exports.InvalidUserRoleException = InvalidUserRoleException;
