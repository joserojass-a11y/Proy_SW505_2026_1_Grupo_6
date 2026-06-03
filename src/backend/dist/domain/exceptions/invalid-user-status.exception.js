"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidUserStatusException = void 0;
const validation_exception_1 = require("./validation.exception");
class InvalidUserStatusException extends validation_exception_1.ValidationException {
    constructor(value) {
        super(`Invalid user status: ${value}`, 'INVALID_USER_STATUS');
    }
}
exports.InvalidUserStatusException = InvalidUserStatusException;
