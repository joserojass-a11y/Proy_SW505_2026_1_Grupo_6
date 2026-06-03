"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHash = void 0;
const invalid_password_hash_exception_1 = require("../exceptions/invalid-password-hash.exception");
class PasswordHash {
    constructor(_value) {
        this._value = _value;
    }
    static create(value) {
        const normalizedValue = value.trim();
        if (normalizedValue.length < 20 || normalizedValue.length > 255) {
            throw new invalid_password_hash_exception_1.InvalidPasswordHashException();
        }
        return new PasswordHash(normalizedValue);
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other.value;
    }
}
exports.PasswordHash = PasswordHash;
