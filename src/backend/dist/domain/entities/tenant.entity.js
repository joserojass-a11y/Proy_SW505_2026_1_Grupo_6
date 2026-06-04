"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = void 0;
const tenant_id_vo_1 = require("../value-objects/tenant-id.vo");
const user_id_vo_1 = require("../value-objects/user-id.vo");
class Tenant {
    constructor(_id, _countryCode, _status, _subdomain, _name, _globalSettings, _ownerUserId, _createdAt, _updatedAt) {
        this._id = _id;
        this._countryCode = _countryCode;
        this._status = _status;
        this._subdomain = _subdomain;
        this._name = _name;
        this._globalSettings = _globalSettings;
        this._ownerUserId = _ownerUserId;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
    }
    static create(props) {
        return new Tenant(Tenant.toTenantId(props.id), Tenant.normalizeCountryCode(props.countryCode), props.status ?? 'ACTIVE', Tenant.normalizeSubdomain(props.subdomain), Tenant.normalizeName(props.name), props.globalSettings ?? {}, Tenant.toUserId(props.ownerUserId), props.createdAt ?? new Date(), props.updatedAt ?? new Date());
    }
    static reconstitute(props) {
        return new Tenant(Tenant.toTenantId(props.id), Tenant.normalizeCountryCode(props.countryCode), props.status, Tenant.normalizeSubdomain(props.subdomain), Tenant.normalizeName(props.name), props.globalSettings ?? {}, Tenant.toUserId(props.ownerUserId), props.createdAt, props.updatedAt);
    }
    get id() { return this._id; }
    get countryCode() { return this._countryCode; }
    get status() { return this._status; }
    get subdomain() { return this._subdomain; }
    get name() { return this._name; }
    get globalSettings() { return { ...this._globalSettings }; }
    get ownerUserId() { return this._ownerUserId; }
    get createdAt() { return new Date(this._createdAt); }
    get updatedAt() { return new Date(this._updatedAt); }
    suspend() { this._status = 'SUSPENDED'; this.touch(); }
    activate() { this._status = 'ACTIVE'; this.touch(); }
    markTrialExpired() { this._status = 'TRIAL_EXPIRED'; this.touch(); }
    touch(date = new Date()) { this._updatedAt = date; }
    toPrimitives() {
        return {
            id: this._id.value,
            countryCode: this._countryCode,
            status: this._status,
            subdomain: this._subdomain,
            name: this._name,
            globalSettings: { ...this._globalSettings },
            ownerUserId: this._ownerUserId.value,
            createdAt: new Date(this._createdAt),
            updatedAt: new Date(this._updatedAt),
        };
    }
    static toTenantId(value) {
        if (!value)
            throw new Error('Tenant id is required');
        return value instanceof tenant_id_vo_1.TenantId ? value : tenant_id_vo_1.TenantId.create(value);
    }
    static toUserId(value) {
        return value instanceof user_id_vo_1.UserId ? value : user_id_vo_1.UserId.create(value);
    }
    static normalizeCountryCode(value) {
        const normalizedValue = value.trim().toUpperCase();
        if (!/^[A-Z]{2}$/.test(normalizedValue))
            throw new Error('Invalid country code');
        return normalizedValue;
    }
    static normalizeSubdomain(value) {
        const normalizedValue = value.trim().toLowerCase();
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedValue))
            throw new Error('Invalid subdomain');
        return normalizedValue;
    }
    static normalizeName(value) {
        const normalizedValue = value.trim().replace(/\s+/g, ' ');
        if (normalizedValue.length < 2 || normalizedValue.length > 255)
            throw new Error('Tenant name is invalid');
        return normalizedValue;
    }
}
exports.Tenant = Tenant;
