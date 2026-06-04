"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTransitionException = void 0;
const domain_exception_1 = require("./domain.exception");
class InvalidTransitionException extends domain_exception_1.DomainException {
    constructor(message, code = 'INVALID_TRANSITION') {
        super(message, code);
    }
}
exports.InvalidTransitionException = InvalidTransitionException;
