import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhase3BookingTables1780596762861 implements MigrationInterface {
  name = 'AddPhase3BookingTables1780596762861';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "customer_id" uuid NOT NULL,
        "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "customer_timezone" character varying(100) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'PENDING',
        "source_channel" character varying(50) NOT NULL,
        "notes" text,
        "custom_data" jsonb,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bookings_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_user" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT
      )
    `);

    // Create indices for bookings
    await queryRunner.query('CREATE INDEX "idx_booking_service_id" ON "bookings" ("service_id")');
    await queryRunner.query('CREATE INDEX "idx_booking_customer_id" ON "bookings" ("customer_id")');
    await queryRunner.query('CREATE INDEX "idx_booking_tenant_id" ON "bookings" ("tenant_id")');
    await queryRunner.query('CREATE INDEX "idx_booking_status" ON "bookings" ("status")');
    await queryRunner.query('CREATE INDEX "idx_booking_starts_at_ends_at" ON "bookings" ("starts_at", "ends_at")');
    await queryRunner.query('CREATE INDEX "idx_booking_service_starts_ends" ON "bookings" ("service_id", "starts_at", "ends_at")');

    // 2. Create booking_cancellations table
    await queryRunner.query(`
      CREATE TABLE "booking_cancellations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "reason_code" character varying(50) NOT NULL,
        "description" text,
        "cancelled_by_user_id" uuid NOT NULL,
        "cancelled_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_booking_cancellations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_cancellations_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_cancellations_user" FOREIGN KEY ("cancelled_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query('CREATE INDEX "idx_booking_cancellation_booking_id" ON "booking_cancellations" ("booking_id")');

    // 3. Create booking_reschedules table
    await queryRunner.query(`
      CREATE TABLE "booking_reschedules" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "original_starts_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "original_ends_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "new_starts_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "new_ends_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "reason" text,
        "rescheduled_by_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_booking_reschedules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_reschedules_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_reschedules_user" FOREIGN KEY ("rescheduled_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query('CREATE INDEX "idx_booking_reschedule_booking_id" ON "booking_reschedules" ("booking_id")');

    // 4. Create booking_status_history table
    await queryRunner.query(`
      CREATE TABLE "booking_status_history" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "previous_status" character varying(20) NOT NULL,
        "new_status" character varying(20) NOT NULL,
        "reason" text,
        "changed_by_user_id" uuid NOT NULL,
        "changed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_booking_status_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_status_history_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_status_history_user" FOREIGN KEY ("changed_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query('CREATE INDEX "idx_booking_status_history_booking_id" ON "booking_status_history" ("booking_id")');

    // 5. Create agenda_daily_snapshots table
    await queryRunner.query(`
      CREATE TABLE "agenda_daily_snapshots" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "resource_id" uuid NOT NULL,
        "date" date NOT NULL,
        "timeline" jsonb NOT NULL,
        "last_calculated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_agenda_daily_snapshots" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_agenda_resource_date" UNIQUE ("resource_id", "date")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "agenda_daily_snapshots"');
    await queryRunner.query('DROP TABLE "booking_status_history"');
    await queryRunner.query('DROP TABLE "booking_reschedules"');
    await queryRunner.query('DROP TABLE "booking_cancellations"');
    await queryRunner.query('DROP TABLE "bookings"');
  }
}
