"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPasswordHashException = void 0;
const validation_exception_1 = require("./validation.exception");
class InvalidPasswordHashException extends validation_exception_1.ValidationException {
    constructor() {
        super('Password hash is invalid', 'INVALID_PASSWORD_HASH');
    }
}
exports.InvalidPasswordHashException = InvalidPasswordHashException;
