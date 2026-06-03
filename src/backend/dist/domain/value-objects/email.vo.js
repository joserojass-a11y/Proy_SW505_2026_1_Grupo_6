"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const invalid_email_exception_1 = require("../exceptions/invalid-email.exception");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class Email {
    constructor(_value) {
        this._value = _value;
    }
    static create(value) {
        const normalizedValue = value.trim().toLowerCase();
        if (!EMAIL_REGEX.test(normalizedValue) || normalizedValue.length > 255) {
            throw new invalid_email_exception_1.InvalidEmailException(value);
        }
        return new Email(normalizedValue);
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other.value;
    }
}
exports.Email = Email;
