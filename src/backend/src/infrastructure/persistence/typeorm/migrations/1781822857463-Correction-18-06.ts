import { MigrationInterface, QueryRunner } from "typeorm";

export class Correction18061781822857463 implements MigrationInterface {
    name = 'Correction1806.ts1781822857463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "schedule_slots" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "resource_id" uuid NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'AVAILABLE', "booking_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_11236e5138891d4dd3cc8a8b564" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_schedule_slot_resource_time" ON "schedule_slots" ("resource_id", "starts_at", "ends_at") `);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "global_settings" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "preferences" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "global_settings" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."idx_schedule_slot_resource_time"`);
        await queryRunner.query(`DROP TABLE "schedule_slots"`);
    }

}
