"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const invalid_user_role_exception_1 = require("../exceptions/invalid-user-role.exception");
class UserRole {
    constructor(_value) {
        this._value = _value;
    }
    static create(value) {
        if (value === 'CLIENT' || value === 'ADMIN' || value === 'OWNER') {
            return new UserRole(value);
        }
        throw new invalid_user_role_exception_1.InvalidUserRoleException(value);
    }
    static client() {
        return new UserRole('CLIENT');
    }
    static admin() {
        return new UserRole('ADMIN');
    }
    static owner() {
        return new UserRole('OWNER');
    }
    get value() {
        return this._value;
    }
    isClient() {
        return this._value === 'CLIENT';
    }
    isAdmin() {
        return this._value === 'ADMIN';
    }
    isOwner() {
        return this._value === 'OWNER';
    }
    equals(other) {
        return this._value === other.value;
    }
}
exports.UserRole = UserRole;
