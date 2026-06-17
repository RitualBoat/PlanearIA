# Flujo de Sincronizacion Offline-First - PlanearIA

Este documento describe el flujo vigente. Reemplaza los diagramas antiguos basados en `SyncProvider`, `useSync` o `syncService.ts`.

Fuente tecnica:

- `src/sync/README.md`
- `src/sync/services/entitySync.ts`
- `src/sync/services/syncEngine.ts`
- `src/sync/services/syncEvents.ts`
- `src/context/SyncContext.tsx`
- `src/components/SyncStatusBanner.tsx`
- `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`

## Objetivo

PlanearIA debe permitir que el docente trabaje aunque no tenga internet. La UI guarda local primero, encola cambios y sincroniza con MongoDB cuando la red y la sesion lo permiten.

## Piezas Principales

| Pieza | Archivo | Responsabilidad |
| --- | --- | --- |
| Config API | `src/sync/config/apiConfig.ts` | URL backend, API secret publica de demo, timeout y validacion de entorno. |
| Cola | `src/sync/services/syncEngine.ts` | Pending ops por entidad, locks, reintentos, flush y fallidas. |
| Registry | `src/sync/services/entitySync.ts` | `SYNC_ENTITIES`, `queueEntityOperation`, `syncEntity`, `syncAllEntities`, `registerSyncTask`. |
| Eventos | `src/sync/services/syncEvents.ts` | Avisar a contextos cuando una entidad fue actualizada por pull. |
| Orquestador | `src/context/SyncContext.tsx` | Sincroniza en arranque, login, reconexion, foreground, polling y manual. |
| UI | `src/components/SyncStatusBanner.tsx` | Muestra offline, servidor caido, pendientes y error de auth. |
| Backend | `backend/routes/*` | CRUD idempotente, JWT, `userId`, CORS e indices. |

## Entidades Sincronizables

El registry cubre datos academicos como:

- grupos
- unidades
- alumnos
- asistencias
- calificaciones
- entregables
- recursos
- plantillas

`planeaciones` usa una tarea custom con `registerSyncTask` por su pipeline propio, pero debe obedecer las mismas reglas de sesion, cola, pull y no perdida de datos.

## Flujo De Escritura

```text
Pantalla
  -> ViewModel/hook
    -> Context/Service del dominio
      -> actualiza estado en memoria
      -> guarda en storage local
      -> queueEntityOperation(...)
        -> si hay token/API/red: intenta flush
        -> si no: queda pendiente
```

La UI no debe esperar a MongoDB para responder. El docente ve su cambio al instante.

## Flujo De Reconexion

```text
SyncContext detecta condicion de sync
  -> syncAllEntities()
    -> por cada entidad:
      -> PUSH: flush de operaciones pendientes
      -> PULL: GET lista autoritativa desde backend
      -> reconcileWithPending(...)
      -> guardar local si el pull fue exitoso
      -> emitir syncEvents entity-updated
        -> contextos recargan storage
```

Triggers actuales:

- arranque
- login
- reconexion
- app foreground
- polling mientras la app esta activa
- accion manual de sync

## Regla Mas Importante

Un pull fallido nunca toca storage local.

Si Vercel, MongoDB, CORS, JWT o la red fallan, la app mantiene datos locales, muestra estado visible y reintenta despues.

## Auth, CORS Y API Secret

- Las rutas academicas usan JWT y `userId`.
- `X-API-Key` queda como compatibilidad/demo donde aplique, pero un JWT valido debe bastar para el usuario autenticado.
- Si el frontend se publica en un dominio nuevo, ese origen debe estar en `ALLOWED_ORIGINS` o en el default de `backend/lib/auth.js`.
- Si CORS no permite el origen, el navegador puede mostrar "No se pudo conectar al servidor" aunque el backend este vivo.

## Invitado Y Dev Local

`canSyncRemotely()` evita sync remoto si:

- no hay API configurada;
- no hay token valido;
- la sesion es invitada/local;
- el entorno no debe llamar backend.

En esos casos, la app debe operar local sin pantalla roja.

## Como Agregar Una Entidad Nueva

1. Crear endpoint backend en `backend/routes/<entidad>.js`.
2. Asegurar JWT, `userId`, indices, CORS e idempotencia.
3. Registrar la entidad en `SYNC_ENTITIES`.
4. Usar `queueEntityOperation` en el Context/Service.
5. Escuchar `syncEvents` para refrescar estado.
6. Validar crear/editar/borrar offline, reconectar, abrir otro dispositivo y confirmar pull.

## Conflictos

La estrategia actual es pragmatica:

- operaciones locales pendientes tienen prioridad temporal;
- pull remoto se reconcilia con pendientes;
- deletes pendientes no deben resucitar;
- se evita perder trabajo offline;
- conflictos complejos quedan para versionado/merge futuro.

## Validacion Recomendada

```bash
npm run test:sync
npm run test:classroom
npm run backend:check
npm run typecheck
npm run lint -- --quiet
```

Validacion manual minima:

- Crear dato offline.
- Editarlo offline.
- Borrarlo offline.
- Reconectar.
- Confirmar que sube.
- Abrir web/otro dispositivo y confirmar que baja.
- Apagar backend y confirmar que no se pierde local.

## Version

- Ultima actualizacion: 2026-06-17.
