"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundException = void 0;
const not_found_exception_1 = require("./not-found.exception");
class UserNotFoundException extends not_found_exception_1.NotFoundException {
    constructor(identifier) {
        super(`User not found: ${identifier}`, 'USER_NOT_FOUND');
    }
}
exports.UserNotFoundException = UserNotFoundException;
