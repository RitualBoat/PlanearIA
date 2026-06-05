# Roadmap de Planes Maestros - PlanearIA

Este archivo lista los planes maestros actuales y futuros. No reemplaza los planes; solo define orden, estado y criterio de activacion.

## Reglas

- Los planes ejecutables viven en `Documentacion/01-planes-maestros/`.
- Un plan futuro no se escribe hasta que el usuario lo pida.
- Cada plan debe crear o sincronizar issues/fases en GitHub Product OS cuando empiece ejecucion.
- Los checkboxes detallados viven en markdown; GitHub Project solo lleva epicas, fases activas y bloqueos.
- Las prioridades pueden cambiar por decision del usuario.

## Planes existentes

| Plan | Archivo | Estado |
| --- | --- | --- |
| Planeaciones | `Documentacion/01-planes-maestros/plan_planeaciones.md` | Cerrado. Fase 9 aprobada. |
| Pasos Iniciales | `Documentacion/01-planes-maestros/PLAN_PASOS_INICIALES.md` | Cerrado como cimiento organizativo. |
| Classroom / Grupos y Recursos | `Documentacion/01-planes-maestros/PLAN_CLASSROOM.md` | Cerrado. Fases 0-10, cierre final e issue #8 completados. |
| Infraestructura Local, CI y Deploy Basico | `Documentacion/01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md` | Activo. Fase 0 completada; Fase 1 pendiente. |
| Meta Guia de Planes | `Documentacion/01-planes-maestros/meta_guia_planes.md` | Vigente como instructivo obligatorio. |

## Orden recomendado de planes futuros

1. `Plan Maestro: Auth, Seguridad y Sesion Real`
2. `Plan Maestro: UX/UI y Navegacion Global`
3. `Plan Maestro: Excel / Listas y Sync Bidireccional`
4. `Plan Maestro: Storage Local SQLite y Migracion Offline`
5. `Plan Maestro: Calificacion y Revision de Tareas`
6. `Plan Maestro: Calendario y Seguimiento Personal`
7. `Plan Maestro: WhatsApp Docente / Chat y Contactos`
8. `Plan Maestro: Canva / Diseno Didactico`
9. `Plan Maestro: Reportes y Gamificacion`
10. `Plan Maestro: Plantillas y Comunidad de Recursos`
11. `Plan Maestro: Despliegue y Distribucion`

## Criterio para activar un plan

- Infraestructura: plan activo; estabiliza entorno local, CI, scripts, backend, variables y demo low-cost antes de mas refactors grandes.
- Auth/Seguridad: antes de usuarios reales, beta cerrada o pruebas con datos reales.
- UX/UI Global: cuando los modulos principales funcionen pero la navegacion empiece a sentirse fragmentada; no debe bloquear funcionalidad base de los modulos.
- Excel/Listas: despues de tener Classroom con datos reales de grupos/alumnos/tareas.
- Storage Local SQLite: cuando se decida migrar persistencia local o cuando la actividad academica requiera evidencia antes/despues.
- Calificacion: cuando actividades/entregas de Classroom tengan flujo base.
- Calendario: cuando planeaciones y tareas ya tengan fechas confiables.
- WhatsApp docente: cuando contactos/chat tengan valor claro sin competir con Classroom.
- Canva: cuando el flujo de materiales y plantillas necesite editor visual.
- Reportes: cuando haya datos reales suficientes para estadisticas.

## Estado de GitHub Product OS

- Epic Classroom: cerrado en `Done`.
- Issues de Classroom #1-#7: cerrados; #7 quedo reemplazado por #8.
- Issue de cierre `Classroom Fases 6-10 - cierre tecnico consolidado y validacion manual` (#8): cerrado y en `Done`.
- Epic activo: `Plan Maestro: Infraestructura Local, CI y Deploy Basico`.
- Issue #9 `Infraestructura Fase 0 - Auditoria operativa y baseline`: cerrado y en `Done`.
- Siguiente issue recomendado: `Infraestructura Fase 1 - Scripts reproducibles`.
