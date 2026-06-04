import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1780295142162 implements MigrationInterface {
    name = 'InitialSchema1780295142162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "full_name" character varying(255) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'CLIENT', "status" character varying(20) NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "country_code" character varying(2) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'ACTIVE', "subdomain" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "global_settings" jsonb NOT NULL DEFAULT '{}'::jsonb, "owner_user_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_21bb89e012fa5b58532009c1601" UNIQUE ("subdomain"), CONSTRAINT "UQ_9b0b65d017f95fd4e7e3576bad4" UNIQUE ("owner_user_id"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenant_billing_profiles" ("tenant_id" uuid NOT NULL, "plan_tier" character varying(20) NOT NULL DEFAULT 'BASIC', "max_branches" integer NOT NULL DEFAULT '1', "max_resources" integer NOT NULL DEFAULT '10', CONSTRAINT "PK_830e6c7c2da88b9f40a9379be52" PRIMARY KEY ("tenant_id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "tenant_id" uuid NOT NULL, "user_id" uuid NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(50) NOT NULL, "timezone" character varying(100) NOT NULL, "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb, "consent_signed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_11d81cd7be87b6f8865b0cf7661" UNIQUE ("user_id"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "tenant_billing_profiles"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
