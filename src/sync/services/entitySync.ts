/**
 * Registry-driven sync for list entities (grupos, alumnos, recursos, ...).
 *
 * Push: mutations enqueue into the generic syncEngine queue and attempt an
 * immediate flush so changes reach MongoDB right away when online.
 * Pull: the orchestrator downloads the authoritative list per entity,
 * keeps local items that still have queued operations (offline work wins
 * until it is uploaded), persists the result to AsyncStorage and emits an
 * entity-updated event so every context/screen reloads.
 *
 * A failed pull NEVER touches local data: with Vercel or MongoDB down the
 * app keeps working from storage and retries on the next cycle.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAPIConfigured } from "../config/apiConfig";
import { apiRequest } from "../../utils/apiClient";
import { getAccessToken } from "../../services/auth";
import {
  enqueueOperation,
  flushQueue,
  getPendingOps,
  type EngineOperation,
  type GenericPendingOp,
} from "./syncEngine";
import { emitSyncEvent } from "./syncEvents";
import { isNetworkRequestError } from "../../utils/networkErrors";
import logger from "../../utils/logger";

export interface SyncEntityConfig {
  /** Queue name, event name and registry key */
  entity: string;
  /** Backend endpoint, e.g. "/api/recursos" */
  endpoint: string;
  /** AsyncStorage key holding the local list */
  storageKey: string;
  /** Key of the array inside the backend list response (data.<key>) */
  responseKey: string;
}

export const SYNC_ENTITIES: Record<string, SyncEntityConfig> = {
  grupos: {
    entity: "grupos",
    endpoint: "/api/grupos",
    storageKey: "@planearia:grupos",
    responseKey: "grupos",
  },
  unidades: {
    entity: "unidades",
    endpoint: "/api/unidades",
    storageKey: "@planearia:unidades_classroom",
    responseKey: "unidades",
  },
  alumnos: {
    entity: "alumnos",
    endpoint: "/api/alumnos",
    storageKey: "@planearia:alumnos",
    responseKey: "alumnos",
  },
  asistencias: {
    entity: "asistencias",
    endpoint: "/api/asistencias",
    storageKey: "@planearia:asistencias",
    responseKey: "asistencias",
  },
  calificaciones: {
    entity: "calificaciones",
    endpoint: "/api/calificaciones",
    storageKey: "@planearia:calificaciones",
    responseKey: "calificaciones",
  },
  entregables: {
    entity: "entregables",
    endpoint: "/api/entregables",
    storageKey: "@planearia:entregables",
    responseKey: "entregables",
  },
  recursos: {
    entity: "recursos",
    endpoint: "/api/recursos",
    storageKey: "@planearia:recursos",
    responseKey: "recursos",
  },
  plantillas: {
    entity: "plantillas",
    endpoint: "/api/plantillas",
    storageKey: "@planearia:plantillas",
    responseKey: "plantillas",
  },
};

/** Local-only dev session token; the backend cannot scope it to a user. */
export const DEV_LOCAL_TOKEN = "dev-token-local-testing-only";

/**
 * Sync requires a configured API and a real backend session. Guest and
 * local dev sessions work fully offline (no remote calls, no queue flush).
 */
export const canSyncRemotely = async (): Promise<boolean> => {
  if (!isAPIConfigured()) return false;
  const token = await getAccessToken();
  return Boolean(token) && token !== DEV_LOCAL_TOKEN;
};

/**
 * Enqueues a mutation and tries to upload it immediately.
 * Returns true when the queue for the entity is fully drained (synced).
 */
export const queueEntityOperation = async <T extends { id?: unknown }>(
  config: SyncEntityConfig,
  type: EngineOperation,
  payload: T
): Promise<boolean> => {
  await enqueueOperation(config.entity, config.endpoint, type, payload);

  if (!(await canSyncRemotely())) return false;

  try {
    await flushQueue(config.entity);
  } catch (error) {
    logger.error(`[entitySync] Flush failed for ${config.entity}:`, error);
  }

  const remaining = await getPendingOps(config.entity);
  return remaining.length === 0;
};

const readLocalList = async <T>(storageKey: string): Promise<T[]> => {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const stripMongoId = <T extends Record<string, unknown>>(item: T): T => {
  if (!item || typeof item !== "object") return item;
  const { _id, ...rest } = item as Record<string, unknown>;
  return rest as T;
};

/**
 * The remote list is authoritative except for items with queued local work:
 * pending creates/updates keep the local version (it is newer and will be
 * uploaded), and pending deletes stay deleted locally even if the server
 * still has the document. This propagates cross-device deletes without
 * resurrecting them and never loses offline work.
 */
export const reconcileWithPending = <T extends { id?: unknown }>(
  local: T[],
  remote: T[],
  pending: GenericPendingOp[]
): T[] => {
  const pendingDeleteIds = new Set<unknown>();
  const pendingUpsertIds = new Set<unknown>();

  for (const op of pending) {
    const id = (op.payload as { id?: unknown } | null)?.id;
    if (id === undefined) continue;
    if (op.type === "delete") pendingDeleteIds.add(id);
    else pendingUpsertIds.add(id);
  }

  const map = new Map<unknown, T>();
  for (const item of remote) {
    if (item?.id === undefined || pendingDeleteIds.has(item.id)) continue;
    map.set(item.id, item);
  }
  for (const item of local) {
    if (item?.id !== undefined && pendingUpsertIds.has(item.id)) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
};

export interface EntitySyncOutcome {
  entity: string;
  ok: boolean;
  changed: boolean;
  pushed: number;
  /** Items received from the backend in the pull phase */
  pulled: number;
  /**
   * True only when the backend was genuinely unreachable for this entity:
   * a network failure or a 5xx. A 4xx (e.g. a route not deployed yet -> 404,
   * or 401/403) is an entity-level issue, NOT "server down", so it must not
   * trigger the global offline banner.
   */
  unreachable: boolean;
}

export const syncEntity = async (
  config: SyncEntityConfig
): Promise<EntitySyncOutcome> => {
  const outcome: EntitySyncOutcome = {
    entity: config.entity,
    ok: true,
    changed: false,
    pushed: 0,
    pulled: 0,
    unreachable: false,
  };

  // 1. Push queued local mutations
  const flush = await flushQueue(config.entity);
  outcome.pushed = flush.processed;
  if (!flush.success || flush.skipped > 0) {
    outcome.ok = false;
  }

  // 2. Pull the authoritative list and reconcile with pending local work
  try {
    const response = await apiRequest(`${config.endpoint}?limit=500`, {
      method: "GET",
    });
    if (!response.ok) {
      // 5xx = server can't serve it (down/broken); 4xx = entity/route issue
      if (response.status >= 500) {
        outcome.unreachable = true;
      }
      outcome.ok = false;
      logger.log(`[entitySync] GET ${config.endpoint} -> HTTP ${response.status}`);
      return outcome;
    }

    const payload = (await response.json()) as {
      data?: Record<string, unknown>;
    };
    const remoteRaw = payload?.data?.[config.responseKey];
    const remote = Array.isArray(remoteRaw)
      ? (remoteRaw as Record<string, unknown>[]).map(stripMongoId)
      : [];
    outcome.pulled = remote.length;

    const [local, pending] = await Promise.all([
      readLocalList<Record<string, unknown>>(config.storageKey),
      getPendingOps(config.entity),
    ]);

    const next = reconcileWithPending(
      local as Array<{ id?: unknown }>,
      remote as Array<{ id?: unknown }>,
      pending
    );
    const serialized = JSON.stringify(next);

    if (serialized !== JSON.stringify(local)) {
      await AsyncStorage.setItem(config.storageKey, serialized);
      outcome.changed = true;
      emitSyncEvent({ type: "entity-updated", entity: config.entity });
    }
  } catch (error) {
    // Never touch local data on a failed pull. A fetch exception means the
    // backend was not reachable (offline, DNS, Vercel/Mongo down).
    outcome.ok = false;
    outcome.unreachable = true;
    if (!isNetworkRequestError(error)) {
      logger.error(`[entitySync] Pull failed for ${config.entity}:`, error);
    }
  }

  return outcome;
};

/**
 * Custom sync tasks for entities with their own pipeline (planeaciones,
 * notificaciones). Registered from their contexts on mount.
 */
export type SyncTask = () => Promise<EntitySyncOutcome>;

const customTasks = new Map<string, SyncTask>();

export const registerSyncTask = (name: string, task: SyncTask): (() => void) => {
  customTasks.set(name, task);
  return () => {
    customTasks.delete(name);
  };
};

export interface SyncSummary {
  ok: boolean;
  skipped: boolean;
  pushed: number;
  changedEntities: string[];
  failedEntities: string[];
  /** True when at least one entity could not reach the backend (network/5xx) */
  unreachable: boolean;
  ranAt: string;
}

let syncInFlight: Promise<SyncSummary> | null = null;

/**
 * Runs a full push+pull cycle for every registered entity. Concurrent
 * callers share the same in-flight run.
 */
export const syncAllEntities = async (): Promise<SyncSummary> => {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    const summary: SyncSummary = {
      ok: true,
      skipped: false,
      pushed: 0,
      changedEntities: [],
      failedEntities: [],
      unreachable: false,
      ranAt: new Date().toISOString(),
    };

    if (!(await canSyncRemotely())) {
      summary.skipped = true;
      return summary;
    }

    const registryOutcomes = await Promise.all(
      Object.values(SYNC_ENTITIES).map((config) =>
        syncEntity(config).catch(
          (): EntitySyncOutcome => ({
            entity: config.entity,
            ok: false,
            changed: false,
            pushed: 0,
            pulled: 0,
            unreachable: true,
          })
        )
      )
    );

    const customOutcomes = await Promise.all(
      Array.from(customTasks.entries()).map(([name, task]) =>
        task().catch(
          (): EntitySyncOutcome => ({
            entity: name,
            ok: false,
            changed: false,
            pushed: 0,
            pulled: 0,
            unreachable: true,
          })
        )
      )
    );

    for (const outcome of [...registryOutcomes, ...customOutcomes]) {
      summary.pushed += outcome.pushed;
      if (outcome.changed) summary.changedEntities.push(outcome.entity);
      if (outcome.unreachable) summary.unreachable = true;
      if (!outcome.ok) {
        summary.ok = false;
        summary.failedEntities.push(outcome.entity);
      }
    }

    return summary;
  })();

  try {
    return await syncInFlight;
  } finally {
    syncInFlight = null;
  }
};

/** Total queued operations across all entities (for the pending badge). */
export const getTotalPendingCount = async (): Promise<number> => {
  const entities = [...Object.keys(SYNC_ENTITIES), "planeaciones"];
  const counts = await Promise.all(
    entities.map(async (entity) => (await getPendingOps(entity)).length)
  );
  return counts.reduce((sum, count) => sum + count, 0);
};
