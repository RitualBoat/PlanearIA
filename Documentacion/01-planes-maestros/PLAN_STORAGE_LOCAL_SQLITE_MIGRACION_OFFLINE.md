# Plan Maestro: Storage Local SQLite y Migracion Offline

> **Version:** 0.1
> **Fecha:** 2026-06-06
> **Estado:** [ ] Plan futuro preparado. No iniciar sin decision explicita.
> **Origen:** Fase 6 del plan `PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md`.
> **Alcance:** migrar datos academicos relacionales desde AsyncStorage a Expo SQLite sin romper offline-first, sync ni demos.

---

## 1. Objetivo

Convertir el storage local academico de PlanearIA en una capa robusta, consultable y migrable usando Expo SQLite como primera opcion.

Este plan no busca cambiar todo el almacenamiento de la app. Busca migrar primero los datos que hoy sufren por estar en arrays JSON separados:

- Grupos.
- Alumnos.
- Unidades Classroom.
- Tareas/actividades.
- Recursos/materiales.
- Asistencias.
- Calificaciones.
- Entregas.
- Cola de sync relacionada.

Quedan fuera de la primera ola:

- Preferencias de UI.
- Idioma/tema/accesibilidad.
- Caches pequenos.
- Drafts simples.
- Social/mensajes/notificaciones.
- Planeaciones V2, hasta validar la primera migracion academica.

---

## 2. Decisiones Base

- Usar **Expo SQLite** como primera opcion low-cost.
- Mantener **AsyncStorage** para datos simples y como fallback temporal.
- No introducir WatermelonDB/Realm salvo que Expo SQLite bloquee rendimiento o sync.
- No migrar sin backup local JSON previo.
- No tocar backend ni deploy en esta fase.
- Mantener arquitectura MVVM: pantallas y ViewModels no deben hablar directo con SQLite.
- Introducir repositories/ports antes de cambiar persistencia real.
- Mantener compatibilidad de demo en Expo web con fallback o adaptador de memoria/AsyncStorage.

---

## 3. Arquitectura Objetivo

```text
Screen
  -> ViewModel/Context
    -> Domain Repository
      -> LocalStoragePort
        -> SQLite adapter native
        -> AsyncStorage/web fallback
      -> SyncQueueRepository
        -> Backend API
```

Primer punto de entrada recomendado:

- Expandir `src/services/classroom/classroomStorage.ts`.
- Convertir `ClassroomStoragePort` en un puerto mas rico para queries por entidad.
- Evitar que pantallas nuevas lean `AsyncStorage.getItem("@planearia:*")` directamente.

---

## 4. Esquema Inicial

Tablas:

| Tabla | Proposito |
| --- | --- |
| `schema_migrations` | Versiones aplicadas y rollback logico. |
| `groups` | Grupos academicos. |
| `students` | Alumnos y relacion con grupo. |
| `classroom_units` | Unidades/secciones dentro de grupo. |
| `tasks` | Actividades, tareas y materiales asignables. |
| `resources` | Recursos/biblioteca/materiales. |
| `attendance` | Asistencias por alumno/grupo/fecha. |
| `grades` | Calificaciones por alumno/tarea/grupo. |
| `submissions` | Entregas por tarea/alumno. |
| `sync_queue` | Operaciones pendientes offline-first. |
| `failed_sync_ops` | Operaciones que agotaron reintentos. |

Indices minimos:

- `students(group_id)`
- `classroom_units(group_id, position)`
- `tasks(group_id, due_date)`
- `resources(group_id)`
- `attendance(group_id, student_id, date)`
- `grades(group_id, student_id, task_id)`
- `submissions(task_id, student_id)`
- `sync_queue(entity, created_at)`

---

## 5. Estrategia de Migracion

### Fase 0: Baseline y Evidencia

- Capturar pantallas actuales con datos de demo.
- Guardar evidencia de `npm run typecheck`, `npm run test:classroom -- --runInBand` y `npm run test:sync -- --runInBand`.
- Congelar inventario de claves AsyncStorage.
- Crear fixtures pequenos de grupos/alumnos/tareas/asistencia/calificaciones/entregas.

### Fase 1: Ports y Repositories

- Crear `ClassroomRepository` con metodos de lectura/escritura necesarios.
- Mantener implementacion inicial sobre AsyncStorage.
- Mover lecturas directas de reportes/detalle hacia repository.
- Agregar tests para repository con storage en memoria.

### Fase 2: SQLite Adapter

- Instalar `expo-sqlite` solo si se aprueba la fase.
- Crear migraciones de schema.
- Crear adaptador SQLite para `ClassroomRepository`.
- Mantener fallback AsyncStorage/web.

### Fase 3: Migracion de Datos

- Leer claves AsyncStorage actuales.
- Normalizar duplicados legacy:
  - `@planearia:tareas`
  - `@planearia:entregables`
  - `@planearia:entregas`
- Insertar en tablas SQLite con transaccion.
- Marcar version de migracion en `schema_migrations`.
- No borrar AsyncStorage hasta completar validacion manual.

### Fase 4: Sync Queue

- Migrar cola `@planearia:pending_ops_v2_<entity>` hacia `sync_queue`.
- Migrar `@planearia:failed_ops_v2` hacia `failed_sync_ops`.
- Mantener Last-Write-Wins o definir estrategia mejor si aparecen conflictos reales.

### Fase 5: Validacion Manual

- Repetir mismas pantallas de baseline.
- Confirmar reportes por grupo/alumno.
- Confirmar crear/editar offline y reconectar.
- Confirmar que no hay duplicados.
- Guardar evidencia antes/despues.

### Fase 6: Limpieza Controlada

- Mantener rollback una version.
- Borrar claves legacy solo tras aprobacion manual.
- Actualizar documentacion y cierre.

---

## 6. Rollback

Antes de migrar:

- Exportar snapshot JSON de claves academicas.
- Guardar version de schema.
- Registrar fecha/hora de migracion.

Si algo falla:

- Mantener app usando AsyncStorage fallback.
- No borrar claves legacy.
- Permitir reset de SQLite local.
- Reintentar migracion desde snapshot.

---

## 7. Pruebas Obligatorias

Minimas:

- `npm run typecheck`
- `npm run test:classroom -- --runInBand`
- `npm run test:sync -- --runInBand`

Cuando exista SQLite adapter:

- Tests de migracion AsyncStorage -> SQLite con fixtures.
- Tests de queries por grupo, alumno, periodo y tarea.
- Tests de fallback web/AsyncStorage.
- Tests de rollback/reset local.

---

## 8. Evidencia Academica

Antes:

- Pantalla de Classroom funcionando.
- Detalle de grupo con datos.
- Reporte de grupo/alumno.
- Fragmento de AsyncStorage actual.
- Terminal con validaciones.
- Diagrama antes.

Despues:

- Schema/tablas.
- Misma pantalla funcionando.
- Reporte usando datos migrados.
- Terminal con validaciones.
- Diagrama despues.
- Evidencia de rollback/backup.

---

## 9. Criterio de Inicio

No iniciar este plan hasta que el usuario confirme:

- Que la actividad academica requiere migracion real o prototipo SQLite.
- Que se puede instalar `expo-sqlite`.
- Si la prioridad es Classroom primero o Planeaciones primero.
- Si se necesita soporte web completo en la misma fase.

---

## 10. Estado

Plan preparado. Siguiente accion recomendada cuando toque: ejecutar Fase 0 de baseline y leer el PDF/instrucciones especificas de la actividad academica.
