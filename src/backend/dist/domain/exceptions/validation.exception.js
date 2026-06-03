"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const domain_exception_1 = require("./domain.exception");
class ValidationException extends domain_exception_1.DomainException {
    constructor(message, code = 'VALIDATION_ERROR') {
        super(message, code);
    }
}
exports.ValidationException = ValidationException;
