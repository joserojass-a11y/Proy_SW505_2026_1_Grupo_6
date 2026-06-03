"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const tenant_id_vo_1 = require("../value-objects/tenant-id.vo");
const customer_id_vo_1 = require("../value-objects/customer-id.vo");
const email_vo_1 = require("../value-objects/email.vo");
const user_id_vo_1 = require("../value-objects/user-id.vo");
class Customer {
    constructor(_id, _tenantId, _userId, _firstName, _lastName, _email, _phone, _timezone, _preferences, _consentSigned, _createdAt, _updatedAt) {
        this._id = _id;
        this._tenantId = _tenantId;
        this._userId = _userId;
        this._firstName = _firstName;
        this._lastName = _lastName;
        this._email = _email;
        this._phone = _phone;
        this._timezone = _timezone;
        this._preferences = _preferences;
        this._consentSigned = _consentSigned;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
    }
    static create(props) {
        return new Customer(Customer.toCustomerId(props.id), Customer.toTenantId(props.tenantId), Customer.toUserId(props.userId), Customer.normalizeText(props.firstName), Customer.normalizeText(props.lastName), Customer.toEmail(props.email), Customer.normalizeText(props.phone), Customer.normalizeText(props.timezone), props.preferences ?? {}, props.consentSigned, props.createdAt ?? new Date(), props.updatedAt ?? new Date());
    }
    static reconstitute(props) {
        return new Customer(Customer.toCustomerId(props.id), Customer.toTenantId(props.tenantId), Customer.toUserId(props.userId), Customer.normalizeText(props.firstName), Customer.normalizeText(props.lastName), Customer.toEmail(props.email), Customer.normalizeText(props.phone), Customer.normalizeText(props.timezone), props.preferences ?? {}, props.consentSigned, props.createdAt, props.updatedAt);
    }
    get id() {
        return this._id;
    }
    get tenantId() {
        return this._tenantId;
    }
    get userId() {
        return this._userId;
    }
    get firstName() {
        return this._firstName;
    }
    get lastName() {
        return this._lastName;
    }
    get email() {
        return this._email;
    }
    get phone() {
        return this._phone;
    }
    get timezone() {
        return this._timezone;
    }
    get preferences() {
        return { ...this._preferences };
    }
    get consentSigned() {
        return this._consentSigned;
    }
    get createdAt() {
        return new Date(this._createdAt);
    }
    get updatedAt() {
        return new Date(this._updatedAt);
    }
    updateProfile(props) {
        if (props.firstName) {
            this._firstName = Customer.normalizeText(props.firstName);
        }
        if (props.lastName) {
            this._lastName = Customer.normalizeText(props.lastName);
        }
        if (props.email) {
            this._email = Customer.toEmail(props.email);
        }
        if (props.phone) {
            this._phone = Customer.normalizeText(props.phone);
        }
        if (props.timezone) {
            this._timezone = Customer.normalizeText(props.timezone);
        }
        if (props.preferences) {
            this._preferences = { ...props.preferences };
        }
        if (typeof props.consentSigned === 'boolean') {
            this._consentSigned = props.consentSigned;
        }
        this.touch();
    }
    touch(date = new Date()) {
        this._updatedAt = date;
    }
    toPrimitives() {
        return {
            id: this._id.value,
            tenantId: this._tenantId.value,
            userId: this._userId.value,
            firstName: this._firstName,
            lastName: this._lastName,
            email: this._email.value,
            phone: this._phone,
            timezone: this._timezone,
            preferences: { ...this._preferences },
            consentSigned: this._consentSigned,
            createdAt: new Date(this._createdAt),
            updatedAt: new Date(this._updatedAt),
        };
    }
    static toCustomerId(value) {
        if (!value) {
            throw new Error('Customer id is required');
        }
        return value instanceof customer_id_vo_1.CustomerId ? value : customer_id_vo_1.CustomerId.create(value);
    }
    static toTenantId(value) {
        return value instanceof tenant_id_vo_1.TenantId ? value : tenant_id_vo_1.TenantId.create(value);
    }
    static toUserId(value) {
        return value instanceof user_id_vo_1.UserId ? value : user_id_vo_1.UserId.create(value);
    }
    static toEmail(value) {
        return value instanceof email_vo_1.Email ? value : email_vo_1.Email.create(value);
    }
    static normalizeText(value) {
        const normalizedValue = value.trim().replace(/\s+/g, ' ');
        if (normalizedValue.length < 1 || normalizedValue.length > 255) {
            throw new Error('Customer field is invalid');
        }
        return normalizedValue;
    }
}
exports.Customer = Customer;
