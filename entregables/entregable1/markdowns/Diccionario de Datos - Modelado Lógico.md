# **Diccionario de Datos: Modelado Lógico Expandido**

Este documento contiene el desglose detallado de las entidades de base de datos a lo largo de los 7 dominios del sistema. Cada tabla presenta las siguientes dimensiones:

* **Atributos:** El nombre técnico de la columna.  
* **Naturaleza:** El tipo de dato relacional (ej. UUID, String, JSONB, FK).  
* **Semántica:** El significado único y literal del dato en el mundo real.  
* **Ontología:** El funcionamiento, propósito estructural o impacto de este dato dentro del ecosistema del software.

Asimismo, se los clasificó de tres formas según su funcionalidad:

* **Catálogos:** Estas entidades no generan operaciones por sí solas. Su propósito ontológico es tipificar, estandarizar, brindar opciones predefinidas o establecer reglas lógicas para construir y gobernar a los Entes. Tienen baja frecuencia de actualización.  
* **Entes Maestros:** Son los sujetos y objetos principales del ecosistema. Existen por sí mismos, son la columna vertebral del negocio y son el objetivo central al que apuntan las llaves foráneas.  
* **Entes Transaccionales:** Son la manifestación dinámica del sistema. Nacen de la interacción entre los Entes Maestros, utilizando las reglas dictadas por los Catálogos. Son tablas de alto volumen y escritura constante.

## **Dominio 1: Organización y Seguridad**

---

Gestiona la estructura jerárquica de la empresa y el control de acceso contextual (RBAC).

### **Ente Maestro: tenants (Empresas/Cuentas cliente)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador único de la empresa cliente. | Actúa como la raíz del aislamiento de datos (Multi-tenancy). Es obligatorio en casi todas las consultas globales para evitar fugas de datos entre cuentas. |
| name | String | Nombre comercial o razón social de la empresa. | Elemento visual principal para identificar a la organización en dashboards y notificaciones de sistema. |
| global\_settings | JSONB | Configuraciones generales en formato estructurado. | Almacena parámetros flexibles de la cuenta sin requerir migraciones de base de datos (ej. moneda por defecto, idioma base). |
| created\_at | Timestamp UTC | Momento exacto en que la cuenta fue creada. | Punto de partida del ciclo de vida del tenant; usado para métricas de facturación y antigüedad. |

### **Ente Maestro: branches (Sucursales/Sedes)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador de la sucursal física o virtual. | Pivote para la asignación regional de recursos, personal y reservas. |
| tenant\_id | UUID, FK | Referencia a la empresa dueña. | Vínculo de pertenencia estricta que asegura que una sucursal no sea vista por otra empresa. |
| name | String | Nombre descriptivo de la sede. | Permite al usuario final y al personal distinguir la ubicación (ej. "Sede Norte"). |
| timezone | String | Zona horaria específica de esta sucursal (ej. 'America/Lima'). | Crucial para normalizar todas las horas locales (visualización) frente al estándar UTC (base de datos), evitando desfases en reservas transnacionales. |
| address | String | Ubicación física o enlace virtual. | Dato informativo que se expone en correos de confirmación y mapas para el cliente. |
| is\_active | Boolean | Estado operativo general de la sede. | Interruptor maestro (Soft-delete o suspensión) que oculta la sede de búsquedas y nuevas reservas sin destruir su historial. |

### **Catálogo: branch\_operating\_hours (Marco de apertura y cierre)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador de la regla de horario. | Llave técnica de la regla. |
| tenant\_id | UUID, FK | Empresa a la que pertenece. | Capa de seguridad redundante para evitar manipulaciones cruzadas. |
| branch\_id | UUID, FK | Sucursal afectada. | Relaciona el horario con su espacio geográfico respectivo. |
| day\_of\_week | Integer (1-7) | Día numérico de la semana (Lunes a Domingo). | Establece el patrón cíclico semanal del motor de agendas. |
| open\_time | Time | Hora en que la sucursal abre sus puertas. | Límite inferior para la generación de la grilla de turnos disponibles. |
| close\_time | Time | Hora en que la sucursal deja de operar. | Límite superior que impide la programación de citas fuera de banda. |
| is\_closed | Boolean | Indicador de inactividad total para el día. | Optimiza las consultas de disponibilidad; si es true, el motor ignora las horas y rechaza cualquier cálculo para ese día. |

### **Catálogo: branch\_exceptions (Feriados o cierres excepcionales)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador de la excepción. | Llave técnica del registro. |
| tenant\_id | UUID, FK | Empresa dueña de la excepción. | Aislamiento de seguridad. |
| branch\_id | UUID, FK | Sucursal donde aplica el bloqueo. | Focaliza la excepción; permite cerrar "Sede Sur" sin afectar "Sede Norte". |
| start\_datetime | Timestamp UTC | Momento en que inicia el feriado/cierre. | Marca el inicio de la invalidación masiva de disponibilidad. |
| end\_datetime | Timestamp UTC | Momento de finalización del evento. | Marca el punto de reactivación de las operaciones. |
| reason | String | Motivo textual del bloqueo. | Contexto humano útil para justificar cancelaciones forzadas o respuestas a quejas de clientes. |
| is\_full\_day | Boolean | Indica si abarca el día de corrido. | Flag semántico para la interfaz de usuario, permite pintar un día completo de rojo sin calcular horas. |
| created\_by\_user\_id | UUID, FK | Administrador que configuró la excepción. | Trazabilidad de responsabilidad; fundamental si el cierre generó pérdidas operativas no planeadas. |

### **Ente Maestro: users (Personal administrativo/Operativo)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identidad única del empleado/usuario. | Referencia central de autoría en el sistema (el "quién" en todas las transacciones operativas). |
| tenant\_id | UUID, FK | Empresa empleadora. | Restringe el acceso del empleado únicamente al entorno de su contratante. |
| email | String, UQ | Correo de acceso. | Identificador de inicio de sesión y vector principal para la recuperación de cuentas. |
| password\_hash | String | Contraseña encriptada. | Mecanismo de validación criptográfica para la autenticación segura. Nunca se guarda en texto claro. |
| full\_name | String | Nombre de pila del empleado. | Elemento de socialización en la interfaz y reportes. |

### **Catálogo: roles (Catálogo de roles)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador del rol. | Llave del conjunto de reglas. |
| tenant\_id | UUID, FK | Empresa propietaria. | Permite que cada empresa defina sus propios perfiles de puesto. |
| name | String | Etiqueta del cargo (ej. Recepcionista). | Forma legible de clasificar un grupo de permisos. |
| permissions | JSONB | Matriz de acciones permitidas. | Motor del modelo RBAC (Role-Based Access Control). Define a nivel de código a qué módulos o botones tiene acceso el rol. |

### **Ente Maestro: user\_roles (Asignación de roles contextual)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| user\_id | UUID, FK, PK | El empleado asignado. | Parte de la clave compuesta que une al sujeto. |
| role\_id | UUID, FK, PK | El nivel de acceso otorgado. | Parte de la clave compuesta que une la regla. |
| branch\_id | UUID, FK, PK | Sede específica (Opcional). | Clave de granularidad. Habilita una seguridad dimensional: el empleado puede ser administrador general, o solo tener control dentro de una sucursal específica. |

## **Dominio 2: Catálogo de Servicios**

---

Define qué se vende/reserva y bajo qué reglas lógicas.

### **Catálogo: service\_categories**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la categoría. | Identificador único. |
| tenant\_id | UUID, FK | Dueño de la categoría. | Aislamiento lógico de configuración. |
| name | String | Nombre del grupo (ej. Cardiología, Belleza). | Agrupa lógicamente los servicios para facilitar la navegación del cliente en el front-end. |

### **Ente Maestro: services**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador del servicio ofertado. | Punto de conexión para precios, agendas e historial de reservas. |
| tenant\_id | UUID, FK | Dueño del servicio. | Aislamiento de la oferta. |
| category\_id | UUID, FK | Categoría agrupadora a la que pertenece. | Define su posición en el árbol de navegación comercial. |
| name | String | Nombre comercial (ej. Limpieza Dental). | Texto público que el cliente final ve y selecciona. |
| base\_duration\_minutes | Integer | Tiempo estándar que consume el servicio. | Parámetro crítico para la función de encaje de bloques en el motor de reservas; define cuánto calendario "consume". |
| base\_price | Decimal | Costo monetario referencial. | Monto a facturar o mostrar al cliente antes de modificaciones/descuentos. |
| custom\_attributes | JSONB | Características dinámicas extra. | Extensibilidad sin alterar esquema. Almacena requisitos médicos o de edad aplicables a la lógica del front-end. |
| is\_active | Boolean | Visibilidad en el catálogo. | Interruptor comercial que permite ocultar servicios descontinuados sin borrar el historial transaccional. |

### **Catálogo: service\_policies (Reglas de negocio)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la política. | Llave técnica. |
| service\_id | UUID, FK, UQ | Servicio gobernado por la política. | Vínculo 1 a 1; establece el comportamiento comercial estricto del servicio. |
| min\_advance\_booking\_hours | Integer | Antelación mínima permitida para reservar. | Bloquea reservas de "último minuto" para evitar la llegada sorpresiva de clientes sin el recurso preparado. |
| max\_advance\_booking\_days | Integer | Límite máximo a futuro para reservar. | Evita compromisos de capacidad a muy largo plazo que la empresa no pueda sostener. |
| buffer\_before\_minutes | Integer | Tiempo de preparación antes del servicio. | Espacio "muerto" que el sistema debe reservar obligatoriamente antes de la cita (ej. para limpiar la sala). |
| buffer\_after\_minutes | Integer | Tiempo de cierre tras el servicio. | Espacio de descanso o ventilación posterior, bloqueado en la agenda para no encimar clientes. |
| requires\_admin\_confirmation | Boolean | Necesidad de validación humana. | Modifica la máquina de estados: la reserva nace en estado "pending" en lugar de "confirmed", requiriendo acción manual del staff. |
| cancel\_threshold\_hours | Integer | Ventana de tiempo de cancelación libre. | Lógica de penalización; si el cliente cancela cruzando este límite, el sistema puede gatillar flujos de cobro de penalidad. |
| reschedule\_threshold\_hours | Integer | Ventana para reprogramaciones voluntarias. | Restringe cambios de fecha de última hora que perjudican la agenda diaria. |
| allow\_client\_cancellation | Boolean | Permiso del cliente para cancelar. | Habilita o deshabilita el botón de "Cancelar Cita" en el portal de autoservicio. |
| allow\_client\_reschedule | Boolean | Permiso del cliente para reprogramar. | Habilita o deshabilita el botón de "Cambiar Fecha" en el portal de autoservicio. |

### **Catálogo: service\_reminder\_rules**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la regla de recordatorio. | Llave técnica. |
| tenant\_id | UUID, FK | Empresa que define la regla. | Aislamiento de configuración. |
| service\_id | UUID, FK | Servicio asociado. | Asocia el flujo de mensajería con el acto específico (ej. recordatorio de ayuno para exámenes). |
| minutes\_before | Integer | Tiempo de antelación del envío. | Gatillo temporal para el Job Scheduler que programa la emisión del mensaje. |
| template\_id | UUID, FK | Molde del mensaje a enviar. | Define qué texto/contenido exacto se utilizará en la notificación saliente. |
| is\_active | Boolean | Estado del recordatorio. | Permite pausar la campaña de recordatorios de un servicio. |

### **Catálogo: service\_resources (Recursos requeridos)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| service\_id | UUID, FK, PK | El servicio que se configurará. | Clave compuesta. |
| resource\_type\_id | UUID, FK, PK | Tipo de recurso demandado (ej. Médico, Sala). | Clave compuesta. Estructura un modelo de dependencia de N recursos cruzados. |
| quantity\_required | Integer | Cantidad requerida del recurso. | Algoritmo de ensamblaje: el motor de reservas debe encontrar "N" instancias disponibles de este tipo de recurso simultáneamente para poder ofertar un horario. |

## **Dominio 3: Recursos y Agenda**

---

Gestiona la capacidad instalada y los horarios base. La disponibilidad real es un producto derivado.

### **Catálogo: resource\_types**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID del tipo. | Llave única. |
| tenant\_id | UUID, FK | Empresa creadora. | Aislamiento de taxonomía. |
| name | String | Clasificación (ej. Staff, Sala, Equipo\_Medico). | Abstracción que permite agrupar inventario operativo fungible para las reglas de asignación. |

### **Ente Maestro: resources (El recurso físico o humano)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID exacto del recurso (Ej. Dr. Pérez, Sala 3). | El nodo central sobre el cual recaen las reservas; es el "qué" o "quién" se bloquea. |
| tenant\_id | UUID, FK | Empresa propietaria. | Aislamiento. |
| branch\_id | UUID, FK | Ubicación geográfica asignada. | Restringe el uso de este recurso físicamente a la sucursal determinada. |
| type\_id | UUID, FK | A qué tipo o grupo pertenece. | Define qué rol juega en el encadenamiento de recursos del Catálogo de Servicios. |
| name | String | Nombre humano del recurso. | Forma visual de mostrarlo en calendarios (Ej. "Consultorio 402"). |
| capacity | Integer | Capacidad de atención simultánea. | Poderosa regla de concurrencia. Si es 1 (Médico), se bloquea al primer turno. Si es 50 (Aula virtual), permite agendar a 50 clientes a la misma hora exacta. |

### **Catálogo: resource\_availability\_rules (Horario Laboral)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la regla base. | Llave de la declaración de disponibilidad. |
| resource\_id | UUID, FK | A quién aplica. | Vincula el turno de trabajo con el activo/persona. |
| day\_of\_week | Integer (1-7) | Día de la semana. | Base cíclica de la matriz de horarios laborales. |
| start\_time | Time | Inicio de jornada diaria. | Apertura del recurso (ej. Marca la hora de entrada del empleado). |
| end\_time | Time | Fin de jornada diaria. | Cierre del recurso (ej. Marca la salida del empleado). |
| valid\_from | Date | Inicio de vigencia de la regla. | Permite programar turnos que cambian en el futuro (ej. Horario de verano) sin sobreescribir el horario histórico. |
| valid\_to | Date (Nullable) | Fin de la vigencia de la regla. | Caduca la aplicación del turno. Si es nulo, el horario es indefinido en el tiempo. |

### **Catálogo: resource\_breaks (Pausas dentro del horario laboral)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador de la pausa. | Llave técnica. |
| availability\_rule\_id | UUID, FK | A qué jornada laboral se engancha. | Establece dependencia directa; si la regla cambia, los descansos deben evaluarse en su contexto. |
| start\_time | Time | Hora de inicio de descanso. | Sector temporal recortado (restado) del horario laboral general. |
| end\_time | Time | Hora de fin de descanso. | Reanudación de la disponibilidad del recurso. |

### **Ente Transaccional: resource\_time\_off (Vacaciones, licencias)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la excepción. | Llave técnica. |
| resource\_id | UUID, FK | Al recurso afectado. | Destinatario de la ausencia programada. |
| start\_datetime | Timestamp UTC | Inicio de la ausencia. | Invalida permanentemente los turnos generados dentro de esta franja de fechas/horas. |
| end\_datetime | Timestamp UTC | Fin de la ausencia. | Restaura la generación de disponibilidad desde este punto en adelante. |
| reason | String | Justificación administrativa. | Contexto de recursos humanos o mantenimiento (ej. "Licencia por enfermedad", "Pintado de la sala"). |

### **Catálogo: resource\_service\_overrides**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la anulación/sobrescritura. | Llave técnica. |
| tenant\_id | UUID, FK | Aislamiento de la regla. | Seguridad operativa. |
| resource\_id | UUID, FK | El especialista que ejecuta de manera diferente. | El sujeto de la alteración. |
| service\_id | UUID, FK | El servicio que es modificado. | El objeto que sufre la alteración. |
| duration\_override\_minutes | Integer | Nuevo tiempo de duración del servicio. | Modifica la lógica de consumo en agenda. Permite que un "Estilista Experto" demore 30 min, mientras el servicio base dice 60 min. |
| price\_override | Decimal | Tarifa personalizada. | Modifica el motor de facturación; permite que recursos Premium o Senior tengan un costo diferenciado (pricing dinámico escalonado). |

### **Ente Maestro: calendar\_sync\_accounts**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la integración. | Llave técnica. |
| resource\_id | UUID, FK | Recurso/Usuario del calendario externo. | Conecta al humano físico con su herramienta de correo/calendario personal. |
| provider | String | Servicio tecnológico (Google, Outlook). | Determina el adaptador de API que el sistema utilizará para la comunicación bidireccional. |
| sync\_token | String | Credencial técnica (OAuth Token). | Llave de autorización requerida para leer eventos personales y bloquear la agenda del sistema dinámicamente. |

### **Ente Transaccional: agenda\_daily\_snapshots (Caché de disponibilidad)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador del snapshot. | Llave técnica. |
| resource\_id | UUID, FK | Recurso analizado en esta fila. | Objetivo del pre-cálculo de tiempo. |
| date | Date | Día exacto pre-calculado. | Referencia temporal principal de la vista. |
| timeline | JSONB | Matriz que divide el día y estado de cada ranura temporal. | Optimización crítica de alto rendimiento. En vez de procesar "on-the-fly" cientos de reglas para devolver las horas disponibles a un cliente en la web, el sistema lee directamente este objeto pre-computado. |
| last\_calculated\_at | Timestamp UTC | Última vez que el cronjob actualizó esta fila. | Mecanismo de frescura para saber si el caché debe invalidarse frente a cambios muy recientes. |

## **Dominio 4: Clientes**

---

Identidad, historial y preferencias del usuario final.

### **Ente Maestro: customers**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador único del cliente. | Centro del perfilamiento y CRM; agrupa todo su historial transaccional en la empresa. |
| tenant\_id | UUID, FK | Empresa en la cual se empadronó. | Impide que "Juan" se mezcle entre la Empresa A y la Empresa B, aislando la base de datos de leads. |
| first\_name | String | Nombres. | Personalización del trato y mensajería. |
| last\_name | String | Apellidos. | Identidad legal u operativa. |
| email | String | Correo electrónico. | Llave natural de contacto primario y validación de usuarios recurrentes. |
| phone | String | Número de teléfono o móvil. | Canal alternativo y principal para SMS/WhatsApp. |
| timezone | String | Zona horaria en la que vive el cliente. | Esencial para enviarle recordatorios y renderizar su agenda adaptada a donde se encuentra geográficamente, no donde está el negocio físico. |
| preferences | JSONB | Ajustes personalizados en formato libre. | Micro-datos flexibles (ej. "Prefiere idioma inglés", "Prefiere contacto por SMS") sin esquemas estrictos. |
| consent\_signed | Boolean | Indicador de aceptación de términos. | Salvaguarda de cumplimiento legal (GDPR / Políticas de Privacidad). |

### **Catálogo: customer\_notification\_preferences**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la preferencia de comunicación. | Llave técnica. |
| customer\_id | UUID, FK | Cliente dueño de la regla. | Perfil de quien define los permisos. |
| topic\_id | UUID, FK | Tipo de notificación (Ej. Marketing). | El canal de contenido sujeto a decisión. |
| channel\_id | UUID, FK | Medio técnico de entrega (Ej. Email, SMS). | El conducto tecnológico afectado. |
| is\_enabled | Boolean | Estado (Opt-in o Opt-out). | Switch mandatorio que el orquestador de notificaciones verifica antes de disparar un mensaje; si es false, el envío se corta. |
| updated\_at | Timestamp UTC | Última modificación de su preferencia. | Trazabilidad para disputas sobre "spam" o correos no deseados. |

### **Ente Transaccional: customer\_notes**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador de la bitácora. | Llave técnica. |
| customer\_id | UUID, FK | Cliente documentado. | Historial al que se le anexa el comentario. |
| note\_text | Text | Contenido redactado por un humano. | Almacena inteligencia de servicio al cliente (ej. "Es alérgico al yodo", "Cliente conflictivo"). |
| created\_by | UUID, FK | Usuario del staff que redactó la nota. | Responsabilidad administrativa sobre lo escrito. |
| created\_at | Timestamp UTC | Fecha de inserción de la nota. | Línea temporal del CRM interno. |

## **Dominio 5: Reservas (Core Transaccional)**

---

Ciclo de vida completo de la cita operativa.

### **Ente Transaccional: booking\_locks (Control de Concurrencia \- Pre-reserva)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID del bloqueo temporal. | Mecanismo efímero o manual. |
| resource\_id | UUID, FK | Activo restringido. | Apunta al elemento cuya disponibilidad debe desaparecer del radar. |
| starts\_at | Timestamp UTC | Inicio de la franja bloqueada. | Límite inferior del secuestro temporal de la agenda. |
| ends\_at | Timestamp UTC | Fin de la franja bloqueada. | Límite superior del secuestro de agenda. |
| lock\_type | Enum | Naturaleza del bloqueo (transaccional, manual, mantenimiento). | Diferencia si el bloqueo es del sistema mientras un cliente paga (transaccional) o si es forzado por un administrador por necesidad técnica. |
| reason | String | Justificación de la exclusión manual. | Contexto humano ("Limpieza", "Reunión"). |
| locked\_by\_user\_id | UUID, FK (Nullable) | Auditoría de imposición de bloqueo. | Nulo si es automático; poblado si un staff bloqueó manualmente la hora. |
| locked\_at | Timestamp UTC | Momento en que se generó la acción. | Métrica de tiempo de inicio. |
| expires\_at | Timestamp UTC | Momento de auto-destrucción del registro. | Lógica de autolimpieza (Garbage Collection); vital en transacciones web (el cliente no terminó de pagar, a los 15 minutos el bloqueo expira y libera la hora para otro). |

### **Ente Transaccional: bookings (Cabecera de Reserva)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador maestro del evento. | La entidad comercial y operativa más importante; pivote para cobros y ejecuciones. |
| tenant\_id | UUID, FK | Empresa donde ocurrió. | Aislamiento del registro. |
| branch\_id | UUID, FK | Lugar de la ocurrencia. | Contexto geográfico para analíticas. |
| service\_id | UUID, FK | Qué se va a entregar. | El producto comprometido en el contrato implícito. |
| customer\_id | UUID, FK | Quién recibirá el servicio. | El destinatario y responsable del lado de la demanda. |
| starts\_at | Timestamp UTC | Momento del inicio estipulado. | Consumo rígido del inventario temporal. |
| ends\_at | Timestamp UTC | Momento de finalización calculada. | Fin del compromiso temporal. |
| customer\_timezone | String | Zona horaria del cliente en ese instante. | Congela el contexto geográfico de la promesa, útil para notificaciones sin problemas de horario de verano. |
| status | Enum | Estado de vida (draft, pending, confirmed, cancelled, rescheduled, completed, no\_show). | El "Estado" rige el comportamiento de la máquina transaccional. Gobierna visualizaciones, gatillos de correos y reglas contables (ej. un 'no\_show' puede ser cobrado o no). |
| source\_channel | String | Por dónde ingresó (web, admin, whatsapp). | Dato para analítica de marketing y canales de conversión. |
| notes | Text | Indicaciones excepcionales asociadas a este encuentro. | Campo de libre uso para peticiones (ej. "Tocar el timbre de abajo"). |
| custom\_data | JSONB | Formularios asociados y contestados. | Captura dinámica de información previa a la cita (ej. Respuestas de triaje de salud) acoplada directo al momento. |
| created\_by | UUID, FK | Empleado que la registró. | Auditoría (si fue hecha presencialmente). |
| created\_at | Timestamp UTC | Momento de inserción. | Para reportes de anticipación. |
| updated\_at | Timestamp UTC | Última mutación del registro. | Sincronización de sistemas periféricos. |

### **Ente Transaccional: booking\_resource\_allocations**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| booking\_id | UUID, FK, PK | La reserva en cuestión. | Vincula el compromiso. |
| resource\_id | UUID, FK, PK | El recurso exacto ocupado. | Resuelve la relación Muchos a Muchos, ya que una cita (ej. Cirugía) puede secuestrar a un Médico, un Anestesiólogo y a un Quirófano en simultáneo. |

### **Ente Transaccional: booking\_status\_history (Trazabilidad)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la instantánea de mutación. | Llave técnica. |
| booking\_id | UUID, FK | A qué reserva corresponde el cambio. | Asociación directa para generar la línea de tiempo. |
| previous\_status | String | Estado anterior en el que se encontraba. | Detecta de dónde provenía el flujo en el diagrama de estados. |
| new\_status | String | Nuevo estado asignado. | Hacia dónde transicionó la reserva. |
| reason | String | Contexto del cambio. | Justificación humana de por qué cambió su naturaleza. |
| changed\_by\_user\_id | UUID, FK | Usuario staff que forzó la alteración. | Auditoría crítica para evitar abusos o manipulaciones ocultas. |
| changed\_at | Timestamp UTC | Momento milimétrico del evento. | Para construir gráficos de ciclo temporal de servicio. |

### **Ente Transaccional: booking\_cancellations**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Registro formal de la baja. | Identificador único del documento de anulación. |
| booking\_id | UUID, FK, UQ | Reserva truncada. | Relación estricta 1 a 1 (una reserva se cancela una vez y se muere). |
| reason\_code | String | Categoría predefinida de baja. | Permite agrupar estadísticas para tableros BI (ej. "Costo\_muy\_alto", "Emergencia\_Medica"). |
| description | Text | Explicación ampliada. | Detalle textual en caso de códigos genéricos. |
| cancelled\_by\_user\_id | UUID, FK | Responsable operativo. | Rastrea qué humano del sistema dio la orden de destrucción del compromiso. |
| cancelled\_at | Timestamp UTC | Momento del suceso. | Se usa para validar si la cancelación rompió la política de penalización de tiempo. |

### **Ente Transaccional: booking\_reschedules**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Registro de la mutación de tiempo. | Llave técnica. |
| booking\_id | UUID, FK | Reserva modificada. | La base transaccional afectada. |
| original\_starts\_at | Timestamp UTC | Fecha original antes del cambio. | Conserva la evidencia del acuerdo inicial. |
| original\_ends\_at | Timestamp UTC | Fin original. | Conserva el bloque inicial. |
| new\_starts\_at | Timestamp UTC | Nueva fecha concertada. | El nuevo acuerdo de inicio validado por el sistema. |
| new\_ends\_at | Timestamp UTC | Nuevo fin concertado. | El nuevo espacio ocupado. |
| reason | String | Motivación de la postergación/adelanto. | Información analítica para atención al cliente. |
| rescheduled\_by\_user\_id | UUID, FK (Nullable) | El operador (si aplica). | Nulo si la acción fue autoservicio del cliente final; poblado si el cambio lo orquestó la clínica/empresa. |
| created\_at | Timestamp UTC | Momento de la re-coordinación. | Punto cronológico de la alteración. |

## 

## **Dominio 6: Comunicación**

---

Automatización de notificaciones y contactabilidad.

### **Catálogo: notification\_channels**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador del conducto tecnológico. | Llave técnica. |
| tenant\_id | UUID, FK (Nullable) | Aislamiento de personalización. | Si es nulo, aplica para todo el software (ej. Correo del Sistema Core). Si tiene valor, es un canal traído por el cliente (ej. Su propio bot de WhatsApp). |
| code | String, UQ | Nombre máquina estandarizado. | Clave utilizada en la lógica del código fuente (ej. 'sms', 'push') para inyectar los conectores API correctos. |
| name | String | Nombre legible en la UI. | Visualización amigable (Ej. "Mensaje de Texto"). |
| is\_active | Boolean | Control maestro de conducto. | Permite "apagar" los SMS de emergencia en la plataforma entera sin tocar bases de datos individuales. |

### **Catálogo: notification\_templates**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID de la matriz de texto. | Llave del formato. |
| tenant\_id | UUID, FK | Empresa creadora de los textos. | Permite que cada negocio escriba su propia forma de saludar ("Hola" vs "Estimado"). |
| trigger\_event | String | Evento de la aplicación a escuchar. | Enlaza el mundo de datos con el mundo lógico. Le dice al sistema: "cuando veas booking.confirmed, usa este molde". |
| recipient\_role | Enum | Naturaleza del objetivo receptor. | Asegura que el cliente reciba el texto tipo "Su cita está lista", y el administrador reciba "Nueva cita registrada en su local". |
| content\_template | JSONB/Text | Contenido con variables de interpolación. | El cuerpo crudo (con variables como {{client\_name}}) que el motor de renderizado inyectará con datos en tiempo de ejecución. |

### **Catálogo: notification\_topics**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Categoría de la mensajería. | Clasificador de temáticas. |
| tenant\_id | UUID, FK (Nullable) | Dueño de la categoría de interés. | Igual que channels, puede ser global o del tenant. |
| code | String, UQ | Nombre técnico agrupador. | Utilizado para lógica programática y referenciación en logs. |
| name | String | Nombre humano del tópico. | Lo que el usuario ve en su panel de configuración de privacidad (ej. "Boletín Mensual"). |
| is\_mandatory | Boolean | Nivel de criticidad legal/operativa. | Si es verdadero (recuperar password, facturas), anula cualquier "Opt-out" en la tabla de preferencias y garantiza el envío legal. |

### **Ente Transaccional: notification\_events (Cola de envíos)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Trabajo atómico de envío (Job). | Entidad viva para los workers o colas (RabbitMQ/SQS). |
| tenant\_id | UUID, FK | De dónde proviene el envío. | Separación para imputación de costos (facturación de SMS). |
| booking\_id | UUID, FK | Asociación transaccional matriz. | Da trazabilidad ("Este SMS se envió por esta reserva específica"). |
| template\_id | UUID, FK | Qué molde se usó. | Conexión con el formato de mensaje. |
| recipient\_type | Enum | Si el objetivo es cliente o staff. | Ayuda a resolver dinámicamente qué tabla buscar para interpolar nombres y datos. |
| recipient\_id | UUID | A quién se manda el impacto. | La entidad final destinataria. |
| contact\_point | String | El teléfono o correo usado. | Se guarda crudo en el momento del evento para tener una foto histórica inmutable, aunque el usuario cambie su correo un año después. |
| status | Enum | Estado del ciclo de envío. | Permite procesar reintentos en fallos y marcar éxitos ('sent'). |
| scheduled\_for | Timestamp UTC | Hora programada. | Motor asíncrono que posterga el gatillo de la función de envío (Cron timing). |
| sent\_at | Timestamp UTC | Acuse de salida o recibo. | Métrica de latencia y éxito transaccional. |

## **Dominio 7: Gobierno, Integración y Trazabilidad**

---

Soporte operativo avanzado, interoperabilidad y ciberseguridad.

### **Ente Transaccional: auth\_access\_logs**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador del intento de sesión. | Registro atómico de seguridad. |
| tenant\_id | UUID, FK (Nullable) | Empresa objetivo del ataque/acceso. | Nulo si el intruso no logró identificar ni siquiera el subdominio. |
| user\_id | UUID, FK (Nullable) | Usuario verificado. | Nulo si ingresaron un correo falso que no existe en BD. |
| email\_attempted | String | Correo crudo ingresado. | Crucial forense para detectar diccionarios de fuerza bruta y predecir vectores de ataque al personal. |
| event\_type | Enum | Tipología del evento en puerta. | Define si fue entrada, bloqueo, o solicitud de clave; permite modelar alarmas automatizadas de ciberseguridad (SIEM). |
| failure\_reason | String (Nullable) | Explicación del rechazo. | Categorización forense ("Contraseña mal", "Suspendido"). |
| ip\_address | String | Origen de red del intento. | Vital para sistemas de bloqueo perimetral, banneos geográficos o listas negras por red (Firewalls). |
| user\_agent | Text | Huella del dispositivo/navegador. | Ayuda a discernir accesos humanos legítimos de scripts automatizados (bots). |
| created\_at | Timestamp UTC | Sello de tiempo absoluto. | Ordena la secuencia forense obligatoria de eventos UTC. |

### **Ente Transaccional: audit\_logs**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID del registro histórico general. | Llave técnica. |
| tenant\_id | UUID, FK | Contexto legal de los datos. | Garantiza exportaciones limpias y segregadas de auditoría por empresa. |
| entity\_type | String | Qué tabla/colección sufrió mutación. | Referencia elíptica (Polimorfismo) al área modificada. |
| entity\_id | UUID | Id del registro que fue tocado. | Punto de contacto dinámico con el registro mutado. |
| action | String | Naturaleza del toque. | Si fue creación (C), actualización (U), o eliminación (D) en paradigma CRUD. |
| changes | JSONB | Delta (antes/después) de los datos. | Evidencia matemática del cambio de estado, facilitando auditorías de fraude (ej. si alguien modificó precios a escondidas). |
| performed\_by | UUID, FK | Quien ejecutó la mutación. | Responsabilidad absoluta sobre la manipulación de base de datos. |
| timestamp | Timestamp UTC | Momento del suceso. | Secuencia histórica inmutable. |

### **Ente Transaccional: webhooks\_outbox (Outbox Pattern)**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | ID del mensaje hacia el exterior. | Asegura la entrega atómica de mensajes asíncronos. |
| tenant\_id | UUID, FK | Empresa que detona el evento. | Para enviar los payloads a las URLs de integración correctas de ese tenant. |
| event\_type | String | Clasificador del evento externo. | Informa al servidor de destino qué modelo de datos esperar. |
| payload | JSONB | El cuerpo del evento congelado. | Carga útil completa lista para inyectarse vía HTTP POST a sistemas externos (Zapier, ERPs). |
| status | Enum | Estado de propagación HTTP. | Garantiza la fiabilidad; si falla, el worker puede retomar el registro 'failed' y reintentar, en lugar de perder silenciosamente la actualización. |
| created\_at | Timestamp UTC | Momento de creación del intento. | Métrica de frescura de la integración. |

### **Ente Transaccional: schedule\_overrides\_history**

| Atributos | Naturaleza | Semántica | Ontología |
| :---- | :---- | :---- | :---- |
| id | UUID, PK | Identificador del histórico de agenda. | Llave técnica. |
| resource\_id | UUID, FK | A qué recurso se le alteró el calendario. | Auditoría enfocada en RRHH o salas. |
| changed\_by\_user\_id | UUID, FK | El staff que empujó el cambio. | Responsabilidad humana por mover los bloques horarios generales. |
| change\_reason | String | Justificación documentada. | Información para gerencia (por qué de pronto se abrió un domingo). |
| previous\_schedule\_payload | JSONB | Foto de la configuración previa. | Permite un "Ctrl+Z" (rollback) lógico a un estado anterior o peritajes en caso de daño accidental del catálogo maestro de horarios. |
| created\_at | Timestamp UTC | Momento exacto del cambio. | Posicionamiento cronológico. |

