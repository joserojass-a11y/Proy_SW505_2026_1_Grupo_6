# Diccionario de Datos: Modelado Físico Relacional

Este documento define el esquema físico de la base de datos. Se ha optimizado utilizando estándares robustos (compatibles con motores como PostgreSQL), aprovechando tipos de datos nativos como UUID, JSONB y TIMESTAMPTZ, incluyendo la integridad referencial y disparadores (Triggers) para automatizar reglas de negocio.

Asimismo, se los clasificó de tres formas según su funcionalidad:

- **Catálogos:** Estas entidades no generan operaciones por sí solas. Su propósito ontológico es tipificar, estandarizar, brindar opciones predefinidas o establecer reglas lógicas para construir y gobernar a los Entes. Tienen baja frecuencia de actualización.
- **Entes Maestros:** Son los sujetos y objetos principales del ecosistema. Existen por sí mismos, son la columna vertebral del negocio y son el objetivo central al que apuntan las llaves foráneas.
- **Entes Transaccionales:** Son la manifestación dinámica del sistema. Nacen de la interacción entre los Entes Maestros, utilizando las reglas dictadas por los Catálogos. Son tablas de alto volumen y escritura constante.

## Dominio 1: Organización y Seguridad

### Ente Maestro: tenants (Empresas/Cuentas cliente)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL, DEFAULT gen_random_uuid() | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(150) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| global_settings | JSONB | \-  | DEFAULT '{}'::jsonb | \-  |
| --- | --- | --- | --- | --- |
| created_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

### Ente Maestro: branches (Sucursales/Sedes)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(150) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| timezone | VARCHAR(50) | \-  | NOT NULL, DEFAULT 'America/Lima' | \-  |
| --- | --- | --- | --- | --- |
| address | VARCHAR(255) | \-  | \-  | \-  |
| --- | --- | --- | --- | --- |
| is_active | BOOLEAN | \-  | NOT NULL, DEFAULT true | tg_cascade_branch_deactivation (Si false, suspende recursos asociados) |
| --- | --- | --- | --- | --- |

### Catálogo: branch_operating_hours (Marco de apertura y cierre)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| branch_id | UUID | FK, IDX | NOT NULL, REFERENCES branches(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| day_of_week | SMALLINT | \-  | NOT NULL, CHECK (day_of_week BETWEEN 1 AND 7) | \-  |
| --- | --- | --- | --- | --- |
| open_time | TIME | \-  | \-  | \-  |
| --- | --- | --- | --- | --- |
| close_time | TIME | \-  | \-  | CHECK (close_time > open_time OR is_closed = true) |
| --- | --- | --- | --- | --- |
| is_closed | BOOLEAN | \-  | NOT NULL, DEFAULT false | tg_invalidate_daily_snapshots (Altera caché de agendas) |
| --- | --- | --- | --- | --- |

### Catálogo: branch_exceptions (Feriados o cierres excepcionales)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| branch_id | UUID | FK, IDX | NOT NULL, REFERENCES branches(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| start_datetime | TIMESTAMPTZ | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| end_datetime | TIMESTAMPTZ | \-  | NOT NULL, CHECK (end_datetime > start_datetime) | tg_cancel_conflicting_bookings (Cancela/alerta citas que caigan en este rango) |
| --- | --- | --- | --- | --- |
| reason | VARCHAR(255) | \-  | \-  | \-  |
| --- | --- | --- | --- | --- |
| is_full_day | BOOLEAN | \-  | NOT NULL, DEFAULT false | \-  |
| --- | --- | --- | --- | --- |
| created_by_user_id | UUID | FK  | NOT NULL, REFERENCES users(id) | \-  |
| --- | --- | --- | --- | --- |

### Ente Maestro: users (Personal administrativo/Operativo)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| email | VARCHAR(255) | UQ, IDX | NOT NULL, CHECK (email LIKE '%@%') | \-  |
| --- | --- | --- | --- | --- |
| password_hash | VARCHAR(255) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| full_name | VARCHAR(150) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: roles (Catálogo de roles)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(50) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| permissions | JSONB | \-  | NOT NULL, DEFAULT '{}'::jsonb | tg_audit_role_changes (Registra en audit_logs al modificar permisos) |
| --- | --- | --- | --- | --- |

### Ente Maestro: user_roles (Asignación de roles contextual)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| user_id | UUID | PK, FK | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| role_id | UUID | PK, FK | NOT NULL, REFERENCES roles(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| branch_id | UUID | PK, FK | REFERENCES branches(id) ON DELETE CASCADE (Nullable) | \-  |
| --- | --- | --- | --- | --- |

## Dominio 2: Catálogo de Servicios

### Catálogo: service_categories

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(100) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |

### Ente Maestro: services

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| category_id | UUID | FK, IDX | NOT NULL, REFERENCES service_categories(id) | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(150) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| base_duration_minutes | INT | \-  | NOT NULL, CHECK (base_duration_minutes > 0) | \-  |
| --- | --- | --- | --- | --- |
| base_price | DECIMAL(10,2) | \-  | NOT NULL, CHECK (base_price >= 0) | \-  |
| --- | --- | --- | --- | --- |
| custom_attributes | JSONB | \-  | DEFAULT '{}'::jsonb | \-  |
| --- | --- | --- | --- | --- |
| is_active | BOOLEAN | \-  | NOT NULL, DEFAULT true | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: service_policies (Reglas de negocio)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| service_id | UUID | FK, UQ | NOT NULL, REFERENCES services(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| min_advance_booking_hours | INT | \-  | NOT NULL, DEFAULT 1 | \-  |
| --- | --- | --- | --- | --- |
| max_advance_booking_days | INT | \-  | NOT NULL, DEFAULT 30 | \-  |
| --- | --- | --- | --- | --- |
| buffer_before_minutes | INT | \-  | NOT NULL, DEFAULT 0 | \-  |
| --- | --- | --- | --- | --- |
| buffer_after_minutes | INT | \-  | NOT NULL, DEFAULT 0 | \-  |
| --- | --- | --- | --- | --- |
| requires_admin_confirmation | BOOLEAN | \-  | NOT NULL, DEFAULT false | \-  |
| --- | --- | --- | --- | --- |
| cancel_threshold_hours | INT | \-  | NOT NULL, DEFAULT 24 | \-  |
| --- | --- | --- | --- | --- |
| reschedule_threshold_hours | INT | \-  | NOT NULL, DEFAULT 12 | \-  |
| --- | --- | --- | --- | --- |
| allow_client_cancellation | BOOLEAN | \-  | NOT NULL, DEFAULT true | \-  |
| --- | --- | --- | --- | --- |
| allow_client_reschedule | BOOLEAN | \-  | NOT NULL, DEFAULT true | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: service_reminder_rules

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| service_id | UUID | FK, IDX | NOT NULL, REFERENCES services(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| minutes_before | INT | \-  | NOT NULL, CHECK (minutes_before > 0) | \-  |
| --- | --- | --- | --- | --- |
| template_id | UUID | FK  | NOT NULL, REFERENCES notification_templates(id) | tg_schedule_notification (Al crear reserva, programa el evento) |
| --- | --- | --- | --- | --- |
| is_active | BOOLEAN | \-  | NOT NULL, DEFAULT true | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: service_resources (Recursos requeridos)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| service_id | UUID | PK, FK | NOT NULL, REFERENCES services(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| resource_type_id | UUID | PK, FK | NOT NULL, REFERENCES resource_types(id) | \-  |
| --- | --- | --- | --- | --- |
| quantity_required | INT | \-  | NOT NULL, CHECK (quantity_required > 0) | \-  |
| --- | --- | --- | --- | --- |

## Dominio 3: Recursos y Agenda

### Catálogo: resource_types

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(100) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |

### Ente Maestro: resources (El recurso físico o humano)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| branch_id | UUID | FK, IDX | NOT NULL, REFERENCES branches(id) | \-  |
| --- | --- | --- | --- | --- |
| type_id | UUID | FK, IDX | NOT NULL, REFERENCES resource_types(id) | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(150) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| capacity | INT | \-  | NOT NULL, DEFAULT 1, CHECK (capacity > 0) | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: resource_availability_rules (Horario Laboral)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | FK, IDX | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| day_of_week | SMALLINT | \-  | NOT NULL, CHECK (day_of_week BETWEEN 1 AND 7) | \-  |
| --- | --- | --- | --- | --- |
| start_time | TIME | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| end_time | TIME | \-  | NOT NULL, CHECK (end_time > start_time) | \-  |
| --- | --- | --- | --- | --- |
| valid_from | DATE | \-  | NOT NULL | tg_rebuild_agenda_snapshots (Recomputa caché) |
| --- | --- | --- | --- | --- |
| valid_to | DATE | \-  | (Nullable), CHECK (valid_to >= valid_from) | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: resource_breaks (Pausas dentro del horario laboral)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| availability_rule_id | UUID | FK, IDX | NOT NULL, REFERENCES resource_availability_rules(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| start_time | TIME | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| end_time | TIME | \-  | NOT NULL, CHECK (end_time > start_time) | tg_rebuild_agenda_snapshots |
| --- | --- | --- | --- | --- |

### Ente Transaccional: resource_time_off (Vacaciones, licencias)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | FK, IDX | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| start_datetime | TIMESTAMPTZ | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| end_datetime | TIMESTAMPTZ | \-  | NOT NULL, CHECK (end_datetime > start_datetime) | tg_prevent_booking_overlap (Evita insertar si choca con citas existentes) |
| --- | --- | --- | --- | --- |
| reason | VARCHAR(255) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: resource_service_overrides

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | FK, IDX | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| service_id | UUID | FK, IDX | NOT NULL, REFERENCES services(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| duration_override_minutes | INT | \-  | (Nullable), CHECK (duration_override_minutes > 0) | \-  |
| --- | --- | --- | --- | --- |
| price_override | DECIMAL(10,2) | \-  | (Nullable), CHECK (price_override >= 0) | \-  |
| --- | --- | --- | --- | --- |

### Ente Maestro: calendar_sync_accounts

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | FK, UQ | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| provider | VARCHAR(50) | \-  | NOT NULL, CHECK (provider IN ('Google_Calendar', 'Outlook')) | \-  |
| --- | --- | --- | --- | --- |
| sync_token | VARCHAR(512) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: agenda_daily_snapshots (Caché de disponibilidad)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | FK, IDX | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| date | DATE | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| timeline | JSONB | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| last_calculated_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

## Dominio 4: Clientes

### Ente Maestro: customers

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| first_name | VARCHAR(100) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| last_name | VARCHAR(100) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| email | VARCHAR(255) | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| phone | VARCHAR(50) | \-  | \-  | \-  |
| --- | --- | --- | --- | --- |
| timezone | VARCHAR(50) | \-  | NOT NULL, DEFAULT 'America/Lima' | \-  |
| --- | --- | --- | --- | --- |
| preferences | JSONB | \-  | DEFAULT '{}'::jsonb | \-  |
| --- | --- | --- | --- | --- |
| consent_signed | BOOLEAN | \-  | NOT NULL, DEFAULT false | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: customer_notification_preferences

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| customer_id | UUID | FK, IDX | NOT NULL, REFERENCES customers(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| topic_id | UUID | FK  | NOT NULL, REFERENCES notification_topics(id) | \-  |
| --- | --- | --- | --- | --- |
| channel_id | UUID | FK  | NOT NULL, REFERENCES notification_channels(id) | \-  |
| --- | --- | --- | --- | --- |
| is_enabled | BOOLEAN | \-  | NOT NULL, DEFAULT true | \-  |
| --- | --- | --- | --- | --- |
| updated_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | tg_update_timestamp |
| --- | --- | --- | --- | --- |

### Ente Transaccional: customer_notes

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| customer_id | UUID | FK, IDX | NOT NULL, REFERENCES customers(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| note_text | TEXT | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| created_by | UUID | FK  | NOT NULL, REFERENCES users(id) | \-  |
| --- | --- | --- | --- | --- |
| created_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

## Dominio 5: Reservas (Core Transaccional)

### Ente Transaccional: booking_locks (Control de Concurrencia - Pre-reserva)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | FK, IDX | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| starts_at | TIMESTAMPTZ | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| ends_at | TIMESTAMPTZ | \-  | NOT NULL, CHECK (ends_at > starts_at) | tg_prevent_lock_overlap (Evita dobles bloqueos) |
| --- | --- | --- | --- | --- |
| lock_type | VARCHAR(30) | \-  | NOT NULL, CHECK (lock_type IN ('transactional', 'manual_operational', 'maintenance')) | \-  |
| --- | --- | --- | --- | --- |
| reason | VARCHAR(255) | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| locked_by_user_id | UUID | FK  | REFERENCES users(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| locked_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |
| expires_at | TIMESTAMPTZ | IDX | (Nullable) | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: bookings (Cabecera de Reserva)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| branch_id | UUID | FK, IDX | NOT NULL, REFERENCES branches(id) | \-  |
| --- | --- | --- | --- | --- |
| service_id | UUID | FK, IDX | NOT NULL, REFERENCES services(id) | \-  |
| --- | --- | --- | --- | --- |
| customer_id | UUID | FK, IDX | NOT NULL, REFERENCES customers(id) | \-  |
| --- | --- | --- | --- | --- |
| starts_at | TIMESTAMPTZ | IDX | NOT NULL | tg_validate_service_policies (Valida max/min advance time) |
| --- | --- | --- | --- | --- |
| ends_at | TIMESTAMPTZ | \-  | NOT NULL, CHECK (ends_at > starts_at) | \-  |
| --- | --- | --- | --- | --- |
| customer_timezone | VARCHAR(50) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| status | VARCHAR(20) | IDX | NOT NULL, CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show')) | tg_insert_status_history (Registra en booking_status_history) |
| --- | --- | --- | --- | --- |
| source_channel | VARCHAR(50) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| notes | TEXT | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| custom_data | JSONB | \-  | DEFAULT '{}'::jsonb | \-  |
| --- | --- | --- | --- | --- |
| created_by | UUID | FK  | REFERENCES users(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| created_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |
| updated_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | tg_update_timestamp |
| --- | --- | --- | --- | --- |

### Ente Transaccional: booking_resource_allocations

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| booking_id | UUID | PK, FK | NOT NULL, REFERENCES bookings(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | PK, FK, IDX | NOT NULL, REFERENCES resources(id) | tg_enforce_resource_capacity (Asegura que el recurso no exceda su límite de concurrencia en ese bloque horario) |
| --- | --- | --- | --- | --- |

### Ente Transaccional: booking_status_history (Trazabilidad)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| booking_id | UUID | FK, IDX | NOT NULL, REFERENCES bookings(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| previous_status | VARCHAR(20) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| new_status | VARCHAR(20) | \-  | NOT NULL | tg_publish_webhook_event (Genera evento en webhooks_outbox) |
| --- | --- | --- | --- | --- |
| reason | VARCHAR(255) | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| changed_by_user_id | UUID | FK  | REFERENCES users(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| changed_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: booking_cancellations

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| booking_id | UUID | FK, UQ | NOT NULL, REFERENCES bookings(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| reason_code | VARCHAR(50) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| description | TEXT | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| cancelled_by_user_id | UUID | FK  | REFERENCES users(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| cancelled_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: booking_reschedules

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| booking_id | UUID | FK, IDX | NOT NULL, REFERENCES bookings(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| original_starts_at | TIMESTAMPTZ | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| original_ends_at | TIMESTAMPTZ | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| new_starts_at | TIMESTAMPTZ | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| new_ends_at | TIMESTAMPTZ | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| reason | VARCHAR(255) | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| rescheduled_by_user_id | UUID | FK  | REFERENCES users(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| created_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

## Dominio 6: Comunicación

### Catálogo: notification_channels

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | REFERENCES tenants(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| code | VARCHAR(50) | UQ  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(100) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| is_active | BOOLEAN | \-  | NOT NULL, DEFAULT true | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: notification_templates

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| trigger_event | VARCHAR(100) | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| recipient_role | VARCHAR(20) | \-  | NOT NULL, CHECK (recipient_role IN ('customer', 'admin', 'staff')) | \-  |
| --- | --- | --- | --- | --- |
| content_template | JSONB | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |

### Catálogo: notification_topics

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | REFERENCES tenants(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| code | VARCHAR(100) | UQ  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| name | VARCHAR(150) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| is_mandatory | BOOLEAN | \-  | NOT NULL, DEFAULT false | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: notification_events (Cola de envíos)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK  | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| booking_id | UUID | FK, IDX | REFERENCES bookings(id) ON DELETE CASCADE (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| template_id | UUID | FK  | NOT NULL, REFERENCES notification_templates(id) | \-  |
| --- | --- | --- | --- | --- |
| recipient_type | VARCHAR(20) | \-  | NOT NULL, CHECK (recipient_type IN ('customer', 'user')) | \-  |
| --- | --- | --- | --- | --- |
| recipient_id | UUID | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| contact_point | VARCHAR(255) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| status | VARCHAR(20) | IDX | NOT NULL, CHECK (status IN ('pending', 'sent', 'failed')) | \-  |
| --- | --- | --- | --- | --- |
| scheduled_for | TIMESTAMPTZ | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| sent_at | TIMESTAMPTZ | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |

## Dominio 7: Gobierno, Integración y Trazabilidad

### Ente Transaccional: auth_access_logs

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | REFERENCES tenants(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| user_id | UUID | FK, IDX | REFERENCES users(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| email_attempted | VARCHAR(255) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| event_type | VARCHAR(50) | IDX | NOT NULL, CHECK (event_type IN ('login_success', 'login_failed', 'logout', 'password_reset_requested', 'account_locked')) | \-  |
| --- | --- | --- | --- | --- |
| failure_reason | VARCHAR(255) | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| ip_address | INET / VARCHAR(45) | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| user_agent | TEXT | \-  | (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| created_at | TIMESTAMPTZ | IDX | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: audit_logs

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) | \-  |
| --- | --- | --- | --- | --- |
| entity_type | VARCHAR(100) | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| entity_id | UUID | IDX | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| action | VARCHAR(20) | \-  | NOT NULL, CHECK (action IN ('create', 'update', 'delete')) | \-  |
| --- | --- | --- | --- | --- |
| changes | JSONB | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| performed_by | UUID | FK  | REFERENCES users(id) (Nullable) | \-  |
| --- | --- | --- | --- | --- |
| timestamp | TIMESTAMPTZ | IDX | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: webhooks_outbox (Outbox Pattern)

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| tenant_id | UUID | FK, IDX | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| event_type | VARCHAR(100) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| payload | JSONB | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| status | VARCHAR(20) | IDX | NOT NULL, CHECK (status IN ('pending', 'processing', 'published', 'failed')) | \-  |
| --- | --- | --- | --- | --- |
| created_at | TIMESTAMPTZ | IDX | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |

### Ente Transaccional: schedule_overrides_history

| **Atributo** | **Tipo de Dato** | **Índices** | **Restricciones** | **Triggers / Lógica** |
| --- | --- | --- | --- | --- |
| id  | UUID | PK  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| resource_id | UUID | FK, IDX | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | \-  |
| --- | --- | --- | --- | --- |
| changed_by_user_id | UUID | FK  | NOT NULL, REFERENCES users(id) | \-  |
| --- | --- | --- | --- | --- |
| change_reason | VARCHAR(255) | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| previous_schedule_payload | JSONB | \-  | NOT NULL | \-  |
| --- | --- | --- | --- | --- |
| created_at | TIMESTAMPTZ | \-  | NOT NULL, DEFAULT NOW() | \-  |
| --- | --- | --- | --- | --- |