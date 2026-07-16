# Mapa DDD Estrategico Ligero - PlanearIA

> **Estado:** vigente.
> **Uso:** decidir lenguaje, owner de datos y contratos antes de abrir o aplicar un change que toque mas de una experiencia.
> **Fuente de verdad:** codigo real, `ARQUITECTURA.md`, `MAPA_MODULOS_ACTUALES.md`, `FLUJO_SINCRONIZACION.md`, `IA_CHATBOT_LLM.md` y specs OpenSpec vigentes.
> **No usar para:** forzar microservicios, CQRS, event sourcing, renombres masivos o una migracion de carpetas/providers.

## Proposito y limites

PlanearIA sigue siendo un **monolito modular**. Los bounded contexts de este mapa separan lenguaje, responsabilidad y contratos para que una misma entidad tenga un solo significado y un owner claro. No son servicios desplegables ni obligan a que cada carpeta actual sea un contexto.

El mapa sirve para decidir antes de cambiar codigo:

1. Que contexto posee la regla y el dato.
2. Que otros contextos pueden consumirlo y mediante que referencia o contrato.
3. Que invariantes no se pueden romper.
4. Si el change es intra-contexto o requiere un contrato cruzado.

Un consumidor conserva IDs o una proyeccion explicita; no crea una segunda fuente de verdad de la entidad ajena. La ubicacion tecnica actual puede ser provisional y no convierte automaticamente un `Context` de React, una pantalla o una ruta backend en un bounded context.

## Glosario docente

| Termino | Significado en PlanearIA | No confundir con |
| --- | --- | --- |
| Usuario | Persona autenticada o en sesion local que posee datos y permisos. | Alumno o perfil publico. |
| Rol | Conjunto de permisos de un usuario, como docente, alumno, admin o dev. | Sesion. |
| Sesion | Credencial y ciclo de acceso revocable del usuario. | Preferencia persistida. |
| Grupo | Seccion academica administrada por el docente. | Clase como experiencia de UI. |
| Clase | Espacio de trabajo pedagogico construido alrededor de un Grupo. | El registro de Grupo. |
| Unidad | Segmento de contenido o periodo dentro de un Grupo. | Planeacion completa. |
| Alumno | Integrante identificado del Grupo bajo un `userId` docente. | Usuario de autenticacion. |
| Planeacion | Documento docente que organiza objetivos, actividades y fechas. | Tarea ya asignada. |
| Plantilla | Estructura reutilizable para crear contenido. | Planeacion instanciada. |
| Recurso | Material didactico reutilizable y asignable. | Archivo adjunto tecnico. |
| Tarea | Actividad asignable dentro de Classroom, examen, proyecto o investigacion. Hoy se almacena tecnicamente bajo el nombre legacy `entregables`. | Entrega individual del alumno. |
| Entregable | Nombre tecnico legacy de la coleccion, ruta y `EntregablesContext` que hoy almacenan `Tarea`; no es un segundo agregado de dominio. | `EntregaTarea`. |
| EntregaTarea | Entrega individual de un Alumno para una Tarea, definida en tipos pero sin una persistencia/sync dedicada vigente. | Tarea o Calificacion final. |
| Asistencia | Registro de presencia por Alumno y fecha. | Estado de una entrega. |
| Calificacion | Valoracion academica con su criterio o referencia de origen. | Promedio derivado o reporte. |
| Contacto | Persona disponible para comunicacion profesional. | Alumno de un Grupo. |
| Conversacion | Hilo de comunicacion entre participantes. | Notificacion puntual. |
| Mensaje | Unidad enviada dentro de una Conversacion. | Post publico o Recurso. |
| Notificacion | Estado de entrega que apunta a un objeto fuente real. | Owner del objeto que la origino. |

## Contextos delimitados

| Contexto | Posee lenguaje y decisiones sobre | Owner tecnico actual | No posee |
| --- | --- | --- | --- |
| Identidad y Cuenta | Usuario, Rol, Sesion, acceso, perfil privado y recuperacion. | `AuthContext`, `src/services/auth/`, `backend/routes/auth.js`, Cuenta/Sesiones. | Datos academicos, mensajes o preferencias visuales de otros contextos. |
| Planeacion y Contenido Docente | Planeacion, Plantilla y Recurso como contenido creado, reutilizable o importable. | `PlaneacionesContext`, `PlantillasContext`, `RecursosContext`, servicios y rutas de planeaciones/plantillas/recursos. | Grupo, Alumno, entrega, asistencia o calificacion. |
| Classroom y Organizacion Academica | Grupo, Unidad, Alumno y Tarea; el espacio de trabajo de Clase. | `GruposContext`, `AlumnosContext`, pantallas `classroom`/`grupos`, rutas grupos/unidades/alumnos. La `Tarea` usa hoy el storage/ruta legacy `entregables` mediante `EntregablesContext`. | El contenido interno de una Planeacion o la evaluacion historica. |
| Seguimiento y Evaluacion | EntregaTarea, Asistencia, Calificacion y derivados como promedios/reportes. | `AsistenciaContext`, `CalificacionesContext` y servicios asociados; `EntregaTarea` aun no tiene persistencia/sync dedicada. | Crear o redefinir Grupo, Alumno, Tarea o Planeacion. |
| Comunicacion Profesional | Contacto, Conversacion, Mensaje, Post y el estado de entrega de Notificacion cuando aplique la comunidad profesional. | `ContactosContext`, `MensajesContext`, `PostsContext`, `NotificacionesContext`, rutas contactos/mensajes/posts/notificaciones. | Datos academicos de alumnos; una Notificacion conserva solo su entrega y referencia al objeto fuente. |
| Experiencia y Preferencias | Tema, fuente, daltonismo, accesibilidad, onboarding y navegacion como experiencia de uso. | Contexts de tema/fuente/daltonismo/accesibilidad y pantallas de cuenta/onboarding. | Seguridad de sesion, datos academicos o reglas de negocio de otros contextos. |

## Matriz de propiedad de entidades

| Entidad | Contexto owner | Consumidores permitidos | Referencia o contrato | Invariantes que se preservan |
| --- | --- | --- | --- | --- |
| Usuario | Identidad y Cuenta | Todos los contextos autorizados. | `userId`; nunca duplicar identidad como Alumno. | Aislamiento por `userId`; acceso autenticado o modo local explicito. |
| Rol | Identidad y Cuenta | Classroom, Cuenta y capacidades que aplican permisos. | Rol leido desde sesion/autorizacion. | Solo el owner de identidad cambia permisos. |
| Sesion | Identidad y Cuenta | Sync y UI de cuenta. | Token/estado de sesion, no datos de dominio. | Revocacion, expiracion y almacenamiento seguro segun plataforma. |
| Grupo | Classroom y Organizacion Academica | Planeacion y Contenido; Seguimiento y Evaluacion; Agenda futura. | `grupoId`. | Pertenece a un `userId`; sus relaciones academicas se validan por ID. |
| Unidad | Classroom y Organizacion Academica | Planeacion y Contenido; Seguimiento y Evaluacion. | `unidadId` y `grupoId`. | No se asigna fuera del Grupo al que pertenece. |
| Alumno | Classroom y Organizacion Academica | Seguimiento y Evaluacion; Reportes; Planeacion solo como referencia contextual. | `alumnoId` y `grupoId`. | Pertenece al docente/Grupo correcto; no equivale a Usuario autenticado. |
| Planeacion | Planeacion y Contenido Docente | Classroom, Asistente IA, Agenda y Reportes. | `planeacionId`, con `grupoId`/`unidadId` opcionales confirmados. | El contenido original no se sobreescribe por IA; solo su owner lo edita. |
| Plantilla | Planeacion y Contenido Docente | Planeacion, DisenaPLAN futuro y Classroom como seleccion de contenido. | `plantillaId`. | Reutilizar no convierte una plantilla en Planeacion ni duplica su fuente. |
| Recurso | Planeacion y Contenido Docente | Classroom, tareas y comunicacion profesional. | `recursoId` y metadatos de asignacion. | El owner conserva metadatos; adjuntos respetan permisos y procedencia. |
| Tarea | Classroom y Organizacion Academica | Seguimiento y Evaluacion; Agenda y Notificaciones. | `tareaId`, `grupoId`, referencias a recursos/planeaciones. Hoy se persiste tecnicamente con `EntregablesContext` y `/api/entregables`. | La asignacion pertenece al Grupo y no copia el contenido fuente. |
| Entregable (nombre tecnico legacy) | Classroom y Organizacion Academica | Los mismos consumidores de Tarea. | Coleccion `entregables`, ruta `/api/entregables`, key `@planearia:entregables` y `EntregablesContext`, que actualmente transportan objetos `Tarea`. | No crear un segundo owner ni interpretar este nombre tecnico como entrega individual. |
| EntregaTarea | Seguimiento y Evaluacion | Classroom, Reportes y Notificaciones cuando exista el flujo dedicado. | `entregaTareaId`, `tareaId`, `alumnoId`; actualmente es un tipo sin persistencia/sync dedicada. | Corresponde a una Tarea y Alumno validos; conserva estado, evidencia de entrega y retroalimentacion. |
| Asistencia | Seguimiento y Evaluacion | Classroom, Reportes y Planeacion como consulta. | Registro por `alumnoId`, `grupoId` y fecha. | Un registro es trazable a Alumno/Grupo y no se pierde si falla sync. |
| Calificacion | Seguimiento y Evaluacion | Classroom y Reportes. | `calificacionId`, `alumnoId`, origen evaluable. | Trazable a Alumno y criterio/origen; los promedios son derivados, no owner nuevo. |
| Contacto | Comunicacion Profesional | Conversaciones e invitaciones. | `contactoId` o identidad permitida. | No expone datos academicos sin autorizacion explicita. |
| Conversacion | Comunicacion Profesional | Mensajes y Notificaciones. | `conversacionId` y participantes. | Solo participantes autorizados acceden al hilo. |
| Mensaje | Comunicacion Profesional | Notificaciones y objetos compartidos confirmados. | `mensajeId`, `conversacionId`, referencia al objeto compartido. | Conserva participante, estado de envio y permisos; compartir no transfiere ownership. |
| Notificacion | Comunicacion Profesional | Cualquier contexto como origen o destino. | `notificacionId` y referencia tipada al objeto fuente. | Posee solo estado de entrega/lectura; no reemplaza el owner academico ni social. |

## Capacidades transversales

| Capacidad | Responsabilidad | Limite obligatorio |
| --- | --- | --- |
| Sync/offline | Guardado local, cola por entidad, push/pull, reconciliacion y estado visible mediante `src/sync` y `SyncContext`. | No decide reglas de Grupo, Planeacion, Entrega o Calificacion. Un pull fallido no toca datos locales. |
| Adjuntos | Referencia, metadatos de archivo, permisos y relacion con un objeto owner. | No crea un agregado academico paralelo; el archivo conserva procedencia y `userId` cuando aplique. |
| Notificaciones | Entrega, lectura, deep link y reintento de avisos sobre el registro de Notificacion de Comunicacion Profesional. | No es owner de Tarea, EntregaTarea, Mensaje o Calificacion; apunta al objeto fuente y no copia su estado de negocio. |
| Seguridad y autorizacion | JWT, sesiones, roles, CORS, limites y filtro por `userId`. | No define la semantica academica; protege los owners que la definen. |
| Asistencia IA | Sugerencias, solicitudes en segundo plano y resultados revisables a traves del backend/`aiGateway`. | No llama proveedores desde frontend ni sobrescribe el original; requiere confirmacion docente. |

## Contratos entre contextos

Un change es **intra-contexto** cuando modifica una entidad y sus reglas dentro de una sola fila owner. Su `design.md` declara el contexto afectado y que no existe contrato cruzado.

Un change es **cruzado** cuando consume, crea referencia a, sincroniza o cambia una regla de entidades de mas de un contexto. El diseño declara:

1. Contextos afectados y owner de cada dato.
2. Consumidores y direccion del intercambio.
3. Forma proporcional del contrato: IDs, interfaz, ruta, evento ya existente o proyeccion explicita.
4. Compatibilidad, rollback e invariantes: `userId`, `src/sync`, permisos, confirmacion IA y no perdida local cuando apliquen.

No se crean microservicios, CQRS, event sourcing, colas paralelas ni providers globales nuevos solo por documentar el contrato.

## Consultas de decision

| Pregunta antes de cambiar | Respuesta del mapa | Contrato requerido |
| --- | --- | --- |
| "Quiero agregar una fecha de entrega a una Tarea de un Grupo." | Owner: Classroom y Organizacion Academica; Seguimiento consume la Tarea mediante `tareaId`. El storage actual se llama `entregables`, aunque contiene `Tarea`. | Intra-contexto si solo cambia Tarea; cruzado si modifica una `EntregaTarea` o notifica al Alumno. |
| "Quiero asignar una Planeacion existente a una Clase." | Planeacion sigue en Planeacion y Contenido; Classroom consume `planeacionId` y sus referencias confirmadas. | Cruzado: declarar referencia, compatibilidad y que la IA no sobrescribe la Planeacion. |
| "Quiero compartir un Recurso por Mensaje." | Recurso conserva owner de Contenido; Mensaje es owner de la comunicacion y guarda una referencia compartida. | Cruzado: declarar permisos de acceso, referencia al recurso y estado de envio. |
| "Quiero que la IA sugiera una Tarea desde una Planeacion mientras no hay red." | Owner de Planeacion: Contenido; Tarea: Classroom; IA y Sync son transversales. | Cruzado: resultado IA revisable, confirmacion docente, IDs de contexto y cola global solo al guardar la accion confirmada. |

## Fuentes tecnicas y mantenimiento

El mapa se contrasta con `App.tsx`, `src/navigation/`, `src/context/`, `src/services/`, `src/sync/`, `backend/routes/`, `ARQUITECTURA.md`, `MAPA_MODULOS_ACTUALES.md`, `FLUJO_SINCRONIZACION.md` e `IA_CHATBOT_LLM.md`.

Actualizar este documento cuando un change agregue, mueva o retire ownership, cambie un contrato cruzado o introduzca una entidad compartida. No actualizarlo por renombres visuales aislados ni por movimientos internos que no alteren lenguaje, owner o invariantes.
