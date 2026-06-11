# SQLite Fase 1 - Ports y repositories sobre AsyncStorage

> Fecha: 2026-06-11  
> Plan: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`  
> Estado: implementado sobre AsyncStorage, sin instalar `expo-sqlite`.

## Objetivo

Introducir una capa `ClassroomRepository` para que pantallas y ViewModels de Classroom/reportes dejen de leer claves `@planearia:*` directamente.

Esta fase prepara la migracion a SQLite sin cambiar todavia la persistencia real: el repository usa el mismo `ClassroomStoragePort` actual, cuya implementacion por defecto sigue siendo AsyncStorage.

## Cambios realizados

- Se creo `src/services/classroom/classroomRepository.ts`.
- Se mantuvo `src/services/classroom/classroomStorage.ts` como puerto bajo nivel:
  - `AsyncStorageClassroomStorage`.
  - `MemoryClassroomStorage`.
  - `CLASSROOM_STORAGE_KEYS`.
- Se conecto `src/services/classroom/classroomFacade.ts` al nuevo repository.
- Se movieron lecturas directas de AsyncStorage hacia `classroomRepository.readDataset()` en:
  - `src/hooks/useDetalleGrupoViewModel.ts`.
  - `src/hooks/useReportesGrupoViewModel.ts`.
  - `src/hooks/useReportesAlumnoViewModel.ts`.
- Se movio la escritura de alumnos de `useDetalleGrupoViewModel.ts` hacia `classroomRepository.replaceAlumnos()`.
- Se agrego `src/__tests__/classroom/classroomRepository.test.ts`.

## Alcance tecnico

El repository centraliza:

- Lectura del dataset academico completo.
- Normalizacion de claves legacy:
  - `@planearia:tareas`.
  - `@planearia:entregables`.
  - `@planearia:entregas`.
- Filtrado por grupo para alumnos, actividades, materiales, asistencias, calificaciones y entregas.
- Operaciones de unidades Classroom.
- Reemplazo controlado de alumnos.

## Lo que no se hizo

- No se instalo `expo-sqlite`.
- No se creo schema SQLite.
- No se migro ningun dato local.
- No se borraron claves legacy de AsyncStorage.
- No se cambio backend ni deploy.

## Evidencia de codigo posterior

Guardar capturas en:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/02-capturas-despues/`

Capturas recomendadas:

| Archivo | Que capturar |
| --- | --- |
| `01-codigo-classroom-repository-despues.png` | `src/services/classroom/classroomRepository.ts`, inicio del archivo con la interfaz `ClassroomRepository`. |
| `02-codigo-read-dataset-despues.png` | `src/services/classroom/classroomRepository.ts`, bloque `readDataset` donde lee `CLASSROOM_STORAGE_KEYS`. |
| `03-codigo-detalle-grupo-repository-despues.png` | `src/hooks/useDetalleGrupoViewModel.ts`, import de `classroomRepository` y uso de `readDataset` / `replaceAlumnos`. |
| `04-codigo-reportes-grupo-repository-despues.png` | `src/hooks/useReportesGrupoViewModel.ts`, uso de `classroomRepository.readDataset()`. |
| `05-codigo-reportes-alumno-repository-despues.png` | `src/hooks/useReportesAlumnoViewModel.ts`, uso de `classroomRepository.readDataset()`. |
| `06-codigo-tests-repository-despues.png` | `src/__tests__/classroom/classroomRepository.test.ts`, tests con `MemoryClassroomStorage`. |

## Validaciones

Ejecutadas durante la fase:

| Comando | Resultado | Nota |
| --- | --- | --- |
| `npm run typecheck` | OK | TypeScript sin errores despues de Fase 1. |
| `npm run test:classroom -- --runInBand` | OK | 4 suites, 15 tests passed. |
| `npm run test:sync -- --runInBand` | OK | 2 suites, 17 tests passed. El log de error persistente es esperado por una prueba de reintentos/fallidos. |
| `npm run lint -- --quiet` | OK | ESLint sin errores. |

Pendiente manual:

- Validacion manual de pantallas Classroom/Detalle/Reportes usando la misma ruta de capturas de Fase 0.

## Siguiente paso

Antes de aprobar Fase 2, validar manualmente que las pantallas siguen cargando:

- Classroom Home.
- Classroom Group.
- Detalle del Grupo.
- Reportes del Grupo.
- Reportes del Alumno, si hay datos demo.
