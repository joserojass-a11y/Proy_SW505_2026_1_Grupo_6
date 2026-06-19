import { randomUUID } from 'crypto';
import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantBillingProfile } from '../../domain/entities/tenant-billing-profile.entity';
import { TenantAlreadyExistsException } from '../../domain/exceptions/tenant-already-exists.exception';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantBillingProfileRepository } from '../../domain/repositories/tenant-billing-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { TenantNotFoundException } from '../../domain/exceptions/tenant-not-found.exception';
import { CreateTenantCommand } from './create-tenant.command';

export interface TenantResponseDto {
  id: string;
  ownerUserId: string;
  countryCode: string;
  status: string;
  subdomain: string;
  name: string;
  globalSettings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class CreateTenantCommandHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly tenantBillingProfileRepository: TenantBillingProfileRepository,
  ) { }

  async execute(command: CreateTenantCommand): Promise<TenantResponseDto> {
    const ownerUserId = UserId.create(command.ownerUserId);
    const ownerUser = await this.userRepository.findById(ownerUserId);

    if (!ownerUser) {
      throw new TenantNotFoundException(command.ownerUserId);
    }

    if (!ownerUser.role.isOwner()) {
      throw new TenantNotFoundException(`OWNER:${command.ownerUserId}`);
    }

    const existingTenant = await this.tenantRepository.findByOwnerUserId(ownerUserId.value);
    if (existingTenant) {
      throw new TenantAlreadyExistsException(ownerUserId.value);
    }

    const tenant = Tenant.create({
      id: TenantId.create(randomUUID()),
      zoneId: command.zoneId,
      ownerUserId,
      countryCode: command.countryCode,
      subdomain: command.subdomain,
      name: command.name,
      globalSettings: command.globalSettings,
    });

    const savedTenant = await this.tenantRepository.save(tenant);
    await this.tenantBillingProfileRepository.save(TenantBillingProfile.create({ tenantId: savedTenant.id }));
    return this.toDto(savedTenant);
  }

  private toDto(tenant: Tenant): TenantResponseDto {
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
