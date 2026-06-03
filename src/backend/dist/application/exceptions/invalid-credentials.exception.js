"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsException = void 0;
class InvalidCredentialsException extends Error {
    constructor() {
        super('Invalid credentials');
        this.name = new.target.name;
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
