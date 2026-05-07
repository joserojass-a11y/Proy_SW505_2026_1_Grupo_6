 # Proy_SW505_2026_1_Grupo_6
 
 **UNI - FIIS - Construcción de Software 1**  
 **Semestre:** 2026-1  
 **Grupo:** 6
 
 ---
 
 ## 📋 Resumen Ejecutivo
 
 Sistema integral de gestión de reservas de servicios para negocios (clínicas, salones, talleres, tutorías). Proporciona agendamiento de citas, gestión de disponibilidad, notificaciones automatizadas, control de acceso basado en roles y auditoría completa. Arquitectura modular basada en capas, implementando el principio **CQS (Command Query Separation)**.
 
 ---
 
 ## 1️⃣ REQUERIMIENTOS
 
 ### 1.1 Requerimientos Funcionales Principales
 
 #### **Módulo 1: Autenticación y Gestión de Perfiles**
 - **RF-01**: Registro de usuarios mediante correo y contraseña validando unicidad
 - **RF-02**: Autenticación segura con tokens (JWT)
 - **RF-03**: Recuperación de credenciales por email
 - **RF-04**: Administración de perfil de usuario
 - **RF-05**: Gestión de roles y permisos diferenciados
 - **RF-06**: Cierre seguro de sesión
 - **RF-07**: Auditoría de accesos y eventos de autenticación
 
 #### **Módulo 2: Gestión de Disponibilidad y Agenda (CQS)**
 
 *Consultas (Query):*
 - **RF-08**: Consultar horarios disponibles sin alterar estado
 - **RF-09**: Visualizar agenda estructurada (Disponible, Reservado, Bloqueado)
 - **RF-10**: Cálculo dinámico de slots considerando duración y bloqueos
 - **RF-11**: Consultas históricas de cambios en disponibilidad
 
 *Modificaciones (Command):*
 - **RF-12**: Configuración de horarios y jornadas laborales
 - **RF-13**: Bloqueo manual de intervalos específicos
 - **RF-14**: Actualización automática tras reserva/cancelación
 - **RF-15**: Configuración de duración de servicios
 - **RF-16**: Gestión de excepciones (feriados, horarios especiales)
 
 #### **Módulo 3: Gestión de Agendamiento**
 - **RF-17**: Reserva de citas con selección de servicio, fecha y hora
 - **RF-18**: Confirmación automática de reservas
 - **RF-19**: Cancelación con políticas configurables
 - **RF-20**: Reprogramación validando disponibilidad
 - **RF-21**: Consulta de historial de citas
 - **RF-22**: Prevención de doble reserva
 - **RF-23**: Gestión de estados (Pendiente, Confirmada, Cancelada, Reprogramada, Finalizada)
 - **RF-24**: Visualización de próximas citas
 
 #### **Módulo 4: Gestión de Notificaciones**
 - **RF-25**: Notificación automática de confirmación
 - **RF-26**: Recordatorios previos a citas
 - **RF-27**: Notificación de cancelación
 - **RF-28**: Notificación de reprogramación
 - **RF-29**: Soporte multicanal (email, SMS futuros, push)
 - **RF-30**: Configuración de preferencias de notificación
 
 ### 1.2 Requerimientos No Funcionales
 
 | Categoría | Requisito | Descripción | Prioridad |
 |-----------|-----------|-------------|-----------|
 | **Rendimiento** | RNF-03 | Respuesta en máximo 2 segundos para consultas de disponibilidad | Alta |
 | | RNF-02 | Gestión de concurrencia para evitar doble reserva | Alta |
 | | RNF-01 | Escalabilidad horizontal con infraestructura cloud | Alta |
 | **Seguridad** | RNF-08 | Autenticación basada en tokens JWT | Alta |
 | | RNF-07 | Protección con HTTPS/TLS y cifrado de datos sensibles | Alta |
 | | RNF-11 | Hashing seguro de contraseñas | Alta |
 | | RNF-10 | Prevención de SQL Injection, XSS, CSRF | Alta |
 | **Disponibilidad** | RNF-13 | 99.5% uptime anual | Alta |
 | | RNF-14 | Recuperación automática ante fallos | Alta |
 | | RNF-15 | Respaldos periódicos | Alta |
 | **Usabilidad** | RNF-20 | Flujo de reserva en máximo 3 pasos | Alta |
 | | RNF-19 | Diseño responsive (móvil, tablet, escritorio) | Alta |
 | **Arquitectura** | RNF-23 | Aplicación estricta de CQS | Alta |
 | | RNF-24 | Arquitectura modular desacoplada | Alta |
 | | RNF-25 | Principios SOLID | Alta |
 
 ---
 
 ## 2️⃣ CASOS DE USO
 
 ### 2.1 Actores del Sistema
 
 - **Cliente**: Registrado por correo/contraseña. Consulta disponibilidad, reserva citas, cancela, reprograma y configura notificaciones
 - **Administrador**: Configura horarios, bloquea disponibilidad, visualiza agenda general, genera reportes
 
 ### 2.2 Casos de Uso Principales
 
 #### **Grupo 1: Disponibilidad y Agenda**
 
 | Caso de Uso | Actor | Tipo | Descripción |
 |-------------|-------|------|-------------|
 | **CUS-01** | Cliente, Admin | Query | Consultar disponibilidad de horarios sin modificar estado |
 | **CUS-02** | Admin | Query | Visualizar agenda estructurada con estado de bloques |
 | **CUS-03** | Admin | Command | Configurar horarios y servicios |
 | **CUS-04** | Admin | Command | Gestionar bloqueos y excepciones de agenda |
 
 #### **Grupo 2: Agendamiento de Clientes**
 
 | Caso de Uso | Actor | Tipo | Descripción |
 |-------------|-------|------|-------------|
 | **CUS-05** | Cliente | Command | Reservar cita (máximo 3 pasos) validando concurrencia |
 | **CUS-06** | Cliente, Admin | Command | Cancelar cita liberando bloque horario |
 | **CUS-07** | Cliente, Admin | Command | Reprogramar cita a nuevo bloque disponible |
 | **CUS-08** | Cliente, Admin | Query | Consultar historial y próximas citas |
 
 #### **Grupo 3: Autenticación y Perfiles**
 
 | Caso de Uso | Actor | Descripción |
 |-------------|-------|-------------|
 | **CUS-09** | Cliente | Registrar usuario con email/contraseña única |
 | **CUS-10** | Cliente, Admin | Iniciar sesión con validación segura de credenciales |
 | **CUS-11** | Cliente, Admin | Recuperar contraseña mediante enlace temporal |
 | **CUS-12** | Cliente, Admin | Administrar perfil (actualizar datos personales) |
 | **CUS-13** | Cliente, Admin | Cierre seguro de sesión invalidando tokens |
 
 #### **Grupo 4: Notificaciones**
 
 | Caso de Uso | Actor | Descripción |
 |-------------|-------|-------------|
 | **CUS-14** | Cliente | Configurar preferencias de notificación (frecuencia, canales) |
 | **CUS-15** | Sistema | Envío automático de notificaciones (extensión de otros CU) |
 
 ### 2.3 Procesos Macro del Negocio
 
 **CUN-01: Gestionar Agendamiento y Atención de Citas**
 - Cliente solicita servicio → Verificación de disponibilidad → Confirmación → Posibles modificaciones → Ejecución del servicio
 
 **CUN-02: Gestionar Disponibilidad y Operatividad**
 - Definición de horarios → Estructura de agenda → Configuración de duración de servicios → Gestión de excepciones operativas
 
 ---
 
 ## 3️⃣ MODELADO DE DATOS
 
 ### 3.1 Arquitectura de 7 Dominios
 
 El modelo de datos está segmentado en 7 dominios coherentes, cada uno manejando un aspecto del negocio:
 
 | Dominio | Descripción | Entidades Principales |
 |---------|-------------|---------------------|
 | **Dominio 1** | Organización y Seguridad | TENANTS, BRANCHES, USERS, ROLES, USER_ROLES, BRANCH_OPERATING_HOURS, BRANCH_EXCEPTIONS |
 | **Dominio 2** | Catálogo de Servicios | SERVICE_CATEGORIES, SERVICES, SERVICE_POLICIES, SERVICE_REMINDERS, SERVICE_RESOURCES |
 | **Dominio 3** | Recursos y Agenda | RESOURCES, AVAILABILITY_RULES, TIME_OFF, CALENDAR_SYNC_ACCOUNTS, AGENDA_SNAPSHOTS |
 | **Dominio 4** | Clientes | CUSTOMERS, CUSTOMER_NOTIFICATION_PREFERENCES, CUSTOMER_NOTES |
 | **Dominio 5** | Reservas | BOOKINGS, BOOKING_LOCKS, BOOKING_RESOURCE_ALLOCATIONS, BOOKING_STATUS_HISTORY, BOOKING_CANCELLATIONS, BOOKING_RESCHEDULES |
 | **Dominio 6** | Comunicación | NOTIFICATION_CHANNELS, NOTIFICATION_TEMPLATES, NOTIFICATION_TOPICS, NOTIFICATION_EVENTS |
 | **Dominio 7** | Gobierno e Integración | AUTH_ACCESS_LOGS, AUDIT_LOGS, WEBHOOKS_OUTBOX, SCHEDULE_OVERRIDES_HISTORY |
 
 ### 3.2 Clasificación de Entidades
 
 **Catálogos**
 - Propósito: Tipificar, estandarizar, brindar opciones predefinidas
 - Características: No generan operaciones por sí solas, baja frecuencia de actualización
 - Ejemplos: SERVICE_CATEGORIES, ROLES, NOTIFICATION_CHANNELS
 
 **Entes Maestros**
 - Propósito: Sujetos y objetos principales del ecosistema
 - Características: Columna vertebral del negocio, objetivo central de FK
 - Ejemplos: TENANTS, BRANCHES, USERS, CUSTOMERS, RESOURCES, SERVICES, BOOKINGS
 
 **Entes Transaccionales**
 - Propósito: Manifestación dinámica del sistema
 - Características: Nacen de interacción entre Entes Maestros, alto volumen, escritura constante
 - Ejemplos: BOOKING_STATUS_HISTORY, BOOKING_CANCELLATIONS, AUTH_ACCESS_LOGS
 
 ### 3.3 Convenciones de Diseño Físico
 
 **Tipos de Datos**
 - Identificadores: UUID v4
 - Timestamps: TIMESTAMPTZ (UTC)
 - Datos extensibles: JSONB
 - Direcciones IP: INET
 - Moneda: DECIMAL(10,2)
 
 **Nomenclatura**
 - Tablas: SNAKE_CASE mayúsculas (CUSTOMER_NOTES)
 - Columnas: SNAKE_CASE mayúsculas (created_at, customer_id)
 - Claves primarias: `id` o `{entity}_id`
 - Claves foráneas: `{referenced_table}_id`
 - Constraint markers: `<<PK>>`, `<<FK>>`, `<<UQ>>`
 
 **Estrategia de Relaciones**
 - Cardinalidad 1:N representada con `||--o{`
 - Cardinalidad M:N mediante tablas puente
 - ON DELETE CASCADE para propagación de borrados seguros
 - Integridad referencial reforzada en triggers
 
 ### 3.4 Esquema de Colores (Diagramas)
 
 ```
 Entidades principales    #DBEAFE (Azul claro)
 Catálogos/Lookup         #FEF3C7 (Amarillo claro)
 Tablas puente (M:N)      #F3E8FF (Morado claro)
 Relaciones nombradas     #FDE68A (Amarillo)
 ```
 
 ### 3.5 Archivos de Referencia
 
 - **Diccionario de Datos - Modelado Lógico.docx**: Detalles ontológicos de todas las entidades por dominio
 - **Diccionario de Datos - Modelado Físico Relacional.docx**: Schema físico con tipos de datos, índices y triggers
 - **Diagramas disponibles en**: `entregables/entregable1/modelado_datos/`
	 - Modelo Lógico: `Diagrama_Logico.svg`
	 - Modelo Físico Consolidado: `Diagrama_Fisico/Diccionario_Fisico_Relacional.svg`
	 - Modelos por Dominio: `Diagrama_Fisico/Diccionario_Fisico_Dominio[1-7].svg`
	 - Índice de navegación: `Diagrama_Fisico/Diccionario_Fisico_Indice.md`
 
 ---
 
 ## 4️⃣ ARQUITECTURA
 
 ### 4.1 Estilo Arquitectónico
 
 **Arquitectura en Capas Modular** con separación de responsabilidades y desacoplamiento de componentes.
 
 ### 4.2 Capas del Sistema
 
 ```
 ┌─────────────────────────────────────────────────────────┐
 │  Capa de Presentación                                   │
 │  - Interfaz web (React SPA)                             │
 │  - Responsive (móvil, tablet, escritorio)               │
 │  - Accesibilidad básica                                 │
 └────────────────────────┬────────────────────────────────┘
						  │ HTTP/REST
 ┌────────────────────────▼────────────────────────────────┐
 │  Capa de API REST                                       │
 │  - Controladores por módulo funcional                   │
 │  - Enrutamiento y validación de solicitudes             │
 │  - Manejo centralizado de errores                       │
 └────────────────────────┬────────────────────────────────┘
						  │
 ┌────────────────────────▼────────────────────────────────┐
 │  Capa de Aplicación (CQS)                               │
 │  - Coordinación de casos de uso                         │
 │  - Command Handlers (modifican estado)                  │
 │  - Query Handlers (solo lectura)                        │
 │  - Orquestación de eventos                              │
 └────────────────────────┬────────────────────────────────┘
						  │
 ┌────────────────────────▼────────────────────────────────┐
 │  Capa de Dominio                                        │
 │  - Entidades de negocio                                 │
 │  - Reglas de validación                                 │
 │  - Lógica de disponibilidad y reservas                  │
 │  - Domain Events                                        │
 └────────────────────────┬────────────────────────────────┘
						  │
 ┌────────────────────────▼────────────────────────────────┐
 │  Capa de Persistencia                                   │
 │  - Repositorios especializados                          │
 │  - Queries optimizadas                                  │
 │  - Mapeo objeto-relacional                              │
 │  - Transaccionalidad y concurrencia                     │
 └────────────────────────┬────────────────────────────────┘
						  │
 ┌────────────────────────▼────────────────────────────────┐
 │  Base de Datos (PostgreSQL)                             │
 │  - 40+ tablas relacionadas                              │
 │  - Índices optimizados                                  │
 │  - Triggers para automatización                         │
 │  - Multi-tenancy con aislamiento de datos               │
 └─────────────────────────────────────────────────────────┘
 ```
 
 ### 4.3 Módulos Funcionales
 
 | Módulo | Responsabilidad | Componentes |
 |--------|-----------------|------------|
 | **Autenticación** | Gestión de credenciales y sesiones | JWT, RBAC, Token validation |
 | **Agenda** | Disponibilidad y horarios | Calendar engine, Slot calculation, Time zones |
 | **Reservas** | Gestión del ciclo de vida de citas | Booking handler, Concurrency control, State machine |
 | **Notificaciones** | Envío multicanal | Queue, Templates, Email service, SMS integration |
 | **Auditoría** | Registro de eventos | Access logs, Audit logs, Webhooks outbox |
 
 ### 4.4 Aplicación de CQS (Command Query Separation)
 
 **Commands** (Modifican estado)
 - Reservar cita
 - Cancelar cita
 - Reprogramar cita
 - Configurar horarios
 - Bloquear disponibilidad
 
 **Queries** (Solo lectura)
 - Consultar disponibilidad
 - Visualizar agenda
 - Obtener historial de citas
 - Listar preferencias de notificación
 
 ### 4.5 Flujo de Procesamiento de Reserva
 
 ```
 Cliente → API REST → Command Handler → Validaciones
	 ↓
 Domain Logic (CQS)
	 - Verificar disponibilidad
	 - Validar concurrencia
	 - Aplicar políticas
	 ↓
 Repository (Persistencia)
	 - Transacción atómica
	 - Actualizar estado
	 ↓
 Event Publishing → Notificación automática
	 ↓
 Response → Cliente
 ```
 
 ### 4.6 Principios Aplicados
 
 ✅ **SOLID**
 - Single Responsibility: Cada clase una responsabilidad
 - Open/Closed: Extensible sin modificación
 - Liskov Substitution: Sustitución de comportamientos
 - Interface Segregation: Interfaces específicas
 - Dependency Inversion: Inyección de dependencias
 
 ✅ **Separación de Responsabilidades**
 - Controllers: Solo HTTP
 - Services: Solo lógica
 - Repositories: Solo acceso a datos
 - Domain: Solo reglas de negocio
 
 ✅ **Patrones de Diseño**
 - Repository Pattern
 - Unit of Work
 - Domain Events
 - Command/Query Handlers
 - Strategy Pattern (políticas de reserva)
 
 ### 4.7 Consideraciones de Concurrencia y Escalabilidad
 
 - **Bloqueos Optimistas**: BOOKING_LOCKS para evitar doble reserva
 - **Índices Estratégicos**: En FK, tenant_id, branch_id, timestamps
 - **Escalabilidad Horizontal**: Stateless services, cache distribuido
 - **Load Balancing**: Distribución de solicitudes entre instancias
 - **Asincronía**: Queue para notificaciones y webhooks
 
 ### 4.8 Seguridad en Arquitectura
 
 - **Autenticación**: JWT tokens con refresh/expiry
 - **Autorización**: RBAC por rol y rama
 - **Validación**: Input validation en todos los endpoints
 - **Cifrado**: HTTPS/TLS, password hashing bcrypt
 - **Auditoría**: AUTH_ACCESS_LOGS, AUDIT_LOGS para trazabilidad
 - **Rate Limiting**: Protección contra abuso
 
 ---
 
 ## 📁 Estructura de Entregables
 
 ```
 entregables/
 ├── entregable1/
 │   ├── Análisis y Diseño de Casos de Uso.pdf
 │   ├── Diseño de Arquitectura.docx
 │   ├── Informe Análisis Diseño Casos de Uso.docx
 │   ├── Requerimientos Funcionales del sistema.docx
 │   ├── Requerimientos No Funcionales del sistema.docx
 │   ├── Diccionario de Datos - Modelado Lógico.docx
 │   ├── Diccionario de Datos - Modelado Físico Relacional.docx
 │   └── modelado_datos/
 │       ├── Diagrama_Logico.svg
 │       └── Diagrama_Fisico/
 │           ├── Diccionario_Fisico_Relacional.svg
 │           ├── Diccionario_Fisico_Dominio[1-7].svg
 │           ├── Diccionario_Fisico_Indice.md
 ```
 
 ---
 
 ## 🎯 Próximas Etapas
 
 1. Implementación de backend (Node.js + Express + PostgreSQL)
 2. Desarrollo de frontend (React SPA)
 3. Integración de notificaciones (Email, SMS, Push)
 4. Implementación de webhooks para integraciones externas
 5. Testing (unitario, integración, e2e)
 6. Despliegue en entorno cloud
 
 ---
 
 **Última actualización:** Mayo 2026  
 **Versión:** 1.0
