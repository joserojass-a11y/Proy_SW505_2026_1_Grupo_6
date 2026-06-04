import { randomUUID } from 'crypto';
import { Service } from '../../domain/entities/service.entity';
import { IServiceRepository } from '../../domain/repositories/service.repository';
import { ServiceId } from '../../domain/value-objects/service-id.vo';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { CategoryId } from '../../domain/value-objects/category-id.vo';
import { CreateServiceCommand } from './create-service.command';

export interface CreateServiceResponseDto {
  id: string;
}

export class CreateServiceCommandHandler {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(command: CreateServiceCommand): Promise<CreateServiceResponseDto> {
    const service = Service.create({
      id: ServiceId.create(randomUUID()),
      tenantId: TenantId.create(command.tenantId),
      categoryId: CategoryId.create(command.categoryId),
      name: command.name,
      baseDurationMinutes: command.baseDurationMinutes,
      basePrice: command.basePrice,
      customAttributes: command.customAttributes,
      isActive: command.isActive,
    });

    const savedService = await this.serviceRepository.save(service);
    return {
      id: savedService.id.value,
    };
  }
}
