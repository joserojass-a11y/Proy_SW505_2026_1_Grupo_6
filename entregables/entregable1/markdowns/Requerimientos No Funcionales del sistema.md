2\. REQUERIMIENTOS NO FUNCIONALES (RNF)

**Rendimiento y Escalabilidad**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RNF-01 | Escalabilidad Horizontal | El sistema deberá soportar el incremento progresivo de usuarios concurrentes mediante mecanismos de escalabilidad horizontal basados en infraestructura cloud y arquitectura desacoplada. | Alta |
| RNF-02 | Gestión de Concurrencia | El sistema deberá controlar conflictos de concurrencia en procesos de reserva para evitar duplicidad de citas sobre un mismo intervalo horario. | Alta |
| RNF-03 | Tiempo de Respuesta | El sistema deberá responder las consultas de disponibilidad en un tiempo máximo de 2 segundos bajo condiciones normales de operación. | Alta |
| RNF-04 | Capacidad de Procesamiento | El sistema deberá soportar múltiples solicitudes simultáneas de agendamiento sin degradar significativamente el rendimiento general de la plataforma. | Alta |
| RNF-05 | Optimización de Consultas | El sistema deberá implementar mecanismos de optimización de consultas y acceso a datos para reducir tiempos de procesamiento. | Media |
| RNF-06 | Balanceo de Carga | La arquitectura deberá permitir la distribución de carga entre servicios o instancias para garantizar estabilidad operativa. | Media |

**Seguridad**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RNF-07 | Protección de Datos Sensibles | El sistema deberá proteger la información sensible mediante protocolos seguros de comunicación (HTTPS/TLS) y cifrado de credenciales. | Alta |
| RNF-08 | Autenticación Segura | El sistema deberá implementar autenticación basada en tokens seguros (JWT o equivalente), garantizando integridad y validez de sesión. | Alta |
| RNF-09 | Control de Acceso | El sistema deberá restringir el acceso a funcionalidades y recursos según el rol y permisos asignados a cada usuario. | Alta |
| RNF-10 | Prevención de Vulnerabilidades | El sistema deberá incorporar mecanismos de protección contra ataques comunes como SQL Injection, XSS y CSRF. | Alta |
| RNF-11 | Gestión Segura de Contraseñas | Las contraseñas deberán almacenarse utilizando algoritmos de hashing seguro y políticas de complejidad configurables. | Alta |
| RNF-12 | Auditoría y Trazabilidad | El sistema deberá registrar eventos críticos relacionados con autenticación, modificaciones y accesos para fines de auditoría y monitoreo. | Media |

**Disponibilidad y Confiabilidad**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RNF-13 | Alta Disponibilidad | El sistema deberá garantizar una disponibilidad operativa mínima del 99.5% anual. | Alta |
| RNF-14 | Recuperación ante Fallos | El sistema deberá contar con mecanismos automáticos de recuperación y restauración ante fallos operativos. | Alta |
| RNF-15 | Respaldo de Información | El sistema deberá realizar copias de seguridad periódicas de la información crítica y permitir su recuperación controlada. | Alta |
| RNF-16 | Integridad de Datos | El sistema deberá garantizar la consistencia e integridad de la información durante operaciones concurrentes de reserva y actualización. | Alta |
| RNF-17 | Tolerancia a Errores | El sistema deberá continuar operando parcialmente ante fallos no críticos sin comprometer la estabilidad global de la plataforma. | Media |

**Usabilidad y Experiencia de Usuario**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RNF-18 | Interfaz Intuitiva | El sistema deberá proporcionar una interfaz clara, intuitiva y fácil de utilizar, minimizando la necesidad de capacitación previa. | Alta |
| RNF-19 | Diseño Responsive | La interfaz deberá adaptarse correctamente a dispositivos móviles, tablets y equipos de escritorio. | Alta |
| RNF-20 | Flujo Simplificado de Reserva | El proceso de agendamiento deberá completarse en un máximo de tres pasos principales para optimizar la experiencia del usuario. | Alta |
| RNF-21 | Accesibilidad | La interfaz deberá seguir principios básicos de accesibilidad y legibilidad para diferentes tipos de usuarios. | Media |
| RNF-22 | Consistencia Visual | El sistema deberá mantener uniformidad visual y de navegación en todos los módulos de la plataforma. | Media |

**Mantenibilidad, Arquitectura y Calidad del Software**

| **ID** | **Nombre del Requerimiento** | **Descripción Detallada** | **Prioridad** |
| --- | --- | --- | --- |
| RNF-23 | Aplicación del Principio CQS | El sistema deberá implementar separación estricta entre operaciones de consulta (Query) y operaciones de modificación (Command). | Alta |
| RNF-24 | Arquitectura Modular | El sistema deberá estructurarse mediante componentes desacoplados y reutilizables que faciliten mantenimiento y evolución. | Alta |
| RNF-25 | Aplicación de Principios SOLID | El desarrollo deberá seguir principios SOLID para mejorar mantenibilidad, extensibilidad y cohesión del código. | Alta |
| RNF-26 | Registro y Monitoreo | El sistema deberá registrar eventos críticos, errores y métricas operativas para facilitar monitoreo y diagnóstico. | Alta |
| RNF-27 | Documentación Técnica | El sistema deberá contar con documentación técnica actualizada de arquitectura, APIs y despliegue. | Media |
| RNF-28 | Facilidad de Despliegue | La solución deberá permitir procesos de despliegue controlados y automatizables en diferentes entornos. | Media |