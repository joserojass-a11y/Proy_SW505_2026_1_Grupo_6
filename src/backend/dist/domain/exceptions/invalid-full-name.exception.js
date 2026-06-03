"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidFullNameException = void 0;
const validation_exception_1 = require("./validation.exception");
class InvalidFullNameException extends validation_exception_1.ValidationException {
    constructor() {
        super('Full name must contain between 3 and 255 characters', 'INVALID_FULL_NAME');
    }
}
exports.InvalidFullNameException = InvalidFullNameException;
