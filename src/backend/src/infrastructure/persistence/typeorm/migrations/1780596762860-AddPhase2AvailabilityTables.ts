import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhase2AvailabilityTables1780596762860 implements MigrationInterface {
    name = 'AddPhase2AvailabilityTables1780596762860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "global_settings" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "preferences" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "global_settings" SET DEFAULT '{}'`);
    }

}
