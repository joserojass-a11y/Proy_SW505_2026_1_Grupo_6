"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = void 0;
const invalid_user_id_exception_1 = require("../exceptions/invalid-user-id.exception");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
class UserId {
    constructor(_value) {
        this._value = _value;
    }
    static create(value) {
        const normalizedValue = value.trim();
        if (!UUID_REGEX.test(normalizedValue)) {
            throw new invalid_user_id_exception_1.InvalidUserIdException(value);
        }
        return new UserId(normalizedValue);
    }
    static fromNullable(value) {
        return value ? UserId.create(value) : null;
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other.value;
    }
}
exports.UserId = UserId;
