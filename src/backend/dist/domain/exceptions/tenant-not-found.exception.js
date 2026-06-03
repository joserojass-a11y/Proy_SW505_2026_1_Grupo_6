"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantNotFoundException = void 0;
const not_found_exception_1 = require("./not-found.exception");
class TenantNotFoundException extends not_found_exception_1.NotFoundException {
    constructor(identifier) {
        super(`Tenant not found: ${identifier}`, 'TENANT_NOT_FOUND');
    }
}
exports.TenantNotFoundException = TenantNotFoundException;
