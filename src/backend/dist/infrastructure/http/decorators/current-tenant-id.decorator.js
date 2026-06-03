"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentTenantId = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentTenantId = (0, common_1.createParamDecorator)((_, context) => {
    const request = context.switchToHttp().getRequest();
    return request.tenant?.id;
});
