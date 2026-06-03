# Guía de Estado Actual y Desarrollo con IA (PROJECT_STATUS.md)

Este documento sirve como referencia rápida y consulta frecuente para desarrolladores y asistentes de Inteligencia Artificial (IA). Describe el estado actual del proyecto, la arquitectura adoptada, las convenciones de diseño y los pasos requeridos para continuar con la implementación.

---

## 📋 1. Ficha Técnica del Proyecto

*   **Nombre:** Plataforma de Reservas de Servicios
*   **Semestre:** 2026-1
*   **Grupo:** UNI - FIIS - Construcción de Software 1 - Grupo 6
*   **Stack Tecnológico:**
    *   **Backend:** Node.js, NestJS, TypeScript, TypeORM, PostgreSQL 15, Redis 7.
    *   **Frontend:** React (SPA), Vite, React Router DOM, Zustand, Axios.
    *   **Infraestructura:** Docker & Docker Compose.
*   **Aseguramiento de Calidad:**
    *   **Backend:** Jest (Unitarias), Testcontainers PostgreSQL (Integración).
    *   **Frontend:** Vitest (Unitarias y Componentes).

---

## 🏛️ 2. Arquitectura y Patrones del Sistema

El backend sigue una **Arquitectura Limpia / Modular en Capas** altamente desacoplada y guiada por **DDD (Domain-Driven Design)** y el principio **CQS (Command Query Separation)**.

```
┌─────────────────────────────────────────────────────────┐
│  Capa de Presentación (React SPA / HTTP Controllers)     │
└────────────────────────┬────────────────────────────────┘
                         │ 
┌────────────────────────▼────────────────────────────────┐
│  Capa de Aplicación (CQS: Commands & Queries Handlers)  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Capa de Dominio (Entidades de Negocio & Value Objects) │
└────────────────────────┬────────────────────────────────┘
                         │ (Dependency Inversion / Repositories Interfaces)
┌────────────────────────▼────────────────────────────────┐
│  Capa de Persistencia (TypeORM, Repositories, Schemas)  │
└─────────────────────────────────────────────────────────┘
```

### Principios Fundamentales a Respetar:
1.  **Desacoplamiento de Base de Datos:** Las entidades del dominio (`src/backend/src/domain/entities`) son clases puras de TypeScript. No contienen decoradores de TypeORM (`@Entity`, `@Column`). El mapeo relacional se realiza en la capa de infraestructura usando `EntitySchema` de TypeORM (`src/backend/src/infrastructure/persistence/typeorm/entities`).
2.  **Objetos de Valor (Value Objects):** Todo atributo relevante (como IDs, emails, contraseñas, roles) debe encapsularse en un Value Object (`vo.ts`) en el dominio para garantizar auto-validación y consistencia desde su creación.
3.  **Command Query Separation (CQS):**
    *   **Commands:** Modifican el estado del sistema. No retornan datos (máximo el ID generado o vacío). Tienen prefijos como `create-`, `update-`, `delete-`.
    *   **Queries:** Consultan información sin alterar el estado. Tienen prefijo `get-` o `list-`.
4.  **Inyección de Dependencias (DI):** Los controladores y casos de uso interactúan con abstracciones (interfaces de repositorios). Los tokens de inyección se gestionan de forma centralizada en [infrastructure.tokens.ts](file:///c:/Users/jose/Desktop/Proyectos/Cursos/Proy_SW505_2026_1/src/backend/src/infrastructure/shared/infrastructure.tokens.ts).

---

## 🗄️ 3. Estado de la Base de Datos (PostgreSQL)

La migración inicial de la base de datos (`1780295142162-InitialSchema.ts`) crea las siguientes tablas maestras y de configuración básicas:

*   **`users`**: Almacena las credenciales y perfiles de los usuarios (ADMIN, CLIENT, OWNER).
*   **`tenants`**: Registro de empresas/cuentas cliente multitenant.
*   **`tenant_billing_profiles`**: Planes de facturación y límites (máximo de sucursales, máximo de recursos).
*   **`customers`**: Perfil de clientes finales asociados a un tenant.

### Relaciones Físicas Actuales:
El esquema actual de base de datos se limita a estas 4 tablas y no tiene definidas las llaves foráneas explícitas a nivel físico en la primera migración, aunque sí se describen en el diccionario lógico y físico de datos de los entregables.

---

## 📂 4. Estado de Implementación por Dominio

El proyecto de diseño contempla **7 Dominios Funcionales**. A continuación se detalla su estado de implementación en código:

| Dominio | Descripción | Componentes en Código Backend | Estado |
| :--- | :--- | :--- | :--- |
| **Dominio 1** | Organización y Seguridad | `Tenant`, `User`, `TenantBillingProfile` y Auth. | **Parcialmente Implementado** (Faltan `branches`, `branch_operating_hours`, `branch_exceptions` y asignación granular de `roles`/`user_roles`). |
| **Dominio 2** | Catálogo de Servicios | Servicios, categorías, políticas y recursos requeridos. | **No Implementado** |
| **Dominio 3** | Recursos y Agenda | Recursos (personal/equipos), horarios, excepciones y caché diario de disponibilidad (`agenda_daily_snapshots`). | **No Implementado** |
| **Dominio 4** | Clientes | Gestión de clientes (`Customer`). | **Parcialmente Implementado** (Falta historial de notas y preferencias de notificación). |
| **Dominio 5** | Reservas | Motor transaccional de citas, bloqueos concurrentes (`booking_locks`) y estados. | **No Implementado** |
| **Dominio 6** | Comunicación | Canales de notificación, plantillas y cola de envíos (`notification_events`). | **No Implementado** |
| **Dominio 7** | Gobierno e Integración | Bitácoras de acceso (`auth_access_logs`), auditoría (`audit_logs`) y webhooks (`webhooks_outbox`). | **No Implementado** |

---

## 🗂️ 5. Estructura de Directorios Clave

```
Proy_SW505_2026_1/
├── entregables/                # 📄 Documentación del diseño (PDFs, Word y Markdowns)
│   └── entregable1/markdowns/  # Diccionario de datos, requerimientos y diseño de arquitectura
├── src/
│   ├── backend/                # 🚀 Código de la API (NestJS)
│   │   ├── src/
│   │   │   ├── domain/         # Entidades, Value Objects, Excepciones y Repositorios
│   │   │   ├── application/    # Casos de uso (Commands/Queries Handlers, Services, DTOs)
│   │   │   ├── infrastructure/ # Persistencia (TypeORM), Controladores, Guards, Modules
│   │   │   └── shared/         # Elementos transversales
│   │   └── tests/              # 🧪 Pruebas
│   └── frontend/               # 💻 Código del cliente (React + Vite)
│       └── src/
│           ├── features/       # Módulos SPA (auth, booking, profile, schedule)
│           ├── store/          # Estado con Zustand
│           └── router/         # Configuración de rutas
├── docker-compose.yml          # 🐳 Configuración de contenedores (postgres, redis, api, frontend)
├── .env.example                # Plantilla de variables de entorno
└── README.md                   # Guía de inicio rápido
```

---

## 🛠️ 6. Guía de Desarrollo para Continuar Construyendo (IA & Devs)

Al programar o generar código para este proyecto, sigue esta secuencia obligatoria para mantener la coherencia del diseño limpio:

### Paso 1: Definir los Value Objects y Entidades de Dominio
1.  Crea los Value Objects necesarios en `src/backend/src/domain/value-objects/`. Todos los VOs deben auto-validarse en su constructor (ej. lanzar excepciones si un email no es válido o un ID está vacío).
2.  Crea la clase de la entidad en `src/backend/src/domain/entities/`. Utiliza métodos factoría estáticos como `create()` y `reconstitute()`. Evita exponer mutadores directos; usa métodos descriptivos (ej. `activate()`, `changeStatus()`).

### Paso 2: Crear el Schema de TypeORM
1.  Define el mapeo de base de datos en `src/backend/src/infrastructure/persistence/typeorm/entities/typeorm-[nombre].entity.ts` utilizando `EntitySchema`. Esto mapea los atributos primitivos de la base de datos a la clase de persistencia.
2.  Si es necesario, agrega un mapper de datos para convertir la entidad del dominio a la entidad de persistencia y viceversa.

### Paso 3: Definir el Repositorio de Dominio y su Implementación
1.  Crea la interfaz del repositorio en `src/backend/src/domain/repositories/[nombre].repository.ts`.
2.  Registra un Token para este repositorio en `src/backend/src/infrastructure/shared/infrastructure.tokens.ts`.
3.  Crea la implementación física del repositorio con TypeORM en `src/backend/src/infrastructure/persistence/typeorm/typeorm-[nombre].repository.ts`.
4.  Provee la implementación del repositorio en el módulo NestJS respectivo utilizando `@Inject(INFRASTRUCTURE_TOKENS.[NOMBRE_REPOSITORY])`.

### Paso 4: Crear los Casos de Uso (CQS Commands/Queries)
1.  Crea las clases del Command/Query y sus respectivos CommandHandler/QueryHandler en `src/backend/src/application/commands/` o `src/backend/src/application/queries/`.
2.  Asegúrate de inyectar los repositorios a través de sus tokens de infraestructura.

### Paso 5: Exponer en el Controlador HTTP
1.  Crea o actualiza el controlador en `src/backend/src/infrastructure/http/controllers/`.
2.  Inyecta y ejecuta el Command Bus / Query Bus o el Handler directamente para procesar la petición HTTP y retornar la respuesta formateada.

---

## 🐳 7. Guía de Comandos Rápidos

### Levantar el entorno de desarrollo:
```powershell
# Levanta la base de datos, Redis, API y Frontend SPA
docker compose up -d --build
```

### Ejecutar migraciones en el backend:
```powershell
# Dentro de src/backend/
npm run db:migrate
```

### Generar una nueva migración:
```powershell
# Genera una migración comparando los esquemas cargados con la base de datos activa
npm run db:migrate:generate -- name=AddBranchesTable
```

### Ejecutar Pruebas:
```powershell
# Pruebas unitarias
npm run test:unit

# Pruebas de integración (requiere Docker activo para Testcontainers)
npm run test:integration
```
