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
| Infraestructura Local, CI y Deploy Basico | `Documentacion/01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md` | Cerrado. Fases 0 a 7 completadas. |
| Storage Local SQLite y Migracion Offline | `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md` | Cerrado para entrega academica; SQLite opt-in con rollback. |
| Auth, Seguridad y Sesion Real | `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` | Creado; pendiente de ejecucion. |
| Meta Guia de Planes | `Documentacion/01-planes-maestros/meta_guia_planes.md` | Vigente como instructivo obligatorio. |

## Orden recomendado de planes futuros

1. `Plan Maestro: UX/UI y Navegacion Global`
2. `Plan Maestro: Calificacion y Revision de Tareas`
3. `Plan Maestro: Excel / Listas y Sync Bidireccional`
4. `Plan Maestro: Calendario y Seguimiento Personal`
5. `Plan Maestro: WhatsApp Docente / Chat y Contactos`
6. `Plan Maestro: Canva / Diseno Didactico`
7. `Plan Maestro: Reportes y Gamificacion`
8. `Plan Maestro: Plantillas y Comunidad de Recursos`
9. `Plan Maestro: Activacion SQLite como default` solo si una validacion futura lo justifica
10. `Plan Maestro: Despliegue y Distribucion`

## Criterio para activar un plan

- Infraestructura: cerrado; estabilizo entorno local, CI, scripts, backend, variables, demo low-cost y preparacion SQLite.
- Auth/Seguridad: plan creado; ejecutar antes de usuarios reales, beta cerrada o pruebas con datos reales.
- UX/UI Global: cuando los modulos principales funcionen pero la navegacion empiece a sentirse fragmentada; no debe bloquear funcionalidad base de los modulos.
- Excel/Listas: despues de tener Classroom con datos reales de grupos/alumnos/tareas.
- Storage Local SQLite: cerrado como infraestructura opt-in; nuevos planes deben asumir ports/repositories compatibles con SQLite y no leer AsyncStorage directo.
- Activacion SQLite como default: solo tras nueva decision explicita, snapshot real, rollback probado y validacion manual.
- Calificacion: cuando actividades/entregas de Classroom tengan flujo base.
- Calendario: cuando planeaciones y tareas ya tengan fechas confiables.
- WhatsApp docente: cuando contactos/chat tengan valor claro sin competir con Classroom.
- Canva: cuando el flujo de materiales y plantillas necesite editor visual.
- Reportes: cuando haya datos reales suficientes para estadisticas.

## Estado de GitHub Product OS

- Epic Classroom: cerrado en `Done`.
- Issues de Classroom #1-#7: cerrados; #7 quedo reemplazado por #8.
- Issue de cierre `Classroom Fases 6-10 - cierre tecnico consolidado y validacion manual` (#8): cerrado y en `Done`.
- Epic `Plan Maestro: Infraestructura Local, CI y Deploy Basico`: listo para `Done`.
- Issues #9 a #17 de Infraestructura: cerrados/listos para `Done`.
- Issue consolidado Storage SQLite #18: cerrado en `Done`.
- Issues de fases SQLite #19-#25: cerrados en `Done`.
- Siguiente issue recomendado: crear epic/fase de Auth solo cuando inicie ejecucion del plan `PLAN_AUTH_SEGURIDAD_SESION_REAL.md`.
