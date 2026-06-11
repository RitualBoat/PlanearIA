# SQLite Fase 3 - Migracion con snapshot JSON

> Fecha: 2026-06-11  
> Plan: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`  
> Estado: implementado como servicio opt-in, no ejecutado automaticamente.

## Objetivo

Crear el flujo tecnico para migrar datos academicos desde AsyncStorage hacia SQLite con backup JSON previo.

## Cambios realizados

- Se creo:
  - `src/services/classroom/sqlite/classroomSqliteMigration.ts`.
- Se agregaron tests:
  - `src/__tests__/classroom/classroomSqliteMigration.test.ts`.

## Flujo implementado

1. Leer claves academicas actuales desde `ClassroomStoragePort`.
2. Crear snapshot JSON previo con:
   - version.
   - fecha/hora.
   - contenido por clave `@planearia:*`.
3. Normalizar dataset con `ClassroomRepository`.
4. Escribir datos normalizados en storage destino SQLite.
5. Devolver conteos migrados.

## Claves incluidas en snapshot

- `@planearia:grupos`.
- `@planearia:alumnos`.
- `@planearia:unidades_classroom`.
- `@planearia:entregables`.
- `@planearia:tareas`.
- `@planearia:recursos`.
- `@planearia:asistencias`.
- `@planearia:calificaciones`.
- `@planearia:entregas`.

## Normalizacion legacy

El flujo usa `ClassroomRepository.readDataset()` para resolver duplicados/legado:

- `@planearia:tareas`.
- `@planearia:entregables`.
- `@planearia:entregas`.

Nota: `@planearia:entregables` es una clave historica conflictiva porque algunos flujos la tratan como tareas y otros como entregas legacy. Por eso la migracion debe pasar por normalizacion antes de escribir SQLite.

## Lo que no se hizo

- No se ejecuto migracion real en el dispositivo.
- No se activo SQLite como storage default.
- No se borro ninguna clave AsyncStorage.
- No se implemento todavia migracion de sync queue; eso corresponde a Fase 4.

## Evidencia recomendada

Guardar capturas en:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/02-capturas-despues/`

Capturas:

| Archivo | Que capturar |
| --- | --- |
| `12-codigo-migration-snapshot-despues.png` | `classroomSqliteMigration.ts`, funciones `buildClassroomMigrationSnapshot` y `migrateClassroomAsyncStorageToSQLite`. |
| `13-codigo-migration-tests-despues.png` | `classroomSqliteMigration.test.ts`, tests de snapshot y migracion. |
| `14-terminal-classroom-tests-fase3.png` | Terminal mostrando `npm run test:classroom -- --runInBand` con 6 suites / 21 tests. |

## Validaciones

Ejecutadas:

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | OK |
| `npm run test:classroom -- --runInBand` | OK, 6 suites / 21 tests |

## Siguiente paso

Fase 4 debe migrar:

- `@planearia:pending_ops_v2_<entity>` hacia `sync_queue`.
- `@planearia:failed_ops_v2` hacia `failed_sync_ops`.

Antes de activar esa fase, conviene validar manualmente que la app sigue abriendo las pantallas de Classroom/Detalle/Reportes tras instalar `expo-sqlite`.
