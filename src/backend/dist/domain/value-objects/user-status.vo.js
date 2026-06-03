"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = void 0;
const invalid_user_status_exception_1 = require("../exceptions/invalid-user-status.exception");
class UserStatus {
    constructor(_value) {
        this._value = _value;
    }
    static create(value) {
        if (value === 'PENDING' || value === 'ACTIVE' || value === 'BLOCKED') {
            return new UserStatus(value);
        }
        throw new invalid_user_status_exception_1.InvalidUserStatusException(value);
    }
    static pending() {
        return new UserStatus('PENDING');
    }
    static active() {
        return new UserStatus('ACTIVE');
    }
    static blocked() {
        return new UserStatus('BLOCKED');
    }
    get value() {
        return this._value;
    }
    isPending() {
        return this._value === 'PENDING';
    }
    isActive() {
        return this._value === 'ACTIVE';
    }
    isBlocked() {
        return this._value === 'BLOCKED';
    }
    equals(other) {
        return this._value === other.value;
    }
}
exports.UserStatus = UserStatus;
