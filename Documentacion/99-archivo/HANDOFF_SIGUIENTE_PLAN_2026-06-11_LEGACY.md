# Handoff para siguiente chat - PlanearIA

> Fecha: 2026-06-11  
> Proposito: contexto compacto para otra IA antes de crear el siguiente plan maestro.  
> Importante: este documento no crea el nuevo plan; solo deja el terreno listo.

## Estado general del proyecto

PlanearIA es una app React Native + Expo SDK 54 + TypeScript, offline-first, para docentes. La vision vigente es construir una plataforma modular con experiencias familiares:

- Planeaciones = Word/Docs.
- Classroom = grupos, alumnos, actividades, recursos, entregas, asistencia y calificaciones.
- Excel/Listas = registros tabulares.
- Canva/Genially = diseno didactico.
- WhatsApp docente = comunicacion.
- Reportes = analitica/gamificacion.

El proyecto no esta en produccion ni tiene usuarios reales. Se permiten refactors fuertes si reducen legacy, mejoran arquitectura o preparan planes futuros.

## Planes ya cerrados

- Planeaciones: cerrado como experiencia Word/Docs, Fase 9 aprobada.
- Pasos Iniciales: cerrado como organizacion GitHub Product OS, CI inicial y entorno.
- Classroom / Grupos y Recursos: cerrado, issues #1-#8.
- Infraestructura Local/CI/Deploy Basico: cerrado, issues #9-#17.
- Storage Local SQLite y Migracion Offline: cerrado para entrega academica, issues #18-#25.

## Estado SQLite actual

SQLite ya no es solo futuro teorico. Quedo implementado como infraestructura opt-in:

- `expo-sqlite` instalado en `package.json`.
- Plugin `expo-sqlite` agregado en `app.json`.
- Schema SQLite en `src/services/classroom/sqlite/classroomSqliteSchema.ts`.
- Adapter SQLite en `src/services/classroom/sqlite/classroomSqliteStorage.ts`.
- Migracion AsyncStorage -> SQLite con snapshot en `src/services/classroom/sqlite/classroomSqliteMigration.ts`.
- Sync queue SQLite en `src/sync/services/syncQueueSqliteStorage.ts`.
- Migracion de pending/failed ops en `src/sync/services/syncQueueSqliteMigration.ts`.
- `ClassroomRepository` en `src/services/classroom/classroomRepository.ts`.
- Factory opt-in en `src/services/classroom/classroomRepositoryFactory.ts`.

Decision final del plan SQLite:

- AsyncStorage sigue como storage default productivo y rollback.
- SQLite queda disponible para datos academicos relacionales y sync queue, pero no activado como default.
- No se borraron claves legacy `@planearia:*`.
- Todo plan nuevo que toque datos academicos debe usar ports/repositories y evitar nuevas lecturas directas a AsyncStorage.

## Evidencia SQLite

Plan maestro:

- `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`

Evidencia local:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/sqlite-fase-0-baseline-2026-06-10.md`
- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/sqlite-fase-1-ports-repositories-2026-06-11.md`
- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/sqlite-fase-2-adapter-2026-06-11.md`
- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/sqlite-fase-3-migracion-snapshot-2026-06-11.md`
- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/sqlite-fase-4-sync-queue-2026-06-11.md`
- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/sqlite-fase-5-validacion-manual-2026-06-11.md`
- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/sqlite-fase-6-limpieza-cierre-2026-06-11.md`

GitHub Product OS:

- Issue consolidado #18.
- Fases #19 a #25.
- Todos cerrados y en `Done`.

## Validaciones finales conocidas

Ultima bateria pasada:

```bash
npm run typecheck
npm run test:classroom -- --runInBand
npm run test:sync -- --runInBand
npm run lint -- --quiet
git diff --check
```

Resultados:

- Classroom: 6 suites / 21 tests.
- Sync: 4 suites / 22 tests.
- Lint OK.
- `git diff --check` OK, solo avisos CRLF normales de Windows.

## Reglas importantes para la siguiente IA

- Leer primero `Documentacion/README.md`.
- Leer `Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md`.
- Leer `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`.
- Leer `Documentacion/01-planes-maestros/meta_guia_planes.md` antes de crear un plan nuevo.
- Si el nuevo plan toca datos academicos, leer tambien `PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`.
- No activar SQLite como default sin nueva aprobacion manual.
- No borrar claves legacy de AsyncStorage.
- No crear pantallas aisladas sin rutas, CTAs y salida clara.
- No cerrar fases visuales solo por tests; pedir validacion manual cuando aplique.
- Registrar issues/fases en GitHub Product OS cuando empiece un plan activo.

## Siguiente plan recomendado

Recomendacion principal:

`Plan Maestro: Auth, Seguridad y Sesion Real`

Razon:

- Es el siguiente en el roadmap vigente.
- Antes de usar datos reales o beta cerrada se necesita seguridad real.
- Debe ordenar JWT, roles, `userId`, RBAC Dev/Admin/Docente/Alumno, bcrypt, rate limiting, CORS y secretos.
- Debe definir como se aislan datos locales/remotos antes de que mas modulos escriban en SQLite o MongoDB.

Premisa SQLite para ese plan:

- Auth puede seguir guardando token/sesion simple en AsyncStorage.
- Datos academicos no deben acoplarse directo a AsyncStorage.
- Cualquier aislamiento por usuario debe contemplar `userId` en repositorios, sync queue, snapshots y migraciones futuras.
- Si se toca sync, validar con `npm run test:sync -- --runInBand`.
- Si se toca Classroom/storage academico, validar con `npm run test:classroom -- --runInBand`.

Alternativa si el usuario prioriza funcionalidad academica sobre seguridad:

`Plan Maestro: Calificacion y Revision de Tareas`

Razon:

- Aprovecha Classroom ya cerrado.
- Aprovecha SQLite como infraestructura relacional opt-in.
- Conecta actividades, entregas, calificaciones, rubricas y reportes.

Decision recomendada:

- Crear primero Auth/Seguridad si el objetivo es robustez, datos reales o beta.
- Crear Calificacion/Revision si el objetivo inmediato es demo academica de flujo docente completo.

## Prompt sugerido para el otro chat

```text
Lee este contexto y no crees nada todavia hasta entenderlo:

- Documentacion/README.md
- Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md
- Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md
- Documentacion/01-planes-maestros/meta_guia_planes.md
- Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md
- context/HANDOFF_SIGUIENTE_PLAN_2026-06-11.md

Quiero crear el siguiente plan maestro. Recomendacion actual: Auth, Seguridad y Sesion Real, teniendo en cuenta que SQLite ya existe como infraestructura opt-in y que nuevos datos academicos deben usar ports/repositories compatibles con SQLite. No actives SQLite como default ni borres AsyncStorage legacy.
```
