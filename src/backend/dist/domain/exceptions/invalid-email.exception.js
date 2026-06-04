"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEmailException = void 0;
const validation_exception_1 = require("./validation.exception");
class InvalidEmailException extends validation_exception_1.ValidationException {
    constructor(value) {
        super(`Invalid email: ${value}`, 'INVALID_EMAIL');
    }
}
exports.InvalidEmailException = InvalidEmailException;
