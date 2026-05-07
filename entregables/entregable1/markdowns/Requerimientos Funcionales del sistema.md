**1\. REQUERIMIENTOS FUNCIONALES (RF)**

**Módulo 1: Autenticación y Gestión de Perfiles**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RF-01 | Registro de Usuarios | El sistema deberá permitir el registro de usuarios mediante correo electrónico y contraseña, validando la unicidad del correo y el cumplimiento de políticas de seguridad definidas por la organización. | Alta |
| RF-02 | Autenticación de Usuarios | El sistema deberá autenticar a los usuarios mediante credenciales válidas y generar sesiones seguras utilizando mecanismos de autenticación basados en tokens. | Alta |
| RF-03 | Recuperación de Credenciales | El sistema deberá permitir la recuperación y restablecimiento de contraseña a través de enlaces temporales enviados al correo electrónico registrado por el usuario. | Alta |
| RF-04 | Administración de Perfil | El sistema deberá permitir a los usuarios visualizar, actualizar y mantener su información personal y de contacto, garantizando la integridad de los datos registrados. | Media |
| RF-05 | Gestión de Roles y Permisos | El sistema deberá administrar perfiles de acceso diferenciados (Administrador y Cliente), restringiendo funcionalidades y recursos según el rol asignado. | Alta |
| RF-06 | Cierre Seguro de Sesión | El sistema deberá permitir a los usuarios finalizar su sesión de manera segura, invalidando los tokens activos asociados a la autenticación. | Media |
| RF-07 | Auditoría de Accesos | El sistema deberá registrar eventos relacionados con el acceso de usuarios, incluyendo inicio de sesión, cierre de sesión e intentos fallidos de autenticación. | Media |

**Módulo 2: Gestión de Disponibilidad y Agenda (Arquitectura CQS)**

El sistema deberá implementar el principio **Command Query Separation (CQS)**, separando estrictamente las operaciones de consulta de aquellas que modifican el estado de la disponibilidad.

**Consultas de Disponibilidad**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RF-08 | Consulta de Disponibilidad | El sistema deberá permitir la consulta de horarios disponibles sin alterar el estado interno de las agendas o reservas existentes. | Alta |
| RF-09 | Visualización de Agenda | El sistema deberá proporcionar una vista estructurada de la agenda, mostrando el estado de cada bloque horario (Disponible, Reservado o Bloqueado). | Alta |
| RF-10 | Consulta Dinámica de Slots | El sistema deberá calcular dinámicamente los espacios disponibles considerando duración de servicio, bloqueos y citas previamente registradas. | Alta |
| RF-11 | Consulta Histórica de Disponibilidad | El sistema deberá permitir la consulta histórica de cambios realizados sobre la disponibilidad y agenda del servicio. | Media |

**Gestión de Disponibilidad**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RF-12 | Configuración de Horarios | El sistema deberá permitir al administrador definir horarios de atención, jornadas laborales y rangos de disponibilidad por servicio o profesional. | Alta |
| RF-13 | Bloqueo Manual de Horarios | El sistema deberá permitir bloquear intervalos de tiempo específicos por motivos operativos, mantenimiento, descanso o eventos externos. | Alta |
| RF-14 | Actualización Automática de Disponibilidad | El sistema deberá actualizar automáticamente la disponibilidad luego de una reserva, cancelación o reprogramación de cita. | Alta |
| RF-15 | Configuración de Duración de Servicios | El sistema deberá permitir configurar la duración estimada de cada tipo de servicio ofrecido. | Media |
| RF-16 | Gestión de Excepciones de Agenda | El sistema deberá permitir registrar excepciones temporales en la agenda, tales como feriados, horarios especiales o ausencias del personal. | Media |

**Módulo 3: Gestión de Agendamiento de Clientes**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RF-17 | Reserva de Citas | El sistema deberá permitir a los clientes reservar citas seleccionando servicio, fecha y horario disponible dentro de la agenda habilitada. | Alta |
| RF-18 | Confirmación de Reserva | El sistema deberá confirmar automáticamente la creación de la cita y registrar el estado correspondiente dentro del sistema. | Alta |
| RF-19 | Cancelación de Citas | El sistema deberá permitir la cancelación de citas conforme a las políticas establecidas por la organización. | Alta |
| RF-20 | Reprogramación de Citas | El sistema deberá permitir modificar la fecha y hora de citas previamente registradas, validando nuevamente la disponibilidad. | Alta |
| RF-21 | Consulta de Historial de Citas | El sistema deberá permitir a los usuarios visualizar el historial de citas realizadas, canceladas y pendientes. | Media |
| RF-22 | Prevención de Doble Reserva | El sistema deberá impedir la generación de reservas simultáneas sobre un mismo bloque horario. | Alta |
| RF-23 | Gestión de Estados de Cita | El sistema deberá gestionar estados de cita tales como Pendiente, Confirmada, Cancelada, Reprogramada y Finalizada. | Alta |
| RF-24 | Visualización de Próximas Citas | El sistema deberá mostrar al usuario las próximas citas programadas y su información asociada. | Media |

**Módulo 4: Gestión de Notificaciones y Recordatorios**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RF-25 | Notificación de Confirmación | El sistema deberá enviar automáticamente una notificación de confirmación al cliente al momento de registrar una cita. | Alta |
| RF-26 | Recordatorios Automáticos | El sistema deberá generar y enviar recordatorios previos a la cita según configuraciones definidas por el administrador. | Alta |
| RF-27 | Notificación de Cancelación | El sistema deberá informar automáticamente la cancelación de citas tanto al cliente como al administrador correspondiente. | Alta |
| RF-28 | Notificación de Reprogramación | El sistema deberá notificar modificaciones realizadas sobre la fecha u hora de una cita previamente registrada. | Alta |
| RF-29 | Soporte Multicanal | El sistema deberá soportar el envío de notificaciones mediante correo electrónico y permitir integración futura con SMS y notificaciones push. | Media |
| RF-30 | Configuración de Preferencias de Notificación | El sistema deberá permitir que los usuarios definan preferencias relacionadas con frecuencia y canales de notificación. | Media |