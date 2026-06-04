"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAlreadyExistsException = void 0;
const conflict_exception_1 = require("./conflict.exception");
class UserAlreadyExistsException extends conflict_exception_1.ConflictException {
    constructor(email) {
        super(`A user with email ${email} already exists`, 'USER_ALREADY_EXISTS');
    }
}
exports.UserAlreadyExistsException = UserAlreadyExistsException;
