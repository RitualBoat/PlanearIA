# SQLite Fase 2 - Adapter SQLite inicial

> Fecha: 2026-06-11  
> Plan: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`  
> Estado: implementado como infraestructura opt-in.

## Objetivo

Instalar Expo SQLite y crear un adapter inicial compatible con `ClassroomStoragePort`, sin cambiar todavia el almacenamiento default de la app.

## Cambios realizados

- Se instalo `expo-sqlite` compatible con Expo SDK 54:
  - `expo-sqlite`: `~16.0.10`.
- `app.json` recibio el plugin:
  - `expo-sqlite`.
- Se creo schema SQLite en:
  - `src/services/classroom/sqlite/classroomSqliteSchema.ts`.
- Se creo adapter SQLite en:
  - `src/services/classroom/sqlite/classroomSqliteStorage.ts`.
- Se creo factory opt-in en:
  - `src/services/classroom/classroomRepositoryFactory.ts`.
- Se agregaron tests en:
  - `src/__tests__/classroom/classroomSqliteStorage.test.ts`.

## Tablas creadas por el schema

- `schema_migrations`.
- `groups`.
- `students`.
- `classroom_units`.
- `tasks`.
- `resources`.
- `attendance`.
- `grades`.
- `submissions`.
- `sync_queue`.
- `failed_sync_ops`.

## Indices creados

- `students(group_id)`.
- `classroom_units(group_id, position)`.
- `tasks(group_id, due_date)`.
- `resources(group_id)`.
- `attendance(group_id, student_id, date)`.
- `grades(group_id, student_id, task_id)`.
- `submissions(task_id, student_id)`.
- `sync_queue(entity, created_at)`.

## Decision tecnica

El adapter guarda `payload_json` completo por entidad y tambien columnas relacionales minimas (`group_id`, `student_id`, `task_id`, fechas) para preparar queries posteriores.

Esto permite migrar con bajo riesgo sin perder compatibilidad con los tipos actuales de PlanearIA.

## Lo que no se hizo

- No se activo SQLite como default en la app.
- No se ejecuto migracion real sobre datos del dispositivo.
- No se borro AsyncStorage.
- No se cambio backend.

## Evidencia recomendada

Guardar capturas en:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/02-capturas-despues/`

Capturas:

| Archivo | Que capturar |
| --- | --- |
| `07-package-expo-sqlite-despues.png` | `package.json` mostrando `expo-sqlite`. |
| `08-app-json-plugin-sqlite-despues.png` | `app.json` mostrando plugin `expo-sqlite`. |
| `09-codigo-schema-sqlite-despues.png` | `classroomSqliteSchema.ts` mostrando tablas principales. |
| `10-codigo-adapter-sqlite-despues.png` | `classroomSqliteStorage.ts` mostrando `ExpoSQLiteClassroomStorage`. |
| `11-codigo-factory-sqlite-despues.png` | `classroomRepositoryFactory.ts` mostrando fallback web/AsyncStorage. |

## Validaciones

Ejecutadas:

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | OK |
| `npm run test:classroom -- --runInBand` | OK, 6 suites / 21 tests |

## Nota npm

Durante la instalacion, npm reporto vulnerabilidades del arbol de dependencias y un warning de peer dependency en `@10play/tentap-editor`. No bloquearon la instalacion ni las validaciones de esta fase.
