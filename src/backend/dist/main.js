"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const infrastructure_tokens_1 = require("./infrastructure/shared/infrastructure.tokens");
const tenant_resolution_middleware_1 = require("./infrastructure/http/middlewares/tenant-resolution.middleware");
const backendEnvPath = (0, path_1.resolve)(process.cwd(), '.env');
const workspaceEnvPath = (0, path_1.resolve)(process.cwd(), '..', '..', '.env');
if ((0, fs_1.existsSync)(backendEnvPath)) {
    (0, dotenv_1.config)({ path: backendEnvPath });
}
else if ((0, fs_1.existsSync)(workspaceEnvPath)) {
    (0, dotenv_1.config)({ path: workspaceEnvPath });
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
    });
    const dataSource = app.get(infrastructure_tokens_1.INFRASTRUCTURE_TOKENS.DATA_SOURCE);
    const tenantResolutionMiddleware = new tenant_resolution_middleware_1.TenantResolutionMiddleware(dataSource);
    app.use(tenantResolutionMiddleware.use.bind(tenantResolutionMiddleware));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    // eslint-disable-next-line no-console
    console.log(`API operando en el puerto ${port}`);
}
void bootstrap();
