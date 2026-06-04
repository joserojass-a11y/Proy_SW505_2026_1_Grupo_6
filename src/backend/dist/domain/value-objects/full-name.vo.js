"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullName = void 0;
const invalid_full_name_exception_1 = require("../exceptions/invalid-full-name.exception");
class FullName {
    constructor(_value) {
        this._value = _value;
    }
    static create(value) {
        if (typeof value !== 'string') {
            throw new invalid_full_name_exception_1.InvalidFullNameException();
        }
        const normalizedValue = value.trim().replace(/\s+/g, ' ');
        if (normalizedValue.length < 3 || normalizedValue.length > 255) {
            throw new invalid_full_name_exception_1.InvalidFullNameException();
        }
        return new FullName(normalizedValue);
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other.value;
    }
}
exports.FullName = FullName;
