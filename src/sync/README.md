# Modulo Sync

Este modulo encapsula la sincronizacion offline-first global de PlanearIA. Ya no es una capa exclusiva de planeaciones: coordina datos academicos sincronizables como grupos, unidades, alumnos, asistencias, calificaciones, entregables, recursos y plantillas, y permite tareas custom para dominios con pipeline propio.

## Estructura

- `config/apiConfig.ts`: URL/API secret publica de demo, timeouts y validacion de entorno.
- `services/syncEngine.ts`: cola generica por entidad, flush, reintentos, fallidas y locks por cola.
- `services/entitySync.ts`: registry de entidades (`SYNC_ENTITIES`), push de cola, pull autoritativo, reconciliacion con pendientes y orquestacion `syncAllEntities`.
- `services/connectivity.ts`: lectura de estado online/offline por plataforma. La peticion real sigue siendo la prueba definitiva.
- `services/syncEvents.ts`: bus de eventos `entity-updated` para que contextos y pantallas recarguen datos despues de un pull.
- `services/syncQueueSqlite*`: infraestructura opt-in para migrar la cola a SQLite sin romper AsyncStorage default.
- `index.ts`: exportaciones publicas del modulo.

El estado global visible al usuario vive en `src/context/SyncContext.tsx` y la UI en `src/components/SyncStatusBanner.tsx`.

## Reglas de arquitectura

- Las pantallas no deben hacer CRUD remoto directo para datos academicos sincronizables.
- El flujo esperado es `Screen -> ViewModel -> Context/Service -> storage local + queueEntityOperation`.
- Todo modulo nuevo con datos sincronizables debe registrarse en `SYNC_ENTITIES` o declarar una `registerSyncTask` custom con justificacion.
- No crear clientes HTTP ad hoc ni colas paralelas si `entitySync`/`syncEngine` cubren el caso.
- Guest y dev-local trabajan offline/local; `canSyncRemotely()` exige API configurada y token real.
- Un pull fallido nunca toca storage local.
- Un pull exitoso debe reconciliar operaciones pendientes para no perder trabajo offline ni resucitar deletes pendientes.
- Los contextos que dependan de storage local deben escuchar `syncEvents` para refrescarse despues de un pull.
- Toda ruta backend sincronizable debe aislar por JWT/`userId` y ser idempotente ante reintentos offline.

## Como agregar una entidad sincronizable

1. Crear o confirmar el endpoint en `backend/routes/<entidad>.js`.
2. Garantizar JWT/`userId`, CORS, idempotencia y respuesta listable con `data.<responseKey>`.
3. Agregar la entrada en `SYNC_ENTITIES`:

```ts
miEntidad: {
  entity: "miEntidad",
  endpoint: "/api/mi-entidad",
  storageKey: "@planearia:mi_entidad",
  responseKey: "miEntidad",
}
```

4. En el Context/Service del modulo, encolar mutaciones con `queueEntityOperation`.
5. Escuchar `syncEvents` para recargar storage local cuando llegue `entity-updated`.
6. Validar:
   - crear/editar/borrar offline;
   - reconectar y sincronizar;
   - abrir otro dispositivo/web y confirmar datos;
   - apagar backend/MongoDB y confirmar que no se pierden datos locales.

## Documentacion relacionada

- `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
