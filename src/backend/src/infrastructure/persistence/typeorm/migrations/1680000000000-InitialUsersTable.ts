import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsersTableMigration1680000000000 implements MigrationInterface {
  name = 'InitialUsersTableMigration1680000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "full_name" character varying(255) NOT NULL,
        "role" character varying(20) NOT NULL DEFAULT 'CLIENT',
        "status" character varying(20) NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_email"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}
