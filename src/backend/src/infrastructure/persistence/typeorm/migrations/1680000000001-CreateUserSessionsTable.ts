import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSessionsTable1680000000001 implements MigrationInterface {
  name = 'CreateUserSessionsTable1680000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "refresh_token_hash" character varying(255) NOT NULL,
        "ip_address" character varying(45),
        "user_agent" character varying(500),
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_user_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_user_sessions_user_id" ON "user_sessions" ("user_id")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expires_at" ON "user_sessions" ("expires_at")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_user_sessions_expires_at"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_user_sessions_user_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "user_sessions"');
  }
}
