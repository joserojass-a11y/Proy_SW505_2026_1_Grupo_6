import { EntitySchema } from 'typeorm';

export interface TypeOrmZoneProps {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TypeOrmZoneEntity implements TypeOrmZoneProps {
  id!: string;
  name!: string;
  code!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export const TypeOrmZoneEntitySchema = new EntitySchema<TypeOrmZoneEntity>({
  target: TypeOrmZoneEntity,
  name: 'Zone',
  tableName: 'zones',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid', name: 'id', default: () => 'gen_random_uuid()' },
    name: { type: 'varchar', length: 255, name: 'name' },
    code: { type: 'varchar', length: 10, unique: true, name: 'code' },
    createdAt: { type: 'timestamptz', createDate: true, name: 'created_at', default: () => 'NOW()' },
    updatedAt: { type: 'timestamptz', updateDate: true, name: 'updated_at', default: () => 'NOW()' },
  },
});
