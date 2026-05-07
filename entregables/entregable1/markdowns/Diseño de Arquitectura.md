1.  **Introducción**

El presente documento describe la arquitectura de software del sistema “Plataforma de Reservas de Servicios”, orientado a la gestión de citas y disponibilidad para negocios como clínicas, salones, talleres o tutorías.

El sistema permitirá a los usuarios consultar horarios disponibles, reservar citas, cancelar o reprogramar reservas y recibir notificaciones automáticas. Asimismo, permitirá a los administradores gestionar horarios, disponibilidad y excepciones de agenda.

La arquitectura propuesta busca garantizar mantenibilidad, escalabilidad, seguridad y separación clara de responsabilidades mediante una arquitectura modular basada en capas y el principio CQS.

1.  **Objetivos de la arquitectura**
    
    1.  **Objetivo general**
    
    - Definir una arquitectura de software modular y escalable para la plataforma de reservas de servicios, garantizando una adecuada separación de responsabilidades, mantenibilidad, seguridad y soporte para futuras ampliaciones del sistema.
    
    1.  **Objetivos específicos**
    
    - Implementar una arquitectura en capas que permita separar claramente la presentación, lógica de negocio y persistencia de datos.
    - Aplicar el principio CQS (Command Query Separation) para diferenciar las operaciones de consulta y modificación dentro del sistema.
    - Garantizar la cohesión funcional mediante la división del sistema en módulos especializados como autenticación, agenda, reservas y notificaciones.
    - Facilitar la mantenibilidad y evolución del sistema mediante una arquitectura modular basada en principios SOLID.
    - Implementar mecanismos de seguridad para la autenticación y autorización de usuarios utilizando tokens JWT y control de acceso por roles.
    - Permitir la escalabilidad del sistema mediante una estructura desacoplada que soporte crecimiento futuro en usuarios y funcionalidades.
2.  **Requerimientos Arquitectónicos**
    1.  **Escalabilidad**

La arquitectura del sistema debe permitir escalabilidad horizontal y crecimiento progresivo de usuarios y funcionalidades sin afectar el rendimiento general de la plataforma.

Para ello, se propone una arquitectura desacoplada y modular que facilite la distribución de responsabilidades entre componentes independientes, permitiendo futuras ampliaciones del sistema y optimización del procesamiento concurrente de reservas.

- 1.  **Rendimiento y concurrencia**

El sistema debe responder eficientemente a consultas de disponibilidad y operaciones de reserva, garantizando tiempos de respuesta adecuados incluso bajo múltiples solicitudes concurrentes.

La arquitectura debe incorporar mecanismos de control de concurrencia y validación de disponibilidad para evitar conflictos como reservas duplicadas sobre un mismo bloque horario.

- 1.  **Seguridad**

La arquitectura debe garantizar mecanismos seguros de autenticación y autorización mediante el uso de tokens JWT y control de acceso basado en roles.

Asimismo, el sistema debe proteger la comunicación y los datos sensibles utilizando protocolos seguros y validaciones que reduzcan riesgos de acceso no autorizado o vulnerabilidades comunes.

- 1.  **Disponibilidad y Confiabilidad**

El sistema debe mantener una alta disponibilidad operativa y asegurar la integridad de la información relacionada con reservas, horarios y usuarios.

La arquitectura deberá contemplar mecanismos de respaldo, recuperación ante fallos y tolerancia a errores para garantizar estabilidad y continuidad del servicio.

- 1.  **Mantenibilidad**

La arquitectura del sistema debe facilitar el mantenimiento, actualización y evolución del software mediante una estructura modular basada en principios SOLID y separación clara de responsabilidades.

La división del sistema en módulos funcionales independientes permitirá mejorar la reutilización de componentes y reducir el impacto de cambios futuros.

- 1.  **Modularidad y Cohesión Funcional**

El sistema estará organizado en módulos especializados como autenticación, agenda, reservas y notificaciones, garantizando alta cohesión funcional y bajo acoplamiento entre componentes.

Esta organización permitirá una mejor administración de responsabilidades y facilitará la evolución independiente de cada módulo del sistema.

- 1.  **Aplicación del Principio CQS**

La arquitectura implementará el principio CQS (Command Query Separation), diferenciando claramente las operaciones de consulta de aquellas que modifican el estado del sistema.

Las consultas estarán orientadas únicamente a la lectura de información, mientras que las operaciones de modificación gestionarán cambios relacionados con reservas, horarios y disponibilidad.

1.  **Arquitectura seleccionada**
    1.  **Estilo Arquitectónico**

El sistema implementará una arquitectura en capas modular, permitiendo organizar el software mediante responsabilidades claramente definidas y componentes desacoplados.

Esta arquitectura facilita la mantenibilidad, escalabilidad y evolución del sistema, además de alinearse con los requerimientos no funcionales establecidos para el proyecto, especialmente en aspectos de cohesión funcional, modularidad y aplicación del principio CQS.

- 1.  **Organización General de la Arquitectura**

La arquitectura del sistema estará compuesta por múltiples capas encargadas de separar las responsabilidades funcionales y técnicas de la aplicación.

Cada capa tendrá funciones específicas dentro del procesamiento de solicitudes, permitiendo reducir el acoplamiento entre componentes y facilitar futuras modificaciones o ampliaciones.

- 1.  **Arquitectura en Capas**
        1.  **Capa de presentación**

La capa de presentación será responsable de la interacción con los usuarios mediante una interfaz web intuitiva y responsive.

Esta capa permitirá a clientes y administradores acceder a las funcionalidades del sistema como reservas, gestión de horarios, autenticación y visualización de agendas.

- - 1.  **Capa de API REST**

La capa de API REST actuará como punto de comunicación entre el frontend y la lógica de negocio, gestionando solicitudes HTTP y exponiendo los servicios del sistema mediante endpoints organizados por módulos.

- - 1.  **Capa de Aplicación**

La capa de aplicación coordinará los casos de uso del sistema y gestionará las operaciones relacionadas con reservas, autenticación, disponibilidad y notificaciones.

Asimismo, esta capa implementará la separación entre comandos y consultas siguiendo el principio CQS.

- - 1.  **Capa de Dominio**

La capa de dominio contendrá las reglas de negocio principales del sistema, incluyendo validaciones de disponibilidad, control de reservas, gestión de estados de citas y restricciones operativas.

- - 1.  **Capa de Persistencia**

La capa de persistencia será responsable del acceso y almacenamiento de información en la base de datos, utilizando repositorios especializados para cada módulo funcional del sistema.

- 1.  **Arquitectura Modular**

El sistema estará dividido en módulos funcionales independientes que permitirán separar responsabilidades y mejorar la cohesión interna de cada componente.

Los principales módulos identificados son:

- Módulo de Autenticación y Gestión de Perfiles.
- Módulo de Gestión de Disponibilidad y Agenda.
- Módulo de Gestión de Reservas.
- Módulo de Notificaciones y Recordatorios.
    1.  **Aplicación del Principio CQS**

La arquitectura implementará el principio CQS (Command Query Separation), diferenciando claramente las operaciones que modifican el estado del sistema de aquellas destinadas únicamente a consultas de información.

Las operaciones de consulta incluirán funcionalidades como visualización de disponibilidad, historial de citas y agendas, mientras que las operaciones de modificación abarcarán reservas, cancelaciones, reprogramaciones y configuraciones administrativas.

1.  **Diagramas Arquitectónicos**
    1.  **Diagrama General de Arquitectura**

El siguiente diagrama representa la arquitectura general de la plataforma de reservas de servicios, organizada mediante una arquitectura en capas modular.

La estructura propuesta permite separar responsabilidades entre presentación, lógica de negocio, módulos funcionales y persistencia de datos, facilitando la mantenibilidad, escalabilidad y cohesión funcional del sistema.

Figura 1. Diagrama general de arquitectura de la plataforma de reservas de servicios.

La arquitectura del sistema se encuentra organizada en múltiples capas funcionales que permiten desacoplar responsabilidades y mejorar la organización general del software.

La capa de presentación permite la interacción de clientes y administradores mediante una interfaz web desarrollada en React SPA. Posteriormente, las solicitudes son gestionadas por la capa de API REST, encargada de exponer los servicios del sistema mediante controladores y rutas.

La capa de aplicación implementa la lógica relacionada con comandos y consultas bajo el principio CQS, coordinando las operaciones principales del sistema.

Asimismo, el sistema se encuentra dividido en módulos funcionales especializados, incluyendo autenticación, agenda, reservas y notificaciones, permitiendo alta cohesión funcional y bajo acoplamiento entre componentes.

Finalmente, la capa de persistencia gestiona el acceso a datos y almacenamiento de información dentro de la base de datos.

1.  **Descripción de módulos del sistema**

El sistema se encuentra organizado en módulos funcionales independientes, cada uno especializado en responsabilidades específicas relacionadas con la gestión de reservas y disponibilidad.

Esta organización permite mejorar la cohesión funcional, reducir el acoplamiento entre componentes y facilitar el mantenimiento y evolución futura del sistema.

- 1.  **Módulo de autenticación y gestión de Perfiles**

El módulo de autenticación y gestión de perfiles será responsable de administrar el acceso seguro de los usuarios a la plataforma.

Este módulo gestionará funcionalidades como registro de usuarios, inicio y cierre de sesión, recuperación de credenciales, administración de perfiles y control de acceso basado en roles.

Asimismo, implementará mecanismos de autenticación mediante tokens JWT para garantizar sesiones seguras y controladas.

Funciones principales:

- Registro de usuarios.
- Inicio y cierre de sesión.
- Recuperación de contraseña.
- Administración de perfiles.
- Gestión de roles y permisos.
- Autenticación mediante JWT.
    1.  **Módulo de Gestión de Disponibilidad y Agenda**

El módulo de gestión de disponibilidad y agenda será responsable de administrar horarios, disponibilidad y organización de la agenda del sistema.

Este módulo permitirá configurar jornadas laborales, consultar horarios disponibles, gestionar bloqueos y excepciones de agenda, así como visualizar el estado de los espacios disponibles para reservas.

Funciones principales:

- Configuración de horarios.
- Gestión de disponibilidad.
- Bloqueo de intervalos.
- Gestión de excepciones.
- Consulta de horarios.
- Visualización de agenda.
    1.  **Módulo de Gestión de Reservas**

El módulo de reservas será responsable de gestionar el ciclo completo de agendamiento de citas dentro de la plataforma.

Este módulo permitirá registrar reservas, cancelar o reprogramar citas y controlar los estados asociados a cada reserva, garantizando validaciones de disponibilidad y evitando conflictos de concurrencia.

Funciones principales:

- Reservar citas.
- Cancelar reservas.
- Reprogramar citas.
- Gestión de estados.
- Validación de disponibilidad.
- Historial de reservas.
    1.  **Módulo de Notificaciones y recordatorios**

El módulo de notificaciones y recordatorios será responsable de gestionar el envío automático de alertas y comunicaciones relacionadas con las reservas realizadas en el sistema.

Este módulo permitirá enviar confirmaciones, recordatorios, cancelaciones y notificaciones de reprogramación mediante diferentes canales configurados por los usuarios.

Funciones principales:

- Confirmaciones automáticas.
- Recordatorios de citas.
- Notificaciones de cancelación.
- Alertas de reprogramación.
- Gestión de preferencias de notificación.
    1.  **Relación entre módulos**

Los módulos del sistema interactúan de manera coordinada para garantizar el correcto funcionamiento de la plataforma.

Por ejemplo, el módulo de reservas depende de la información proporcionada por el módulo de agenda para validar disponibilidad, mientras que el módulo de notificaciones utiliza eventos generados por reservas y reprogramaciones para enviar alertas automáticas a los usuarios.

1.  **Aplicación del principio CQS**
    1.  **Descripción General del principio CQS**

La arquitectura del sistema implementará el principio CQS (Command Query Separation), el cual establece la separación entre las operaciones encargadas de consultar información y aquellas responsables de modificar el estado del sistema.

Esta separación permite mejorar la organización lógica del software, reducir el acoplamiento y facilitar el mantenimiento y escalabilidad de la aplicación.

- 1.  **Operaciones de Consulta (Queries)**

Las operaciones de consulta estarán orientadas únicamente a la lectura y visualización de información, sin realizar modificaciones sobre los datos almacenados dentro del sistema.

Estas consultas permitirán obtener información relacionada con disponibilidad, agendas y reservas registradas.

Algunos ejemplos de consulta:

- Consultar disponibilidad de horarios.
- Visualizar agenda estructurada.
- Consultar historial de citas.
- Visualizar próximas reservas.
- Consultar información de perfil.
    1.  **Operaciones de Modificación (Commands)**

Las operaciones de modificación serán responsables de realizar cambios sobre el estado del sistema, incluyendo la creación, actualización y cancelación de reservas, así como configuraciones administrativas relacionadas con horarios y disponibilidad.

Algunos ejemplos de modificación:

- Reservar cita.
- Cancelar cita.
- Reprogramar cita.
- Configurar horarios.
- Gestionar bloqueos de agenda.

1.  **Seguridad del sistema**

La arquitectura del sistema incorporará mecanismos de seguridad orientados a proteger la información de usuarios, reservas y disponibilidad dentro de la plataforma.

Para ello, se implementarán controles de autenticación, autorización y protección de datos que permitan garantizar un acceso seguro y controlado a las funcionalidades del sistema.

- 1.  **Autenticación y autorización**

El sistema utilizará mecanismos de autenticación basados en tokens JWT (JSON Web Tokens), permitiendo validar de forma segura la identidad de los usuarios durante cada sesión activa.

Asimismo, la plataforma implementará control de acceso basado en roles, diferenciando permisos y funcionalidades entre clientes y administradores.

- 1.  P**rotección de comunicación**

La comunicación entre clientes y el servidor será protegida mediante protocolos seguros de transmisión como HTTPS/TLS, reduciendo riesgos relacionados con interceptación de información o accesos no autorizados.

- 1.  **Validación y Protección de Datos**

La arquitectura incorporará validaciones de entrada y control de datos para garantizar la integridad de la información almacenada dentro del sistema.

Estas validaciones permitirán reducir inconsistencias y prevenir operaciones inválidas relacionadas con reservas, autenticación y gestión de disponibilidad.

- 1.  **Gestión de Sesiones**

El sistema administrará sesiones seguras mediante el uso de tokens temporales y mecanismos de expiración controlada, garantizando una gestión adecuada de autenticación y acceso a la plataforma.

- 1.  **Beneficios de Seguridad Implementados**

La implementación de mecanismos de seguridad dentro de la arquitectura permitirá:

- Proteger la información de usuarios y reservas.
- Garantizar autenticación segura.
- Controlar permisos según roles.
- Reducir riesgos de accesos no autorizados.
- Mejorar la confiabilidad general del sistema.

1.  **Tecnologías a Utilizar**

Para la implementación de la plataforma de reservas de servicios se propone el uso de tecnologías orientadas al desarrollo web moderno, priorizando modularidad, mantenibilidad y escalabilidad.

|     |     |
| --- | --- |
| **Componente** | **Tecnología Propuesta** |
| Frontend | Aplicación Web SPA |
| Backend | API REST |
| Base de Datos | Sistema gestor relacional |
| Autenticación | JWT |
| Comunicación | HTTPS/TLS |

1.  **Flujo General del Sistema**

El flujo general del sistema describe el recorrido de las solicitudes realizadas por los usuarios dentro de la arquitectura propuesta, desde la interfaz de usuario hasta el almacenamiento y procesamiento de la información.

- El usuario interactúa con la interfaz web de la plataforma.
- La solicitud es enviada hacia la API REST mediante peticiones HTTP.
- La capa de aplicación procesa la solicitud utilizando operaciones de comandos o consultas según corresponda.
- Los módulos funcionales ejecutan las reglas de negocio relacionadas con autenticación, agenda, reservas o notificaciones.
- La capa de persistencia gestiona el acceso y almacenamiento de información en la base de datos.
- Finalmente, el sistema retorna la respuesta correspondiente al usuario.