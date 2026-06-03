"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidUserIdException = void 0;
const validation_exception_1 = require("./validation.exception");
class InvalidUserIdException extends validation_exception_1.ValidationException {
    constructor(value) {
        super(`Invalid user id: ${value}`, 'INVALID_USER_ID');
    }
}
exports.InvalidUserIdException = InvalidUserIdException;
