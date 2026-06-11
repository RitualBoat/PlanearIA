# SQLite Fase 6 - Limpieza controlada y cierre

> Fecha: 2026-06-11  
> Plan: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`  
> Estado: cierre academico completado, sin borrar claves legacy.

## Objetivo

Cerrar el plan SQLite con una decision segura para entrega academica:

- Mantener rollback inmediato.
- No borrar datos legacy de AsyncStorage.
- Dejar SQLite como infraestructura demostrable, testeada y reversible.
- Documentar el estado final y el siguiente paso futuro.

## Decision de limpieza

No se borran claves legacy de AsyncStorage en esta entrega.

Motivos:

- AsyncStorage sigue siendo el almacenamiento productivo default.
- SQLite quedo implementado como infraestructura opt-in, no como default.
- El borrado de claves legacy seria un riesgo innecesario para la demo.
- La actividad academica se beneficia mas de demostrar arquitectura, schema, migracion, snapshot y rollback.

Claves que se conservan:

- `@planearia:grupos`.
- `@planearia:alumnos`.
- `@planearia:unidades_classroom`.
- `@planearia:entregables`.
- `@planearia:tareas`.
- `@planearia:recursos`.
- `@planearia:asistencias`.
- `@planearia:calificaciones`.
- `@planearia:entregas`.
- `@planearia:pending_ops_v2_<entity>`.
- `@planearia:failed_ops_v2`.

## Estado final implementado

Fase 0:

- Baseline y evidencia antes.
- Inventario AsyncStorage.
- Fixture minimo academico.

Fase 1:

- `ClassroomRepository` sobre `ClassroomStoragePort`.
- Hooks de detalle/reportes dejaron de leer AsyncStorage directo para datos academicos principales.

Fase 2:

- `expo-sqlite` instalado.
- Schema SQLite creado.
- Adapter `ExpoSQLiteClassroomStorage`.
- Factory opt-in con fallback web/AsyncStorage.

Fase 3:

- Migracion AsyncStorage -> SQLite implementada como servicio opt-in.
- Snapshot JSON previo.
- Conteos de entidades migradas.

Fase 4:

- Storage SQLite para `sync_queue` y `failed_sync_ops`.
- Migracion opt-in de colas legacy.
- Snapshot de pending/failed ops.

Fase 5:

- Validacion manual aprobada por el usuario.

Fase 6:

- Cierre documentado.
- Sin borrado destructivo.

## Rollback

Rollback inmediato:

1. No activar `createClassroomRepositoryForMode("sqlite")`.
2. Seguir usando repository default con AsyncStorage.
3. Mantener intactas las claves `@planearia:*`.

Rollback si se ejecuta una migracion futura:

1. Conservar snapshot JSON generado por `buildClassroomMigrationSnapshot`.
2. Restaurar datos desde snapshot hacia AsyncStorage si hace falta.
3. Resetear o ignorar la base SQLite local.
4. Volver a usar modo `async-storage`.

## Evidencia final recomendada

Guardar capturas en:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/02-capturas-despues/`

Capturas:

| Archivo | Que capturar |
| --- | --- |
| `32-plan-sqlite-cerrado-fase6.png` | `PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md` mostrando estado cerrado. |
| `33-evidencia-fase6-cierre.png` | Este archivo mostrando la decision de no borrar legacy. |
| `34-terminal-typecheck-final.png` | Terminal con `npm run typecheck` OK. |
| `35-terminal-classroom-final.png` | Terminal con `npm run test:classroom -- --runInBand` OK. |
| `36-terminal-sync-final.png` | Terminal con `npm run test:sync -- --runInBand` OK. |
| `37-terminal-lint-final.png` | Terminal con `npm run lint -- --quiet` OK. |

## Validaciones finales

Ejecutadas el 2026-06-11:

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | OK |
| `npm run test:classroom -- --runInBand` | OK, 6 suites / 21 tests |
| `npm run test:sync -- --runInBand` | OK, 4 suites / 22 tests |
| `npm run lint -- --quiet` | OK |
| `git diff --check` | OK, solo avisos CRLF normales de Windows |

## Resultado academico

El plan demuestra:

- Analisis de estado inicial.
- Refactor a ports/repositories.
- Instalacion e integracion de SQLite.
- Schema relacional.
- Adapter local.
- Migracion con snapshot.
- Migracion de sync queue.
- Validacion manual.
- Rollback y cierre sin perdida de datos.

## Siguiente paso futuro

Cuando ya no sea solo demo academica:

1. Ejecutar migracion real en un entorno controlado.
2. Activar `createClassroomRepositoryForMode("sqlite")` para native.
3. Mantener fallback web/AsyncStorage.
4. Observar datos duplicados o inconsistentes.
5. Solo despues de otra aprobacion manual, considerar limpieza de claves legacy.
