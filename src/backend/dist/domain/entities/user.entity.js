"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const email_vo_1 = require("../value-objects/email.vo");
const full_name_vo_1 = require("../value-objects/full-name.vo");
const password_hash_vo_1 = require("../value-objects/password-hash.vo");
const user_id_vo_1 = require("../value-objects/user-id.vo");
const user_role_vo_1 = require("../value-objects/user-role.vo");
const user_status_vo_1 = require("../value-objects/user-status.vo");
const user_status_transition_exception_1 = require("../exceptions/user-status-transition.exception");
class User {
    constructor(_id, _email, _passwordHash, _fullName, _role, _status, _createdAt, _updatedAt) {
        this._id = _id;
        this._email = _email;
        this._passwordHash = _passwordHash;
        this._fullName = _fullName;
        this._role = _role;
        this._status = _status;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
    }
    static create(props) {
        return new User(User.toUserId(props.id), User.toEmail(props.email), User.toPasswordHash(props.passwordHash), User.toFullName(props.fullName), User.toUserRole(props.role ?? 'CLIENT'), User.toUserStatus(props.status ?? 'PENDING'), props.createdAt ?? new Date(), props.updatedAt ?? new Date());
    }
    static reconstitute(props) {
        return new User(User.toUserId(props.id), User.toEmail(props.email), User.toPasswordHash(props.passwordHash), User.toFullName(props.fullName), User.toUserRole(props.role), User.toUserStatus(props.status), props.createdAt, props.updatedAt);
    }
    get id() {
        return this._id;
    }
    get email() {
        return this._email;
    }
    get passwordHash() {
        return this._passwordHash;
    }
    get fullName() {
        return this._fullName;
    }
    get role() {
        return this._role;
    }
    get status() {
        return this._status;
    }
    get createdAt() {
        return new Date(this._createdAt);
    }
    get updatedAt() {
        return new Date(this._updatedAt);
    }
    updateProfile(props) {
        if (props.email) {
            this._email = User.toEmail(props.email);
        }
        if (props.fullName) {
            this._fullName = User.toFullName(props.fullName);
        }
        this.touch();
    }
    changePasswordHash(passwordHash) {
        this._passwordHash = User.toPasswordHash(passwordHash);
        this.touch();
    }
    assignRole(role) {
        this._role = User.toUserRole(role);
        this.touch();
    }
    changeStatus(status) {
        const nextStatus = User.toUserStatus(status);
        const currentStatus = this._status.value;
        const allowedTransitions = {
            PENDING: ['ACTIVE', 'BLOCKED'],
            ACTIVE: ['BLOCKED', 'ACTIVE'],
            BLOCKED: ['ACTIVE', 'BLOCKED'],
        };
        if (!allowedTransitions[currentStatus].includes(nextStatus.value)) {
            throw new user_status_transition_exception_1.UserStatusTransitionException(currentStatus, nextStatus.value);
        }
        this._status = nextStatus;
        this.touch();
    }
    activate() {
        this.changeStatus(user_status_vo_1.UserStatus.active());
    }
    block() {
        this.changeStatus(user_status_vo_1.UserStatus.blocked());
    }
    markPending() {
        this.changeStatus(user_status_vo_1.UserStatus.pending());
    }
    touch(date = new Date()) {
        this._updatedAt = date;
    }
    toPrimitives() {
        return {
            id: this._id.value,
            email: this._email.value,
            passwordHash: this._passwordHash.value,
            fullName: this._fullName.value,
            role: this._role.value,
            status: this._status.value,
            createdAt: new Date(this._createdAt),
            updatedAt: new Date(this._updatedAt),
        };
    }
    static toUserId(value) {
        if (!value) {
            throw new Error('User id is required');
        }
        return value instanceof user_id_vo_1.UserId ? value : user_id_vo_1.UserId.create(value);
    }
    static toEmail(value) {
        return value instanceof email_vo_1.Email ? value : email_vo_1.Email.create(value);
    }
    static toPasswordHash(value) {
        return value instanceof password_hash_vo_1.PasswordHash ? value : password_hash_vo_1.PasswordHash.create(value);
    }
    static toFullName(value) {
        return value instanceof full_name_vo_1.FullName ? value : full_name_vo_1.FullName.create(value);
    }
    static toUserRole(value) {
        return value instanceof user_role_vo_1.UserRole ? value : user_role_vo_1.UserRole.create(value);
    }
    static toUserStatus(value) {
        return value instanceof user_status_vo_1.UserStatus ? value : user_status_vo_1.UserStatus.create(value);
    }
}
exports.User = User;
