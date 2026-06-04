"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainException = void 0;
class DomainException extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = new.target.name;
    }
}
exports.DomainException = DomainException;
