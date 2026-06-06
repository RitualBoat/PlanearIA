# Evidencia Storage - Fase 6 Preparacion SQLite - 2026-06-06

## Alcance

Fase 6 del plan de infraestructura: preparar la futura migracion de storage local desde AsyncStorage hacia Expo SQLite, con evidencia util para una actividad academica.

No se instalo `expo-sqlite`, no se migro ningun dato, no se cambio comportamiento runtime y no se tocaron secretos.

## Fuentes locales revisadas

- `Documentacion/01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md`
- `Documentacion/01-planes-maestros/PLAN_CLASSROOM.md`
- `Documentacion/05-analisis-ia/INFRAESTRUCTURA_SUGERIDA.md`
- `src/services/classroom/classroomStorage.ts`
- `src/services/classroom/classroomFacade.ts`
- `src/sync/config/apiConfig.ts`
- `src/sync/services/syncEngine.ts`
- Contexts y hooks con uso directo de AsyncStorage.

## Inventario AsyncStorage actual

| Area | Claves principales | Lectura |
| --- | --- | --- |
| Auth/sesion | `@planearia:auth_token`, `@planearia:auth_user`, `@planearia:is_guest` | Debe seguir en storage simple/seguro; no es prioridad SQLite. |
| Preferencias | `APP_LANGUAGE`, `APP_THEME_MODE`, `APP_FONT_SIZE_MODE`, `APP_DALTONISMO_MODE` | Datos pequenos, no relacionales. Mantener fuera de SQLite salvo wrapper comun. |
| Planeaciones | `@planearia:planeaciones_v2`, `@planearia:planeaciones`, `@planearia:last_sync_planeaciones_v2` | Datos pesados y versionados; buen candidato a repository, pero migrar despues de Classroom porque es mas complejo. |
| Classroom/grupos | `@planearia:grupos`, `@planearia:grupos_pending_ops` | Candidato fuerte: entidad raiz para relaciones academicas. |
| Classroom/alumnos | `@planearia:alumnos` | Candidato fuerte: requiere filtros por `grupoId`, reportes y joins con calificaciones/asistencia. |
| Classroom/unidades | `@planearia:unidades_classroom` | Candidato fuerte: orden, grupo, actividades y sync pendiente. |
| Classroom/tareas | `@planearia:entregables`, `@planearia:tareas` | Candidato fuerte; hay uso mixto entre clave actual y legacy. Requiere normalizacion antes de migrar. |
| Classroom/recursos | `@planearia:recursos` | Candidato medio/fuerte: se relaciona con grupo y tareas/materiales. |
| Classroom/asistencias | `@planearia:asistencias` | Candidato fuerte: consultas por grupo, alumno, fecha y periodo. |
| Classroom/calificaciones | `@planearia:calificaciones` | Candidato fuerte: consultas por grupo, alumno, tarea y periodo. |
| Classroom/entregas | `@planearia:entregas`, fallback `@planearia:entregables` | Candidato fuerte; hoy hay fallback/legacy que SQLite debe limpiar con migracion controlada. |
| Reportes/notas | `@planearia:comentarios_alumno`, lecturas cruzadas de alumnos/tareas/asistencias/calificaciones/entregas | Sufre por joins manuales y arrays JSON completos. |
| Sync generico | `@planearia:pending_ops_v2_<entity>`, `@planearia:failed_ops_v2`, `@planearia:pending_ops`, `@planearia:last_sync`, `@planearia:device_id`, `@planearia:initial_sync` | Migracion futura debe mantener cola offline-first y rollback. |
| Plantillas/editor | `@planearia:plantillas`, `@planearia:plantillas_documento_v2`, `@planearia:doceditor_draft:<id>` | Migrar despues de estabilizar Classroom; drafts pueden seguir como storage simple inicialmente. |
| Social/comunicacion | `APP_CONTACTOS_DATA`, `APP_SOLICITUDES_DATA`, `APP_CONVERSACIONES_DATA`, `APP_MENSAJES_DATA`, `APP_NOTIFICACIONES_DATA`, `APP_POSTS_DATA` | No prioridad de la primera migracion SQLite; se puede evaluar en una fase social futura. |
| IA/cache | `@planearia:copiloto_recent_results` | Cache pequeno; mantener en AsyncStorage o TTL cache. |

## Datos relacionales que mas sufren hoy

- `grupos -> alumnos`: conteos, busqueda, alta/baja y reportes.
- `grupos -> unidades -> tareas`: orden, materiales, actividad reciente y pendientes.
- `tareas -> entregas -> alumnos`: estado de entrega, tardia/no entregada y promedio.
- `grupos/alumnos -> asistencias`: consultas por fecha, periodo y resumen.
- `grupos/alumnos/tareas -> calificaciones`: promedio, aprobacion, reportes y comparativas.
- `planeaciones -> sync`: documentos pesados con versionado, busqueda y last-write-wins.

El problema actual no es que AsyncStorage falle para datos pequenos. El problema es que varios flujos cargan arrays completos y hacen filtros/joins en memoria desde claves separadas.

## Matriz de alternativas

| Alternativa | Costo | Offline | Relaciones/consultas | Complejidad | Encaje PlanearIA |
| --- | --- | --- | --- | --- | --- |
| AsyncStorage actual | $0 | Bueno para datos simples | Debil para joins, indices y volumen | Baja | Mantener para preferencias, auth simple, caches y flags. No escalar datos academicos aqui. |
| Expo SQLite | $0 | Excelente local-first | Fuerte: tablas, indices, transacciones, consultas por periodo | Media | Primera opcion recomendada. Encaja con Expo, bajo costo y migracion incremental por repositories. |
| WatermelonDB | $0 | Excelente en datasets grandes | Muy fuerte, orientado a sync local-first | Alta | Potente, pero demasiado para este momento si todavia no hay usuarios reales ni volumen masivo. |
| Realm | Free/dev, revisar licencias/SDK al usar | Muy bueno | Fuerte como object database | Media/alta | Buena opcion tecnica, pero agrega dependencia conceptual y posible lock-in. No default. |
| Mongo local | $0 local, mas infraestructura | Bueno si se corre servicio local | Fuerte como documento/queries | Alta operativa | No conviene en movil/Expo como storage local. Puede servir para backend/dev, no para app offline. |

## Decision preliminar

Expo SQLite queda como primera opcion low-cost para la futura migracion de datos academicos relacionales.

Regla de alcance:

- Mantener AsyncStorage para preferencias, caches, flags, drafts simples y sesion si no se introduce SecureStore.
- Migrar primero Classroom academico: grupos, alumnos, unidades, tareas, recursos, asistencias, calificaciones y entregas.
- Migrar Planeaciones despues, cuando el repositorio SQLite y la estrategia de backup/rollback ya esten probados.
- No instalar SQLite ni crear tablas hasta que se apruebe el plan futuro de storage.

## Esquema preliminar recomendado

Primera ola:

- `groups`
- `students`
- `classroom_units`
- `tasks`
- `resources`
- `attendance`
- `grades`
- `submissions`
- `sync_queue`
- `failed_sync_ops`
- `schema_migrations`

Indices iniciales:

- `students(group_id)`
- `classroom_units(group_id, position)`
- `tasks(group_id, due_date)`
- `resources(group_id)`
- `attendance(group_id, student_id, date)`
- `grades(group_id, student_id, task_id)`
- `submissions(task_id, student_id)`
- `sync_queue(entity, created_at)`

## Flujo antes/despues

Antes:

```text
Screen -> ViewModel/Context -> AsyncStorage key -> JSON array completo -> filtros en memoria
```

Despues:

```text
Screen -> ViewModel -> Repository -> SQLite tables/indices -> Sync queue -> Backend
```

## Checklist academico antes de migrar

- [ ] Captura de app funcionando con datos actuales de Classroom.
- [ ] Captura de detalle de grupo con alumnos/tareas/asistencia/calificaciones.
- [ ] Captura de reportes de grupo o alumno usando datos actuales.
- [ ] Captura o snippet de `src/services/classroom/classroomStorage.ts`.
- [ ] Captura o snippet de una lectura directa a AsyncStorage en reportes.
- [ ] Terminal con `npm run typecheck` pasando.
- [ ] Terminal con `npm run test:classroom -- --runInBand` pasando.
- [ ] Terminal con `npm run test:sync -- --runInBand` pasando.
- [ ] Diagrama antes: `Screen -> ViewModel/Context -> AsyncStorage`.
- [ ] Texto del problema: arrays JSON completos, joins manuales, claves legacy/fallback.

## Checklist academico despues de migrar

- [ ] Captura de schema/tablas o migraciones ejecutadas.
- [ ] Captura de app con la misma pantalla funcionando tras migrar.
- [ ] Captura de reportes consultando datos migrados.
- [ ] Terminal con `npm run typecheck` pasando.
- [ ] Terminal con `npm run test:classroom -- --runInBand` pasando.
- [ ] Terminal con `npm run test:sync -- --runInBand` pasando.
- [ ] Evidencia de migracion AsyncStorage -> SQLite sin perdida para datos demo.
- [ ] Evidencia de rollback o backup local.
- [ ] Diagrama despues: `Screen -> ViewModel -> Repository -> SQLite -> Sync`.

## Riesgos

- Duplicidad por claves legacy `@planearia:tareas`, `@planearia:entregables` y `@planearia:entregas`.
- Migrar Planeaciones demasiado pronto puede mezclar documentos pesados, drafts y sync en una misma fase.
- SQLite en web requiere ruta separada o fallback, porque la app tambien se prueba con Expo web.
- Cambiar storage sin repositories puede obligar a tocar demasiadas pantallas a la vez.
- Sin backup/rollback, una migracion fallida podria borrar datos locales de demo.

## Mitigaciones

- Introducir repositories primero y mantener `ClassroomStoragePort` como frontera.
- Migrar una entidad vertical por vez empezando por lectura, luego escritura, luego sync.
- Mantener export/backup JSON antes de ejecutar migracion destructiva.
- Mantener AsyncStorage como fallback durante una fase de convivencia.
- Escribir tests de migracion con fixtures pequenos antes de tocar datos reales.

## Estado

Fase 6 deja preparada la decision y la evidencia academica. La migracion real queda para el plan futuro de storage.

## Validacion tecnica

- `npm run typecheck`: OK.
- `npm run test:classroom -- --runInBand`: OK, 3 suites / 12 tests.
- `npm run test:sync -- --runInBand`: OK, 2 suites / 17 tests.
- `npm test -- --runInBand`: OK, 73 suites / 549 tests.
- `git diff --check`: OK; solo warnings esperados de CRLF en Windows.

Warnings conocidos:

- `baseline-browser-mapping` desactualizado.
- Warnings esperados de `expo-notifications` en Jest/Expo Go.
- Logs esperados de sync con errores simulados.
- Warnings existentes de `act(...)` en pruebas.

## GitHub

- Issue: `https://github.com/RitualBoat/PlanearIA/issues/16`
- Project status: `Review Manual`.
