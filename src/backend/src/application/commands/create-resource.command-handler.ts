import { randomUUID } from 'crypto';
import { Resource } from '../../domain/entities/resource.entity';
import { IResourceRepository } from '../../domain/repositories/resource.repository';
import { ResourceId } from '../../domain/value-objects/resource-id.vo';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { BranchId } from '../../domain/value-objects/branch-id.vo';
import { ResourceTypeId } from '../../domain/value-objects/resource-type-id.vo';
import { CreateResourceCommand } from './create-resource.command';

export interface CreateResourceResponseDto {
  id: string;
}

export class CreateResourceCommandHandler {
  constructor(private readonly resourceRepository: IResourceRepository) {}

  async execute(command: CreateResourceCommand): Promise<CreateResourceResponseDto> {
    const resource = Resource.create({
      id: ResourceId.create(randomUUID()),
      tenantId: TenantId.create(command.tenantId),
      branchId: BranchId.create(command.branchId),
      typeId: ResourceTypeId.create(command.typeId),
      name: command.name,
      capacity: command.capacity,
    });

    const savedResource = await this.resourceRepository.save(resource);
    return {
      id: savedResource.id.value,
    };
  }
}
