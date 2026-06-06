import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * FASE 4: Migración de Tablas de Notificaciones
 * 
 * Crea la infraestructura de base de datos para el Dominio 6 (Comunicación):
 * - Canales de notificación (email, SMS, push)
 * - Plantillas parametrizables por evento y rol
 * - Tópicos de notificación (categorías: confirmación, recordatorio, cancelación, etc.)
 * - Cola de eventos para envíos asíncrónos con reintentos
 * - Preferencias de usuarios (opt-in/opt-out por tópico y canal)
 * 
 * Principios de Diseño:
 * - Multi-tenant: Cada tabla tiene tenant_id para aislamiento
 * - Auditoría: Todos los eventos incluyen timestamps
 * - Tolerancia a Fallos: Status de eventos permite reintentos
 * - Extensibilidad: JSONB para metadatos futuros
 */
export class AddPhase4NotificationTables1780897123456 implements MigrationInterface {
    name = 'AddPhase4NotificationTables1780897123456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================================================
        // Tabla 1: NOTIFICATION_CHANNELS
        // Catálogo maestro de conductos de entrega (email, SMS, push, etc.)
        // ============================================================================
        await queryRunner.query(`
            CREATE TABLE "notification_channels" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "tenant_id" uuid,
                "code" character varying(50) NOT NULL,
                "name" character varying(100) NOT NULL,
                "description" character varying(500),
                "is_active" boolean NOT NULL DEFAULT true,
                "config" jsonb NOT NULL DEFAULT '{}'::jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                
                CONSTRAINT "PK_notification_channels_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_notification_channels_code" UNIQUE ("code"),
                CONSTRAINT "UQ_notification_channels_code_tenant" UNIQUE ("code", "tenant_id"),
                CONSTRAINT "FK_notification_channels_tenant_id" 
                    FOREIGN KEY ("tenant_id") 
                    REFERENCES "tenants"("id") 
                    ON DELETE CASCADE
            )
        `);
        
        // Índices para búsquedas rápidas de canales activos por tenant
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_channels_tenant_active" 
            ON "notification_channels" ("tenant_id", "is_active")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_channels_code" 
            ON "notification_channels" ("code")
        `);

        // ============================================================================
        // Tabla 2: NOTIFICATION_TOPICS
        // Categorías de notificaciones (confirmación, recordatorio, cancelación, etc.)
        // ============================================================================
        await queryRunner.query(`
            CREATE TABLE "notification_topics" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "tenant_id" uuid,
                "code" character varying(100) NOT NULL,
                "name" character varying(150) NOT NULL,
                "description" character varying(500),
                "is_mandatory" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                
                CONSTRAINT "PK_notification_topics_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_notification_topics_code_tenant" UNIQUE ("code", "tenant_id"),
                CONSTRAINT "FK_notification_topics_tenant_id" 
                    FOREIGN KEY ("tenant_id") 
                    REFERENCES "tenants"("id") 
                    ON DELETE CASCADE
            )
        `);
        
        // Índices para búsquedas de tópicos y validaciones de mandatorios
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_topics_tenant_active" 
            ON "notification_topics" ("tenant_id", "is_active")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_topics_mandatory" 
            ON "notification_topics" ("is_mandatory")
        `);

        // ============================================================================
        // Tabla 3: NOTIFICATION_TEMPLATES
        // Plantillas parametrizables de mensajes por evento, rol y tenant
        // ============================================================================
        await queryRunner.query(`
            CREATE TABLE "notification_templates" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "tenant_id" uuid NOT NULL,
                "trigger_event" character varying(100) NOT NULL,
                "recipient_role" character varying(20) NOT NULL,
                "channel_code" character varying(50) NOT NULL,
                "subject" character varying(255),
                "content_template" text NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                
                CONSTRAINT "PK_notification_templates_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_notification_templates_tenant_id" 
                    FOREIGN KEY ("tenant_id") 
                    REFERENCES "tenants"("id") 
                    ON DELETE CASCADE,
                CONSTRAINT "FK_notification_templates_channel_code" 
                    FOREIGN KEY ("channel_code") 
                    REFERENCES "notification_channels"("code"),
                CONSTRAINT "CK_notification_templates_recipient_role" 
                    CHECK (recipient_role IN ('customer', 'admin', 'staff')),
                CONSTRAINT "CK_notification_templates_trigger_event" 
                    CHECK (trigger_event IN ('booking.confirmed', 'booking.cancelled', 'booking.rescheduled', 'reminder.24h', 'reminder.1h'))
            )
        `);
        
        // Índices para búsquedas de templates por evento y tenant
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_templates_tenant_event" 
            ON "notification_templates" ("tenant_id", "trigger_event", "is_active")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_templates_recipient_role" 
            ON "notification_templates" ("recipient_role")
        `);

        // ============================================================================
        // Tabla 4: NOTIFICATION_EVENTS (Cola de Envíos)
        // Entidad transaccional: cada fila es un trabajo de envío con estado y reintentos
        // ============================================================================
        await queryRunner.query(`
            CREATE TABLE "notification_events" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "tenant_id" uuid NOT NULL,
                "booking_id" uuid,
                "template_id" uuid NOT NULL,
                "channel_code" character varying(50) NOT NULL,
                "recipient_type" character varying(20) NOT NULL,
                "recipient_id" uuid NOT NULL,
                "contact_point" character varying(255) NOT NULL,
                "subject" character varying(255),
                "rendered_content" text NOT NULL,
                "status" character varying(20) NOT NULL DEFAULT 'pending',
                "retry_count" integer NOT NULL DEFAULT 0,
                "max_retries" integer NOT NULL DEFAULT 3,
                "last_error" text,
                "scheduled_for" TIMESTAMP WITH TIME ZONE NOT NULL,
                "sent_at" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                
                CONSTRAINT "PK_notification_events_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_notification_events_tenant_id" 
                    FOREIGN KEY ("tenant_id") 
                    REFERENCES "tenants"("id") 
                    ON DELETE CASCADE,
                CONSTRAINT "FK_notification_events_template_id" 
                    FOREIGN KEY ("template_id") 
                    REFERENCES "notification_templates"("id"),
                CONSTRAINT "CK_notification_events_status" 
                    CHECK (status IN ('pending', 'sent', 'failed')),
                CONSTRAINT "CK_notification_events_recipient_type" 
                    CHECK (recipient_type IN ('customer', 'user'))
            )
        `);
        
        // Índices críticos para procesamiento de cola y auditoría
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_events_status_scheduled" 
            ON "notification_events" ("status", "scheduled_for")
            WHERE status = 'pending'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_events_tenant_created" 
            ON "notification_events" ("tenant_id", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_events_booking_id" 
            ON "notification_events" ("booking_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_notification_events_recipient" 
            ON "notification_events" ("recipient_type", "recipient_id")
        `);

        // ============================================================================
        // Tabla 5: CUSTOMER_NOTIFICATION_PREFERENCES
        // Preferencias de opt-in/opt-out de clientes por tópico y canal
        // ============================================================================
        await queryRunner.query(`
            CREATE TABLE "customer_notification_preferences" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "customer_id" uuid NOT NULL,
                "topic_id" uuid NOT NULL,
                "channel_id" uuid NOT NULL,
                "is_enabled" boolean NOT NULL DEFAULT true,
                "frequency" character varying(50) DEFAULT 'immediately',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                
                CONSTRAINT "PK_customer_notification_preferences_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_customer_notification_preferences" UNIQUE ("customer_id", "topic_id", "channel_id"),
                CONSTRAINT "FK_customer_notification_preferences_customer" 
                    FOREIGN KEY ("customer_id") 
                    REFERENCES "customers"("id") 
                    ON DELETE CASCADE,
                CONSTRAINT "FK_customer_notification_preferences_topic" 
                    FOREIGN KEY ("topic_id") 
                    REFERENCES "notification_topics"("id"),
                CONSTRAINT "FK_customer_notification_preferences_channel" 
                    FOREIGN KEY ("channel_id") 
                    REFERENCES "notification_channels"("id")
            )
        `);
        
        // Índices para búsquedas rápidas de preferencias
        await queryRunner.query(`
            CREATE INDEX "IDX_customer_notification_preferences_customer" 
            ON "customer_notification_preferences" ("customer_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_customer_notification_preferences_enabled" 
            ON "customer_notification_preferences" ("customer_id", "is_enabled")
        `);

        // ============================================================================
        // Insertar Canales y Tópicos Base (Data Seed)
        // ============================================================================
        
        // Canal: Email (global, sin tenant)
        await queryRunner.query(`
            INSERT INTO "notification_channels" ("code", "name", "description", "is_active", "tenant_id")
            VALUES ('email', 'Correo Electrónico', 'Envíos de notificaciones por correo SMTP', true, NULL)
            ON CONFLICT DO NOTHING
        `);
        
        // Tópicos base: Confirmación, Cancelación, Reprogramación, Recordatorios
        await queryRunner.query(`
            INSERT INTO "notification_topics" ("code", "name", "description", "is_mandatory", "tenant_id")
            VALUES 
                ('booking_confirmed', 'Confirmación de Reserva', 'Notificación cuando una cita es confirmada', true, NULL),
                ('booking_cancelled', 'Cancelación de Reserva', 'Notificación cuando una cita es cancelada', true, NULL),
                ('booking_rescheduled', 'Reprogramación de Reserva', 'Notificación cuando una cita es reprogramada', true, NULL),
                ('reminder_24h', 'Recordatorio 24 horas', 'Recordatorio de cita 24 horas antes', false, NULL),
                ('reminder_1h', 'Recordatorio 1 hora', 'Recordatorio de cita 1 hora antes', false, NULL)
            ON CONFLICT DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Descartar tablas en orden inverso (respetando dependencias)
        await queryRunner.query(`DROP TABLE IF EXISTS "customer_notification_preferences"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_events"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_templates"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_topics"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_channels"`);
    }
}
