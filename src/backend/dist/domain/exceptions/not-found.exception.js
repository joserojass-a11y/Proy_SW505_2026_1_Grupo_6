"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const domain_exception_1 = require("./domain.exception");
class NotFoundException extends domain_exception_1.DomainException {
    constructor(message, code = 'NOT_FOUND') {
        super(message, code);
    }
}
exports.NotFoundException = NotFoundException;
