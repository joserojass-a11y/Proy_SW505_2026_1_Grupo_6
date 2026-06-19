import { DataSource } from 'typeorm';
import { IZoneRepository } from '../../../domain/repositories/zone.repository';
import { Zone } from '../../../domain/entities/zone.entity';
import { ZoneId } from '../../../domain/value-objects/zone-id.vo';
import { TypeOrmZoneEntity } from './entities/typeorm-zone.entity';

export class TypeOrmZoneRepository implements IZoneRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TypeOrmZoneEntity);
  }

  async findById(id: ZoneId): Promise<Zone | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Zone | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Zone[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  async save(zone: Zone): Promise<Zone> {
    const persisted = await this.repository.save(this.toPersistence(zone));
    return this.toDomain(persisted);
  }

  private toDomain(entity: TypeOrmZoneEntity): Zone {
    return Zone.reconstitute({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toPersistence(zone: Zone): TypeOrmZoneEntity {
    const primitives = zone.toPrimitives();
    const entity = new TypeOrmZoneEntity();
    entity.id = primitives.id;
    entity.name = primitives.name;
    entity.code = primitives.code;
    entity.createdAt = primitives.createdAt;
    entity.updatedAt = primitives.updatedAt;
    return entity;
  }
}
