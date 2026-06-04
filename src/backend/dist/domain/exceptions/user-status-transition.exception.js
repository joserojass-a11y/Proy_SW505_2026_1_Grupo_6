"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatusTransitionException = void 0;
const invalid_transition_exception_1 = require("./invalid-transition.exception");
class UserStatusTransitionException extends invalid_transition_exception_1.InvalidTransitionException {
    constructor(from, to) {
        super(`Cannot transition user status from ${from} to ${to}`, 'USER_STATUS_TRANSITION_NOT_ALLOWED');
    }
}
exports.UserStatusTransitionException = UserStatusTransitionException;
