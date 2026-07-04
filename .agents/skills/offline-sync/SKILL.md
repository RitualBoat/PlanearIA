---
name: offline-sync
description: Work on PlanearIA offline-first data, src/sync, sync queue, conflict handling, userId isolation, AsyncStorage/SQLite-compatible repositories, or backend sync endpoints.
---

# Offline Sync For PlanearIA

## Read First

- `CLAUDE.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`
- `src/sync/README.md`

## Ground Rules

- PlanearIA is offline-first. Local work must continue without network.
- `src/sync` is the global sync engine. Do not create parallel queues or HTTP clients for syncable academic data.
- AsyncStorage is the current productive local store and rollback path.
- Expo SQLite is installed as opt-in infrastructure. Do not activate it as default without explicit approval.
- New academic data should use ports/repositories compatible with a future SQLite default.
- Never delete `@planearia:*` keys without migration, validation and rollback.
- Every entity and query must be scoped by authenticated `userId`.

## Expected Flow

1. Save locally first.
2. Enqueue a sync operation.
3. Show calm sync/offline state in UI.
4. Flush when network/backend is available.
5. Reconcile remote state without overwriting another user's data.

## Checklist

- Entity type and sync tag defined.
- Repository/port exists.
- Writes enqueue sync ops.
- Backend route filters by `userId`.
- Conflict/error path is handled.
- Tests cover offline queueing, reconnect flush, unauthorized/error and user isolation.
