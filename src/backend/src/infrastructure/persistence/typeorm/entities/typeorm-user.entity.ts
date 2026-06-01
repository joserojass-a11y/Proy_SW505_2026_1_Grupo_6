import { EntitySchema } from 'typeorm';

export interface TypeOrmUserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'CLIENT' | 'ADMIN' | 'OWNER';
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
}

export class TypeOrmUserEntity implements TypeOrmUserProps {
  id!: string;
  email!: string;
  passwordHash!: string;
  fullName!: string;
  role!: 'CLIENT' | 'ADMIN' | 'OWNER';
  status!: 'PENDING' | 'ACTIVE' | 'BLOCKED';
  createdAt!: Date;
  updatedAt!: Date;
}

export const TypeOrmUserEntitySchema = new EntitySchema<TypeOrmUserEntity>({
  target: TypeOrmUserEntity,
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
      name: 'id',
      default: () => 'gen_random_uuid()',
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
      name: 'email',
    },
    passwordHash: {
      type: 'varchar',
      length: 255,
      name: 'password_hash',
    },
    fullName: {
      type: 'varchar',
      length: 255,
      name: 'full_name',
    },
    role: {
      type: 'varchar',
      length: 20,
      default: 'CLIENT',
      name: 'role',
    },
    status: {
      type: 'varchar',
      length: 20,
      default: 'PENDING',
      name: 'status',
    },
    createdAt: {
      type: 'timestamptz',
      createDate: true,
      name: 'created_at',
      default: () => 'NOW()',
    },
    updatedAt: {
      type: 'timestamptz',
      updateDate: true,
      name: 'updated_at',
      default: () => 'NOW()',
    },
  },
});
