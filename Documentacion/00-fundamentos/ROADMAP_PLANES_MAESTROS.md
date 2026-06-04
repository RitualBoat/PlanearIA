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
| Classroom / Grupos y Recursos | `Documentacion/01-planes-maestros/PLAN_CLASSROOM.md` | Activo. Fases 0-5 completadas; Fase 6 pendiente. |
| Meta Guia de Planes | `Documentacion/01-planes-maestros/meta_guia_planes.md` | Vigente como instructivo obligatorio. |

## Orden recomendado de planes futuros

1. `Plan Maestro: UX/UI y Navegacion Global`
2. `Plan Maestro: Infraestructura Local, CI y Deploy Basico`
3. `Plan Maestro: Auth, Seguridad y Sesion Real`
4. `Plan Maestro: Excel / Listas y Sync Bidireccional`
5. `Plan Maestro: Calificacion y Revision de Tareas`
6. `Plan Maestro: Calendario y Seguimiento Personal`
7. `Plan Maestro: WhatsApp Docente / Chat y Contactos`
8. `Plan Maestro: Canva / Diseno Didactico`
9. `Plan Maestro: Reportes y Gamificacion`
10. `Plan Maestro: Plantillas y Comunidad de Recursos`
11. `Plan Maestro: Despliegue y Distribucion`

## Criterio para activar un plan

- UX/UI Global: cuando los modulos principales funcionen pero la navegacion empiece a sentirse fragmentada.
- Infraestructura: antes de demo externa o si el backend local/free tier empieza a bloquear pruebas.
- Auth/Seguridad: antes de usuarios reales o beta cerrada.
- Excel/Listas: despues de tener Classroom con datos reales de grupos/alumnos/tareas.
- Calificacion: cuando actividades/entregas de Classroom tengan flujo base.
- Calendario: cuando planeaciones y tareas ya tengan fechas confiables.
- WhatsApp docente: cuando contactos/chat tengan valor claro sin competir con Classroom.
- Canva: cuando el flujo de materiales y plantillas necesite editor visual.
- Reportes: cuando haya datos reales suficientes para estadisticas.

## Estado de GitHub Product OS

- Epic actual: `Plan Maestro: Classroom / Grupos y Recursos`.
- Fases de Classroom 0-5: cerradas.
- Siguiente issue recomendado: `Classroom Fase 6 - Actividades, tareas y entregables`.
