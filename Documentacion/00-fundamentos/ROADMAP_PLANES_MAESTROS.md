# Roadmap de Planes Maestros - PlanearIA

Este archivo lista los planes maestros actuales y futuros. No reemplaza los planes; solo define orden, estado, proximo plan recomendado y criterio de activacion.

## Reglas

- Los planes activos viven en `Documentacion/01-planes-maestros/`; los cerrados en `Documentacion/01-planes-maestros/cerrados/`.
- Un plan futuro no se escribe hasta que el usuario lo pida.
- Cada plan debe crear o sincronizar issues/fases en GitHub Product OS cuando empiece ejecucion.
- Los checkboxes detallados viven en markdown; GitHub Project solo lleva epicas, fases activas y bloqueos.
- Las prioridades pueden cambiar por decision del usuario.

## Planes existentes

| Plan | Archivo | Estado |
| --- | --- | --- |
| Meta Guia de Planes | `Documentacion/01-planes-maestros/meta_guia_planes.md` | Vigente como instructivo obligatorio. |
| Auth, Seguridad y Sesion Real | `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` | En ejecucion; Fases 0-6 completadas (CI verde), 7-8 en cierre. Email real y datos sociales (posts/contactos/mensajes) diferidos. |
| Planeaciones | `Documentacion/01-planes-maestros/cerrados/plan_planeaciones (closed).md` | Cerrado. Fase 9 aprobada. |
| Pasos Iniciales | `Documentacion/01-planes-maestros/cerrados/PLAN_PASOS_INICIALES (closed).md` | Cerrado como cimiento organizativo. |
| Classroom / Grupos y Recursos | `Documentacion/01-planes-maestros/cerrados/PLAN_CLASSROOM (closed).md` | Cerrado. Fases 0-10, cierre final e issue #8 completados. |
| Infraestructura Local, CI y Deploy Basico | `Documentacion/01-planes-maestros/cerrados/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY (closed).md` | Cerrado. Fases 0 a 7 completadas. |
| Storage Local SQLite y Migracion Offline | `Documentacion/01-planes-maestros/cerrados/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE (closed).md` | Cerrado para entrega academica; SQLite opt-in con rollback. |

## Proximo plan recomendado

1. **Cerrar el plan activo Auth, Seguridad y Sesion Real.** Es lo unico en ejecucion. Faltan email real, datos sociales (posts/contactos/mensajes), namespacing local por usuario, validacion manual y sincronizacion del GitHub Project. Cerrarlo desbloquea beta cerrada y pruebas con datos reales.
2. **Iniciar `Plan Maestro: UX/UI y Navegacion Global` como siguiente plan nuevo.** Justificacion: la vision exige una experiencia visual de primer nivel y conviene fijar sistema visual, tokens, navegacion global y accesibilidad base antes de construir Excel, Canva, WhatsApp y Reportes, para que cada modulo nuevo herede el mismo lenguaje en vez de acumular interfaces heterogeneas. Este plan tambien resuelve los placeholders de Configuracion/Accesibilidad (botones de preferencias/accesibilidad que hoy no hacen nada), o los delega al plan dedicado de Configuracion si el alcance crece.

## Secuencia recomendada de planes futuros

Despues de cerrar Auth e iniciar UX/UI Global, el orden sugerido es:

1. `Plan Maestro: UX/UI y Navegacion Global` (sistema visual, tokens, navegacion, accesibilidad base).
2. `Plan Maestro: Configuracion y Accesibilidad Real` (placeholders de ajustes, preferencias reales, tema, fuente, daltonismo, persistencia y sync de preferencias).
3. `Plan Maestro: Calificacion y Revision de Tareas` (sobre entregas reales de Classroom).
4. `Plan Maestro: Excel / Listas y Sync Bidireccional` (listas tabulares conectadas a Classroom, asistencia y calificaciones).
5. `Plan Maestro: Calendario y Seguimiento Personal`.
6. `Plan Maestro: WhatsApp Docente / Chat y Contactos`.
7. `Plan Maestro: Canva / Diseno Didactico`.
8. `Plan Maestro: Reportes y Gamificacion` (cuando haya datos reales suficientes).
9. `Plan Maestro: Plantillas y Comunidad de Recursos`.
10. `Plan Maestro: Activacion SQLite como default` (solo si una validacion futura lo justifica).
11. `Plan Maestro: Despliegue y Distribucion`.

## Criterio para activar un plan

- Auth/Seguridad: en ejecucion; cerrar antes de usuarios reales, beta cerrada o pruebas con datos reales.
- UX/UI Global: ahora que existen Planeaciones y Classroom funcionales; define el sistema visual que heredaran los modulos nuevos. No debe bloquear funcionalidad base.
- Configuracion y Accesibilidad Real: junto con o inmediatamente despues de UX/UI Global, porque hoy los ajustes son placeholders y la accesibilidad no es real.
- Calificacion: cuando actividades/entregas de Classroom tengan flujo base estable.
- Excel/Listas: despues de tener Classroom con datos reales de grupos/alumnos/tareas y la calificacion encaminada.
- Calendario: cuando planeaciones y tareas ya tengan fechas confiables.
- WhatsApp docente: cuando contactos/chat tengan valor claro sin competir con Classroom.
- Canva: cuando el flujo de materiales y plantillas necesite editor visual.
- Reportes: cuando haya datos reales suficientes para estadisticas.
- Activacion SQLite como default: solo tras nueva decision explicita, snapshot real, rollback probado y validacion manual. Hoy SQLite sigue opt-in y AsyncStorage default.
- Despliegue y Distribucion: cuando la beta cerrada y el pulido UX justifiquen distribucion formal mas alla de la demo actual.

## Estado de GitHub Product OS

- Epic Classroom: cerrado en `Done`. Issues #1-#7 cerrados (#7 reemplazado por #8); issue de cierre #8 en `Done`.
- Epic Infraestructura Local/CI/Deploy: cerrado. Issues #9 a #17 cerrados.
- Storage SQLite: issue consolidado #18 y fases #19-#25 cerrados en `Done`.
- Auth, Seguridad y Sesion Real: en ejecucion; mantener su epic/fase sincronizada con el tracking del plan hasta cerrar Fases 7-8.
- Proximo: crear el epic/fase de `UX/UI y Navegacion Global` solo cuando inicie su ejecucion, segun la meta guia.
