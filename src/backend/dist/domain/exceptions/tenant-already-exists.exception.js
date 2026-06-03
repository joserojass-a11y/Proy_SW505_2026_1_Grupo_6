"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAlreadyExistsException = void 0;
const conflict_exception_1 = require("./conflict.exception");
class TenantAlreadyExistsException extends conflict_exception_1.ConflictException {
    constructor(ownerUserId) {
        super(`A tenant already exists for owner ${ownerUserId}`, 'TENANT_ALREADY_EXISTS');
    }
}
exports.TenantAlreadyExistsException = TenantAlreadyExistsException;
