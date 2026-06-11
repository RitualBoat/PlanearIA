# SQLite Fase 0 - Baseline y evidencia antes de migrar

> Fecha: 2026-06-10  
> Plan: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`  
> Estado: completada como baseline documental, sin instalar `expo-sqlite`.

## Objetivo

Congelar el estado actual de Classroom academico antes de migrar datos relacionales desde AsyncStorage hacia SQLite.

Esta fase existe para demostrar el "antes" de la actividad academica: pantallas funcionando, datos actuales, puntos de codigo que usan AsyncStorage y validaciones verdes.

## Alcance congelado

Primera ola SQLite:

- Grupos.
- Alumnos.
- Unidades Classroom.
- Tareas/actividades.
- Recursos/materiales.
- Asistencias.
- Calificaciones.
- Entregas.
- Cola de sync relacionada.

Fuera de esta primera ola:

- Preferencias de UI.
- Idioma, tema y accesibilidad.
- Drafts simples.
- Social, mensajes y notificaciones.
- Planeaciones V2.

## Estado tecnico antes

El estado actual usa AsyncStorage como almacenamiento local principal para Classroom.

Puntos ya abstraidos parcialmente:

- `src/services/classroom/classroomStorage.ts`
  - Define `ClassroomStoragePort`.
  - Define `AsyncStorageClassroomStorage`.
  - Define `MemoryClassroomStorage` para pruebas.
  - Centraliza `CLASSROOM_STORAGE_KEYS`.
- `src/services/classroom/classroomFacade.ts`
  - Consume `ClassroomStoragePort`.
  - Lee datasets de Classroom y expone consultas por grupo.

Puntos que aun leen AsyncStorage directo y son prioridad de Fase 1:

- `src/hooks/useDetalleGrupoViewModel.ts`
  - Lee/escribe alumnos, tareas, recursos, asistencias, calificaciones y entregas.
- `src/hooks/useReportesGrupoViewModel.ts`
  - Lee alumnos, tareas, asistencias, calificaciones y entregas para reportes.
- `src/hooks/useReportesAlumnoViewModel.ts`
  - Lee datasets similares para reportes por alumno.
- `src/services/grupoAsignacionesService.ts`
  - Lee/escribe recursos y entregables.
- `src/hooks/useCalificarEntregasViewModel.ts`
  - Lee/escribe entregas.
- `src/sync/services/syncEngine.ts`
  - Mantiene cola `@planearia:pending_ops_v2_<entity>` y fallidos `@planearia:failed_ops_v2`.

## Claves AsyncStorage academicas congeladas

| Clave                                | Uso actual                                                       | Primera ola           |
| ------------------------------------ | ---------------------------------------------------------------- | --------------------- |
| `@planearia:grupos`                  | Grupos academicos                                                | Si                    |
| `@planearia:grupos_pending_ops`      | Operaciones pendientes legacy de grupos                          | Revisar               |
| `@planearia:alumnos`                 | Alumnos por grupo                                                | Si                    |
| `@planearia:unidades_classroom`      | Unidades/secciones Classroom                                     | Si                    |
| `@planearia:tareas`                  | Tareas/actividades legacy                                        | Si                    |
| `@planearia:entregables`             | Entregables/fallback usado tambien como tareas en algunos flujos | Si, con normalizacion |
| `@planearia:recursos`                | Recursos/materiales                                              | Si                    |
| `@planearia:asistencias`             | Asistencia por alumno/fecha                                      | Si                    |
| `@planearia:calificaciones`          | Calificaciones por alumno/tarea                                  | Si                    |
| `@planearia:entregas`                | Entregas por tarea/alumno                                        | Si                    |
| `@planearia:pending_ops_v2_<entity>` | Cola offline-first por entidad                                   | Si, Fase 4            |
| `@planearia:failed_ops_v2`           | Operaciones fallidas de sync                                     | Si, Fase 4            |

## Fixture minimo

Se creo un fixture academico sin datos personales reales:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/fixtures/classroom-storage-fixture-minimo.json`

Uso futuro:

- Tests de migracion AsyncStorage -> SQLite.
- Verificacion de normalizacion de grupo, alumnos, tarea, asistencia, calificacion y entrega.
- Evidencia academica sin exponer informacion sensible.

## Error comun al correr validaciones

Comando incorrecto:

```bash
npx run typecheck
```

Ese comando no ejecuta el script del proyecto. Instala/usa un paquete externo llamado `run` y despues intenta abrir un archivo llamado `typecheck`, por eso aparece:

```text
Cannot find module 'C:\Users\jarco\dev\PlanearIA\typecheck'
```

Comando correcto:

```bash
npm run typecheck
```

Para las otras validaciones usar:

```bash
npm run test:classroom -- --runInBand
npm run test:sync -- --runInBand
```

## Evidencia de capturas antes

Guardar capturas en:

- `context/infraestructura-ground-truth/05-sqlite-actividad-academica/01-capturas-antes/`

Ruta absoluta en Windows:

- `C:\Users\jarco\dev\PlanearIA\context\infraestructura-ground-truth\05-sqlite-actividad-academica\01-capturas-antes\`

### Capturas en Expo Go o navegador

Antes de tomar capturas, abre la app con:

```bash
npm run web
```

O, si usaras Expo Go en celular:

```bash
npm start
```

Luego toma estas capturas:

1. `01-classroom-home-antes.png`
   - Entra a la app.
   - Ve a la pestana inferior **Grupos**.
   - Debe verse la pantalla tipo Classroom con el titulo **Classroom** o tarjetas de cursos/grupos.
   - Captura cuando se vea al menos un grupo/curso o el estado vacio si todavia no tienes grupos.

2. `02-classroom-grupo-tablon-antes.png`
   - Desde la pestana **Grupos**, toca una tarjeta de grupo/curso.
   - Debe abrirse la pantalla **Classroom** del grupo (`ClassroomGroupScreen`).
   - Deja activa la pestana **Tablon**.
   - Captura donde se vea el nombre del grupo y el resumen/feed.

3. `03-classroom-grupo-trabajo-antes.png`
   - En la misma pantalla del grupo, toca la pestana **Trabajo de clase** o **Trabajo**.
   - Captura donde se vean unidades, tareas, actividades, recursos o el estado vacio.

4. `04-classroom-grupo-personas-antes.png`
   - En la misma pantalla del grupo, toca la pestana **Personas**.
   - Captura donde se vean alumnos/personas del grupo o el estado vacio.

5. `05-detalle-grupo-alumnos-antes.png`
   - Vuelve al listado de grupos si hace falta.
   - Abre el detalle tradicional del grupo, pantalla **Detalle del Grupo** (`DetalleGrupo`).
   - Deja activa la pestana **Alumnos**.
   - Captura la lista de alumnos o el contador/estado vacio.

6. `06-detalle-grupo-tareas-antes.png`
   - En **Detalle del Grupo**, cambia a la pestana **Tareas**.
   - Captura las tareas/actividades vinculadas o el estado vacio.

7. `07-detalle-grupo-asistencias-calificaciones-antes.png`
   - En **Detalle del Grupo**, toma una captura de **Asistencias** o **Calificaciones**.
   - Si puedes, elige la que tenga datos visibles.

8. `08-reporte-grupo-antes.png`
   - Desde **Detalle del Grupo**, toca el boton/enlace de reportes del grupo.
   - Debe abrir **Reportes del Grupo** (`ReportesGrupo`).
   - Captura metricas como promedio, asistencia, entregas o el estado vacio.

9. `09-reporte-alumno-antes.png`
   - Abre un alumno desde una lista/alerta si tienes datos.
   - Entra a **Progreso del Alumno** (`ReportesAlumno`).
   - Captura promedio, comparativa o historial.
   - Si no tienes alumnos, omite esta captura y anota en el reporte: "Sin alumnos demo disponibles".

### Capturas de terminal

Abre PowerShell en:

```powershell
cd C:\Users\jarco\dev\PlanearIA
```

Toma estas capturas despues de ejecutar cada comando:

1. `10-terminal-typecheck-antes.png`
   - Ejecuta:
     ```bash
     npm run typecheck
     ```
   - La captura debe mostrar `tsc --noEmit` y que no hubo errores.

2. `11-terminal-test-classroom-antes.png`
   - Ejecuta:
     ```bash
     npm run test:classroom -- --runInBand
     ```
   - La captura debe mostrar `Test Suites: 3 passed` y `Tests: 12 passed`.

3. `12-terminal-test-sync-antes.png`
   - Ejecuta:
     ```bash
     npm run test:sync -- --runInBand
     ```
   - La captura debe mostrar `Test Suites: 2 passed` y `Tests: 17 passed`.
   - Es normal ver logs de error simulado por una prueba de reintentos; lo importante es que el resultado final diga `PASS`.

### Capturas de codigo

Abre Visual Studio Code en el repo y toma estas capturas:

1. `13-codigo-classroom-storage-antes.png`
   - Archivo: `src/services/classroom/classroomStorage.ts`.
   - Captura desde el inicio del archivo hasta donde se vea completo `CLASSROOM_STORAGE_KEYS`.
   - Debe verse que existen claves como `@planearia:grupos`, `@planearia:alumnos`, `@planearia:tareas`, `@planearia:recursos`, `@planearia:asistencias`, `@planearia:calificaciones` y `@planearia:entregas`.

2. `14-codigo-detalle-grupo-asyncstorage-antes.png`
   - Archivo: `src/hooks/useDetalleGrupoViewModel.ts`.
   - Busca `const readArray`.
   - Captura desde `const readArray = useCallback...` hasta el bloque `Promise.all`.
   - Debe verse que lee directo `@planearia:alumnos`, `@planearia:tareas`, `@planearia:recursos`, `@planearia:asistencias`, `@planearia:calificaciones` y `@planearia:entregas`.

3. `15-codigo-reportes-grupo-asyncstorage-antes.png`
   - Archivo: `src/hooks/useReportesGrupoViewModel.ts`.
   - Busca `Promise.all`.
   - Captura desde `const [alumnosRaw, tareasRaw...` hasta `AsyncStorage.getItem("@planearia:entregas")`.
   - Debe verse que el reporte del grupo lee AsyncStorage directo.

4. `16-codigo-sync-queue-antes.png`
   - Archivo: `src/sync/services/syncEngine.ts`.
   - Captura la parte donde aparecen:
     - `STORAGE_PREFIX = "@planearia:pending_ops_v2_"`
     - `FAILED_OPS_KEY = "@planearia:failed_ops_v2"`
   - Esto demuestra que la cola offline tambien sigue en AsyncStorage antes de SQLite.

Nombres sugeridos:

| Archivo                                                 | Que capturar                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `01-classroom-home-antes.png`                           | Pantalla principal de Classroom con al menos un grupo visible.                                  |
| `02-classroom-grupo-tablon-antes.png`                   | Grupo abierto en Classroom, pestana Tablon.                                                      |
| `03-classroom-grupo-trabajo-antes.png`                  | Grupo abierto en Classroom, pestana Trabajo.                                                     |
| `04-classroom-grupo-personas-antes.png`                 | Grupo abierto en Classroom, pestana Personas.                                                    |
| `05-detalle-grupo-alumnos-antes.png`                    | Detalle del Grupo, pestana Alumnos.                                                              |
| `06-detalle-grupo-tareas-antes.png`                     | Detalle del Grupo, pestana Tareas.                                                               |
| `07-detalle-grupo-asistencias-calificaciones-antes.png` | Detalle del Grupo, Asistencias o Calificaciones.                                                |
| `08-reporte-grupo-antes.png`                            | Reportes del Grupo con metricas o estado vacio.                                                 |
| `09-reporte-alumno-antes.png`                           | Reporte individual de alumno, si hay datos disponibles.                                         |
| `10-terminal-typecheck-antes.png`                       | Terminal mostrando `npm run typecheck` exitoso.                                                 |
| `11-terminal-test-classroom-antes.png`                  | Terminal mostrando `npm run test:classroom -- --runInBand` exitoso.                             |
| `12-terminal-test-sync-antes.png`                       | Terminal mostrando `npm run test:sync -- --runInBand` exitoso.                                  |
| `13-codigo-classroom-storage-antes.png`                 | Codigo de `src/services/classroom/classroomStorage.ts` mostrando `CLASSROOM_STORAGE_KEYS`.      |
| `14-codigo-detalle-grupo-asyncstorage-antes.png`        | Codigo de `src/hooks/useDetalleGrupoViewModel.ts` mostrando lecturas directas de AsyncStorage.  |
| `15-codigo-reportes-grupo-asyncstorage-antes.png`       | Codigo de `src/hooks/useReportesGrupoViewModel.ts` mostrando lecturas directas de AsyncStorage. |
| `16-codigo-sync-queue-antes.png`                        | Codigo de `src/sync/services/syncEngine.ts` mostrando cola offline en AsyncStorage.             |

No capturar:

- `.env`.
- Tokens.
- MongoDB URI.
- API keys.
- Correos o nombres reales de estudiantes.
- Informacion personal real.

## Validaciones Fase 0

Ejecutadas el 2026-06-10:

| Comando                                 | Resultado | Nota                                                                                                      |
| --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                     | OK        | TypeScript sin errores.                                                                                   |
| `npm run test:classroom -- --runInBand` | OK        | 3 suites, 12 tests passed.                                                                                |
| `npm run test:sync -- --runInBand`      | OK        | 2 suites, 17 tests passed. El log de error persistente es esperado por una prueba de reintentos/fallidos. |

## Decision de corte

No se instalo `expo-sqlite` durante Fase 0. La siguiente fase tecnica fue crear repositories/ports usando AsyncStorage como implementacion inicial.

Nota: despues de ejecutar Fase 1, los archivos `useDetalleGrupoViewModel.ts`, `useReportesGrupoViewModel.ts` y `useReportesAlumnoViewModel.ts` ya no muestran lecturas directas a AsyncStorage para estos datos. Las capturas de codigo "antes" debieron tomarse antes de Fase 1; para evidencia posterior usar el documento de Fase 1.
