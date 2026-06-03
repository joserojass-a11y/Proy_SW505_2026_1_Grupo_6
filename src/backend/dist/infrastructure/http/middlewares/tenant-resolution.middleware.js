"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantResolutionMiddleware = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_tenant_entity_1 = require("../../persistence/typeorm/entities/typeorm-tenant.entity");
function extractSubdomain(hostname) {
    const normalizedHost = hostname.split(':')[0].toLowerCase();
    const parts = normalizedHost.split('.');
    if (parts.length < 3) {
        return null;
    }
    return parts[0];
}
let TenantResolutionMiddleware = class TenantResolutionMiddleware {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async use(request, _response, next) {
        const subdomain = extractSubdomain(request.hostname);
        if (!subdomain || subdomain === 'www' || subdomain === 'api') {
            next();
            return;
        }
        const tenantRepository = this.dataSource.getRepository(typeorm_tenant_entity_1.TypeOrmTenantEntity);
        const tenant = await tenantRepository.findOne({ where: { subdomain } });
        if (tenant) {
            request.tenant = {
                id: tenant.id,
                status: tenant.status,
                subdomain: tenant.subdomain,
                name: tenant.name,
            };
        }
        next();
    }
};
exports.TenantResolutionMiddleware = TenantResolutionMiddleware;
exports.TenantResolutionMiddleware = TenantResolutionMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TenantResolutionMiddleware);
