# Planes Maestros

Esta carpeta contiene los planes ejecutables y la guia que deben seguir futuras IAs o agentes.

## Estructura

- `meta_guia_planes.md`: instructivo obligatorio para crear o ejecutar cualquier plan.
- `PLAN_AUTH_SEGURIDAD_SESION_REAL.md`: plan activo en ejecucion.
- `PLANES MAESTROS AUDITADOS.md`: retrospectiva de Classroom y regla de ground truth por fase.
- `cerrados/`: planes ya cerrados, conservados como referencia. Ver `cerrados/README.md`.

## Orden de lectura

1. `meta_guia_planes.md` antes de crear o ejecutar cualquier plan.
2. `PLAN_AUTH_SEGURIDAD_SESION_REAL.md` si se toca auth, sesion, roles, secretos, backend multiusuario o aislamiento por `userId`.
3. `cerrados/plan_planeaciones (closed).md` como ejemplo de calidad y tracking.
4. `cerrados/PLAN_CLASSROOM (closed).md` como referencia de cierre de Classroom.
5. `cerrados/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY (closed).md` para entorno, CI y deploy.
6. `cerrados/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE (closed).md` si se toca SQLite o storage local.

## Estado

| Plan | Estado |
| --- | --- |
| Planeaciones | Cerrado. Fase 9 aprobada. |
| Pasos Iniciales | Cerrado como cimiento organizativo. |
| Classroom | Cerrado; issue #8 completado. |
| Infraestructura Local/CI/Deploy Basico | Cerrado; Fases 0 a 7 completadas. |
| Storage Local SQLite y Migracion Offline | Cerrado para entrega academica; SQLite opt-in con rollback. |
| Auth, Seguridad y Sesion Real | En ejecucion; Fases 0-6 completadas y validadas en CI; 7-8 en cierre. Pendientes: email real, datos sociales, namespacing local y validacion manual. |

## Regla de mantenimiento

No borrar tareas de un plan activo. Si hay ruido, mover explicaciones largas a documentos de soporte, pero conservar fases, criterios y tracking `[ ]`, `[~]`, `[x]`.
