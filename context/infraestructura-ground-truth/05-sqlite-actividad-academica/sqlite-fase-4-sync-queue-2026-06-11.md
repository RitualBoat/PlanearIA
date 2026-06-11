# SQLite Fase 4 - Sync queue SQLite

> Fecha: 2026-06-11  
> Plan: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`  
> Estado: implementado como infraestructura opt-in, sin activar como default.

## Objetivo

Preparar la migracion de la cola offline-first desde AsyncStorage hacia SQLite:

- `@planearia:pending_ops_v2_<entity>` -> `sync_queue`.
- `@planearia:failed_ops_v2` -> `failed_sync_ops`.

## Cambios realizados

- Se exportaron constantes de claves legacy en:
  - `src/sync/services/syncEngine.ts`.
- Se creo storage SQLite para colas en:
  - `src/sync/services/syncQueueSqliteStorage.ts`.
- Se creo migrador con snapshot JSON previo en:
  - `src/sync/services/syncQueueSqliteMigration.ts`.
- Se agregaron tests:
  - `src/__tests__/sync/syncQueueSqliteStorage.test.ts`.
  - `src/__tests__/sync/syncQueueSqliteMigration.test.ts`.

## Flujo implementado

1. Recibir lista explicita de entidades a migrar.
2. Leer `@planearia:pending_ops_v2_<entity>` por cada entidad.
3. Leer `@planearia:failed_ops_v2`.
4. Crear snapshot JSON con pending y failed.
5. Escribir pending en `sync_queue`.
6. Escribir fallidas en `failed_sync_ops`.
7. Devolver conteos migrados.

## Decision tecnica

La migracion de sync queue queda opt-in y no reemplaza todavia `syncEngine`.

Motivo:

- Primero se necesita validar que las colas existentes del dispositivo se pueden leer correctamente.
- No se deben borrar claves legacy hasta completar Fase 5.
- `syncEngine` conserva el comportamiento productivo actual sobre AsyncStorage.

## Evidencia recomendada

Guardar capturas en:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/02-capturas-despues/`

Capturas:

| Archivo | Que capturar |
| --- | --- |
| `15-codigo-sync-storage-sqlite-despues.png` | `src/sync/services/syncQueueSqliteStorage.ts`, clase `SyncQueueSQLiteStorage`. |
| `16-codigo-sync-migration-despues.png` | `src/sync/services/syncQueueSqliteMigration.ts`, funcion `migrateSyncQueueAsyncStorageToSQLite`. |
| `17-codigo-sync-engine-keys-despues.png` | `src/sync/services/syncEngine.ts`, constantes `SYNC_PENDING_OPS_STORAGE_PREFIX` y `SYNC_FAILED_OPS_STORAGE_KEY`. |
| `18-terminal-test-sync-fase4.png` | Terminal mostrando `npm run test:sync -- --runInBand` con 4 suites / 22 tests. |

## Validaciones

Ejecutadas:

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | OK |
| `npm run test:sync -- --runInBand` | OK, 4 suites / 22 tests |

## Pendiente para Fase 5

Validar manualmente:

- App abre Classroom Home.
- App abre Classroom Group.
- App abre Detalle del Grupo.
- App abre Reportes.
- Crear o simular una operacion offline y confirmar que el comportamiento actual de sync no cambio.

No borrar todavia:

- `@planearia:pending_ops_v2_<entity>`.
- `@planearia:failed_ops_v2`.
