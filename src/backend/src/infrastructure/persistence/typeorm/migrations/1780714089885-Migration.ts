import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780714089885 implements MigrationInterface {
    name = 'Migration1780714089885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE IF EXISTS "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_tenant"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_customer"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_user"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "booking_status_history" DROP CONSTRAINT IF EXISTS "FK_booking_status_history_booking"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "booking_status_history" DROP CONSTRAINT IF EXISTS "FK_booking_status_history_user"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "booking_cancellations" DROP CONSTRAINT IF EXISTS "FK_booking_cancellations_booking"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "booking_cancellations" DROP CONSTRAINT IF EXISTS "FK_booking_cancellations_user"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "booking_reschedules" DROP CONSTRAINT IF EXISTS "FK_booking_reschedules_booking"`);
        await queryRunner.query(`ALTER TABLE IF EXISTS "booking_reschedules" DROP CONSTRAINT IF EXISTS "FK_booking_reschedules_user"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_booking_service_starts_ends"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_notification_events_status_scheduled"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_notification_events_tenant_created"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_notification_events_booking_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_notification_events_recipient"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_customer_notification_preferences_customer"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_customer_notification_preferences_enabled"`);

        if (await queryRunner.hasTable("notification_events")) {
            await queryRunner.query(`ALTER TABLE "notification_events" DROP CONSTRAINT IF EXISTS "FK_notification_events_tenant_id"`);
            await queryRunner.query(`ALTER TABLE "notification_events" DROP CONSTRAINT IF EXISTS "FK_notification_events_template_id"`);
            await queryRunner.query(`ALTER TABLE "notification_events" DROP CONSTRAINT IF EXISTS "CK_notification_events_status"`);
            await queryRunner.query(`ALTER TABLE "notification_events" DROP CONSTRAINT IF EXISTS "CK_notification_events_recipient_type"`);
        }

        if (await queryRunner.hasTable("customer_notification_preferences")) {
            await queryRunner.query(`ALTER TABLE "customer_notification_preferences" DROP CONSTRAINT IF EXISTS "FK_customer_notification_preferences_customer"`);
            await queryRunner.query(`ALTER TABLE "customer_notification_preferences" DROP CONSTRAINT IF EXISTS "FK_customer_notification_preferences_topic"`);
            await queryRunner.query(`ALTER TABLE "customer_notification_preferences" DROP CONSTRAINT IF EXISTS "FK_customer_notification_preferences_channel"`);
            await queryRunner.query(`ALTER TABLE "customer_notification_preferences" DROP CONSTRAINT IF EXISTS "UQ_customer_notification_preferences"`);
        }

        await queryRunner.query(`ALTER TABLE "tenants" ADD "zone_id" uuid`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "zone_id" uuid`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "resource_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "global_settings" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "preferences" SET DEFAULT '{}'::jsonb`);

        if (await queryRunner.hasTable("customer_notification_preferences")) {
            await queryRunner.query(`ALTER TABLE "customer_notification_preferences" ALTER COLUMN "frequency" SET NOT NULL`);
        }

        await queryRunner.query(`CREATE INDEX "idx_booking_resource_id" ON "bookings" ("resource_id") `);
        await queryRunner.query(`CREATE INDEX "idx_booking_resource_starts_ends" ON "bookings" ("resource_id", "starts_at", "ends_at") `);

        if (await queryRunner.hasTable("customer_notification_preferences")) {
            await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_customer_notification_preferences" ON "customer_notification_preferences" ("customer_id", "topic_id", "channel_id") `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_customer_notification_preferences"`);
        await queryRunner.query(`DROP INDEX "public"."idx_booking_resource_starts_ends"`);
        await queryRunner.query(`DROP INDEX "public"."idx_booking_resource_id"`);
        await queryRunner.query(`ALTER TABLE "customer_notification_preferences" ALTER COLUMN "frequency" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "global_settings" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "resource_id"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "zone_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "zone_id"`);
        await queryRunner.query(`ALTER TABLE "customer_notification_preferences" ADD CONSTRAINT "UQ_customer_notification_preferences" UNIQUE ("channel_id", "customer_id", "topic_id")`);
        await queryRunner.query(`ALTER TABLE "notification_events" ADD CONSTRAINT "CK_notification_events_recipient_type" CHECK (((recipient_type)::text = ANY ((ARRAY['customer'::character varying, 'user'::character varying])::text[])))`);
        await queryRunner.query(`ALTER TABLE "notification_events" ADD CONSTRAINT "CK_notification_events_status" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying])::text[])))`);
        await queryRunner.query(`CREATE INDEX "IDX_customer_notification_preferences_enabled" ON "customer_notification_preferences" ("customer_id", "is_enabled") `);
        await queryRunner.query(`CREATE INDEX "IDX_customer_notification_preferences_customer" ON "customer_notification_preferences" ("customer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_events_recipient" ON "notification_events" ("recipient_id", "recipient_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_events_booking_id" ON "notification_events" ("booking_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_events_tenant_created" ON "notification_events" ("created_at", "tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_events_status_scheduled" ON "notification_events" ("scheduled_for", "status") WHERE ((status)::text = 'pending'::text)`);
        await queryRunner.query(`CREATE INDEX "idx_booking_service_starts_ends" ON "bookings" ("ends_at", "service_id", "starts_at") `);
        await queryRunner.query(`ALTER TABLE "customer_notification_preferences" ADD CONSTRAINT "FK_customer_notification_preferences_channel" FOREIGN KEY ("channel_id") REFERENCES "notification_channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_notification_preferences" ADD CONSTRAINT "FK_customer_notification_preferences_topic" FOREIGN KEY ("topic_id") REFERENCES "notification_topics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_notification_preferences" ADD CONSTRAINT "FK_customer_notification_preferences_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_events" ADD CONSTRAINT "FK_notification_events_template_id" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_events" ADD CONSTRAINT "FK_notification_events_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_reschedules" ADD CONSTRAINT "FK_booking_reschedules_user" FOREIGN KEY ("rescheduled_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_reschedules" ADD CONSTRAINT "FK_booking_reschedules_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_cancellations" ADD CONSTRAINT "FK_booking_cancellations_user" FOREIGN KEY ("cancelled_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_cancellations" ADD CONSTRAINT "FK_booking_cancellations_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_status_history" ADD CONSTRAINT "FK_booking_status_history_user" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_status_history" ADD CONSTRAINT "FK_booking_status_history_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_user" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
