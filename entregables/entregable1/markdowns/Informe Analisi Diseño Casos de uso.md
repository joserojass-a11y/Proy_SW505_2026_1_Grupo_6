**Definición de actores**

**Actores del Negocio**

Estos son los roles que interactúan en la vida real dentro de los procesos de la empresa (clínicas, salones, talleres o tutorías), independientemente de si usan software o no.

- **Cliente:** Es la persona física que tiene la necesidad de adquirir o recibir un servicio brindado por el establecimiento. Su objetivo principal dentro del negocio es agendar un espacio y recibir la atención o servicio.
- **Administrador / Profesional:** Es la persona o conjunto de personas encargadas de gestionar el local y de brindar el servicio. Sus objetivos incluyen definir en qué momentos están disponibles para trabajar y organizar la atención de los clientes para mantener el orden en el negocio.

**Actores del Sistema**

Estos son los roles que tendrán un perfil de acceso diferenciado dentro de la plataforma de reservas.

- **Cliente (Actor del Sistema):** Usuario que se registra mediante correo electrónico y contraseña. Interactúa directamente con la plataforma para consultar horarios disponibles, reservar citas en un máximo de tres pasos, cancelar o reprogramar sus reservas, y configurar sus preferencias de notificaciones.
- **Administrador (Actor del Sistema):** Usuario con privilegios superiores dentro de la plataforma. Es el responsable de configurar los horarios de atención y jornadas laborales, realizar bloqueos manuales de horarios por descansos o mantenimiento, configurar la duración de los servicios, y visualizar la agenda general con el estado de todos los bloques horarios.

**Análisis: Casos de Uso del Negocio**

En esta sección se definen los procesos macro que ejecuta el negocio para cumplir con su propósito de agendamiento y atención de servicios.

CUN-01: Gestionar Agendamiento y Atención de Citas

- **Actores del Negocio involucrados:** Cliente, Administrador / Profesional.
- **Propósito:** Administrar el ciclo completo de la reserva, desde la solicitud inicial del cliente hasta la confirmación, posibles modificaciones y la ejecución del servicio.
- **Descripción del proceso:** Este proceso abarca el momento en que un cliente solicita un servicio, la verificación de los espacios disponibles en el local, la confirmación de la cita, y la gestión de imprevistos (cancelaciones o reprogramaciones). Finaliza cuando el cliente recibe el servicio (en la clínica, salón o tutoría). Este proceso busca asegurar que la atención sea ordenada y que el cliente reciba los recordatorios necesarios.

CUN-02: Gestionar Disponibilidad y Operatividad del Negocio

- **Actores del Negocio involucrados:** Administrador / Profesional.
- **Propósito:** Organizar los tiempos de atención, las jornadas laborales y la oferta de servicios para mantener el orden interno del establecimiento.
- **Descripción del proceso:** Incluye todas las actividades administrativas para definir los horarios en los que el local o los profesionales están disponibles para trabajar. Abarca la estructuración de la agenda, la definición de cuánto dura cada servicio, y la gestión de excepciones operativas (como bloquear horarios por descansos, mantenimiento del local, feriados o ausencias del personal). El objetivo de este proceso es evitar cualquier tipo de cruce o doble reserva que afecte la atención al público.

**Diseño: Casos de Uso de Sistema**

De acuerdo con los requerimientos no funcionales y la arquitectura del proyecto, el sistema implementa estrictamente el principio **CQS (Command Query Separation)**. Esto significa que los casos de uso se dividen claramente en **Consultas (Queries)**, que devuelven información sin alterar el estado del sistema, y **Comandos (Commands)**, que modifican la disponibilidad y las citas.

A continuación, se detallan los Casos de Uso de Sistema para los módulos principales, respetando el control de acceso por roles.

**Grupo de Gestión de Disponibilidad y Agenda**

**A. Casos de Uso de Consulta (Queries)** _Estos casos de uso no modifican datos, solo leen el estado actual._

- **CUS-01: Consultar Disponibilidad de Horarios**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite a los usuarios visualizar los horarios disponibles calculados dinámicamente según la duración del servicio, bloqueos y citas previas, sin alterar el estado interno de la agenda.
    - **Restricción Técnica:** Esta consulta debe ejecutarse y responder en un tiempo máximo de 2 segundos (RNF-03).
- **CUS-02: Visualizar Agenda Estructurada**
    - **Actor:** Administrador.
    - **Descripción:** Proporciona al administrador una vista completa de la agenda del local, mostrando el estado exacto de cada bloque horario: Disponible, Reservado o Bloqueado.

**B. Casos de Uso de Modificación (Commands)** _Estos casos de uso cambian el estado del sistema y actualizan la base de datos._

- **CUS-03: Configurar Horarios y Servicios**
    - **Actor:** Administrador.
    - **Descripción:** Permite al administrador definir las jornadas laborales, rangos de disponibilidad y configurar la duración estimada de cada tipo de servicio ofrecido.
- **CUS-04: Gestionar Bloqueos y Excepciones de Agenda**
    - **Actor:** Administrador.
    - **Descripción:** Permite realizar el bloqueo manual de intervalos de tiempo por descansos, mantenimiento o eventos externos. También incluye el registro de excepciones como días feriados o ausencias del personal.

**Grupo de Gestión de Agendamiento de Clientes**

**A. Casos de Uso de Modificación (Commands)**

- **CUS-05: Reservar Cita**
    - **Actor:** Cliente.
    - **Descripción:** Permite al cliente seleccionar un servicio, una fecha y un horario disponible para generar una cita. El sistema confirma automáticamente el registro y actualiza el estado de la cita a "Pendiente" o "Confirmada".
    - **Restricciones Clave:** Para optimizar la experiencia, **el flujo completo de esta reserva no debe exceder los 3 pasos principales** (RNF-20). Además, el sistema ejecutará validaciones de concurrencia para impedir cualquier doble reserva sobre el mismo bloque horario (RNF-02, RF-22).
- **CUS-06: Cancelar Cita**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite anular una cita previamente registrada, actualizando su estado a "Cancelada" y liberando automáticamente la disponibilidad del bloque horario en el sistema.
- **CUS-07: Reprogramar Cita**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite modificar la fecha u hora de una cita existente, validando previamente que el nuevo bloque horario solicitado se encuentre disponible.

**B. Casos de Uso de Consulta (Queries)**

- **CUS-08: Consultar Historial y Próximas Citas**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite al usuario visualizar un listado de sus próximas citas programadas, así como el historial de citas pasadas, canceladas o pendientes, visualizando la información asociada a cada una de ellas.

**Grupo de Autenticación y Gestión de Perfiles**

Este grupo de casos de uso gestiona el acceso seguro a la plataforma y la administración de los datos de los usuarios, cumpliendo con los estándares de seguridad requeridos.

- **CUS-09: Registrar Usuario**
    - **Actor:** Cliente.
    - **Descripción:** El sistema permite el registro de nuevos usuarios mediante correo electrónico y contraseña, validando que el correo sea único y cumpla con las políticas de seguridad.
- **CUS-10: Iniciar Sesión (Autenticar Usuario)**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite a los usuarios acceder al sistema validando sus credenciales y generando una sesión segura basada en tokens (como JWT). El sistema restringe las funcionalidades según el perfil de acceso diferenciado del usuario.
- **CUS-11: Recuperar Contraseña**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite a un usuario restablecer su contraseña olvidada mediante el envío de un enlace temporal a su correo electrónico registrado.
- **CUS-12: Administrar Perfil**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite a los usuarios visualizar, actualizar y mantener al día su información personal y datos de contacto en la plataforma.
- **CUS-13: Cierre Seguro de Sesión**
    - **Actor:** Cliente, Administrador.
    - **Descripción:** Permite al usuario finalizar su sesión activa, asegurando que el sistema invalide los tokens asociados para proteger su cuenta.

**Grupo de Gestión de Notificaciones**

_Nota Arquitectónica:_ La mayoría de las notificaciones ocurren como consecuencia de otra acción, por lo que se modelan como procesos automatizados o extensiones de otros casos de uso.

- **CUS-14: Configurar Preferencias de Notificación**
    - **Actor:** Cliente.
    - **Descripción:** Permite a los usuarios definir sus preferencias sobre la frecuencia y los canales de notificación (como correo electrónico o SMS futuros).
- **CUS-15: Enviar Notificación Automática (Caso de Uso de Inclusión)**
    - **Actor:** Sistema (Actor Secundario).
    - **Descripción:** Es un caso de uso interno que se encarga de enviar correos o alertas. Se ejecuta automáticamente para confirmar reservas, enviar recordatorios previos a la cita, y notificar cancelaciones o reprogramaciones tanto a clientes como a administradores.