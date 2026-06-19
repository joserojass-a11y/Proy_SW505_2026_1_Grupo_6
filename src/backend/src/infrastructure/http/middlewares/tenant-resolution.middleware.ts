import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { TypeOrmTenantEntity } from '../../persistence/typeorm/entities/typeorm-tenant.entity';
import { INFRASTRUCTURE_TOKENS } from '../../shared/infrastructure.tokens';

type TenantAwareRequest = Request & {
  tenant?: {
    id: string;
    status: string;
    subdomain: string;
    name: string;
  };
};

function extractSubdomain(hostname: string): string | null {
  const normalizedHost = hostname.split(':')[0].toLowerCase();
  const parts = normalizedHost.split('.');

  if (parts.length < 3) {
    return null;
  }

  return parts[0];
}

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(@Inject(INFRASTRUCTURE_TOKENS.DATA_SOURCE) private readonly dataSource: DataSource) {}

  async use(request: TenantAwareRequest, _response: Response, next: NextFunction): Promise<void> {
    const subdomain = extractSubdomain(request.hostname);

    if (!subdomain || subdomain === 'www' || subdomain === 'api') {
      next();
      return;
    }

    const tenantRepository = this.dataSource.getRepository(TypeOrmTenantEntity);
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
}
