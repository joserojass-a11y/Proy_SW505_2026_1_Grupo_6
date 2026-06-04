import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantNotFoundException } from '../../domain/exceptions/tenant-not-found.exception';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { GetTenantQuery } from './get-tenant.query';
import { TenantResponseDto } from '../commands/create-tenant.command-handler';

export class GetTenantQueryHandler {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(query: GetTenantQuery): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(TenantId.create(query.tenantId));

    if (!tenant) {
      throw new TenantNotFoundException(query.tenantId);
    }

    const primitives = tenant.toPrimitives();

    return {
      id: primitives.id,
      ownerUserId: primitives.ownerUserId,
      countryCode: primitives.countryCode,
      status: primitives.status,
      subdomain: primitives.subdomain,
      name: primitives.name,
      globalSettings: primitives.globalSettings,
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    };
  }
}
