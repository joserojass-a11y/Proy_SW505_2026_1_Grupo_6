import { Service } from '../entities/service.entity';
import { ServiceId } from '../value-objects/service-id.vo';
import { TenantId } from '../value-objects/tenant-id.vo';

export interface IServiceRepository {
  findById(id: ServiceId): Promise<Service | null>;
  findByTenantId(tenantId: TenantId): Promise<Service[]>;
  save(service: Service): Promise<Service>;
  update(service: Service): Promise<Service>;
  deleteById(id: ServiceId): Promise<void>;
}
