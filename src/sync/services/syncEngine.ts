/**
 * Motor de Sincronización Unificado — PlanearIA
 *
 * Patrón genérico offline-first con:
 *  - Cola FIFO de operaciones pendientes por entidad
 *  - Reintentos automáticos con back-off (máx 5 intentos)
 *  - Estrategia Last-Write-Wins basada en fechaModificacion
 *  - Notificación de error en campana cuando supera MAX_RETRIES
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { SYNC_CONFIG } from "../config/apiConfig";
import { apiRequest } from "../../utils/apiClient";
import logger from "../../utils/logger";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type EngineOperation = "create" | "update" | "delete";
export type EngineStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export interface GenericPendingOp<T = unknown> {
  /** Identificador único de la operación */
  opId: string;
  /** Nombre de la entidad (e.g. "planeaciones", "mensajes") */
  entity: string;
  /** Tipo de operación CRUD */
  type: EngineOperation;
  /** Endpoint relativo del backend (e.g. "/api/mensajes") */
  endpoint: string;
  /** Payload a enviar */
  payload: T | null;
  /** Timestamp ISO de creación de la operación */
  createdAt: string;
  /** Número de intentos realizados */
  retries: number;
  /** Si excedió MAX_RETRIES — marcada como fallida para notificar al usuario */
  failed: boolean;
}

export interface EngineResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const MAX_RETRIES = 5;
const STORAGE_PREFIX = "@planearia:pending_ops_v2_";
const FAILED_OPS_KEY = "@planearia:failed_ops_v2";

// ─── Utilidades internas ─────────────────────────────────────────────────────

const generateOpId = (): string =>
  `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const getStorageKey = (entity: string): string =>
  `${STORAGE_PREFIX}${entity}`;

// ─── API pública del motor ────────────────────────────────────────────────────

/**
 * Encola una operación pendiente para una entidad dada.
 * Si ya existe una operación "update" del mismo recurso (mismo payload.id),
 * la sobreescribe para evitar duplicados redundantes.
 */
export const enqueueOperation = async <T extends { id?: unknown }>(
  entity: string,
  endpoint: string,
  type: EngineOperation,
  payload: T | null
): Promise<void> => {
  const key = getStorageKey(entity);
  const raw = await AsyncStorage.getItem(key);
  const queue: GenericPendingOp<T>[] = raw ? JSON.parse(raw) : [];

  // Deduplicar: eliminar update del mismo id si ya existe en cola
  const filtered = queue.filter((op) => {
    const sameId =
      payload?.id !== undefined && op.payload !== null
        ? (op.payload as T).id === payload.id
        : false;
    if (type === "delete" && sameId) return false;
    if (type === "update" && op.type === "update" && sameId) return false;
    return true;
  });

  const newOp: GenericPendingOp<T> = {
    opId: generateOpId(),
    entity,
    type,
    endpoint,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
    failed: false,
  };

  filtered.push(newOp);
  await AsyncStorage.setItem(key, JSON.stringify(filtered));

  if (SYNC_CONFIG.debugMode) {
    logger.log(`[syncEngine] Enqueued ${type} for ${entity} (${newOp.opId})`);
  }
};

/**
 * Obtiene las operaciones pendientes de una entidad.
 */
export const getPendingOps = async <T = unknown>(
  entity: string
): Promise<GenericPendingOp<T>[]> => {
  try {
    const key = getStorageKey(entity);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Obtiene todas las operaciones que superaron MAX_RETRIES.
 */
export const getFailedOps = async (): Promise<GenericPendingOp[]> => {
  try {
    const raw = await AsyncStorage.getItem(FAILED_OPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Limpia las operaciones fallidas (después de que el usuario las confirmó).
 */
export const clearFailedOps = async (): Promise<void> => {
  await AsyncStorage.removeItem(FAILED_OPS_KEY);
};

/**
 * Procesa y drena la cola de operaciones pendientes para una entidad.
 * Respeta MAX_RETRIES: tras 5 fallos, mueve la operación a la cola de fallidas.
 *
 * @param entity  Nombre de la entidad (para obtener la cola)
 * @param methodMap  Mapa de método HTTP por tipo de operación (override opcional)
 */
export const flushQueue = async (
  entity: string,
  methodMap: Partial<Record<EngineOperation, string>> = {}
): Promise<EngineResult> => {
  const result: EngineResult = {
    success: true,
    processed: 0,
    skipped: 0,
    errors: [],
  };

  // Verificar conectividad antes de intentar
  const netState = await NetInfo.fetch();
  const isOnline =
    netState.isConnected === true && netState.isInternetReachable !== false;

  if (!isOnline) {
    if (SYNC_CONFIG.debugMode) {
      logger.log(`[syncEngine] Offline — flush de ${entity} postponido`);
    }
    return { ...result, success: false };
  }

  const key = getStorageKey(entity);
  const queue: GenericPendingOp[] = await getPendingOps(entity);

  if (queue.length === 0) return result;

  logger.log(`[syncEngine] Flushing ${queue.length} ops para ${entity}`);

  const remaining: GenericPendingOp[] = [];
  const newFailed: GenericPendingOp[] = [];

  for (const op of queue) {
    const httpMethod =
      methodMap[op.type] ??
      (op.type === "create"
        ? "POST"
        : op.type === "update"
          ? "PUT"
          : "DELETE");

    const endpointWithId =
      op.type === "delete" && op.payload !== null
        ? `${op.endpoint}?id=${(op.payload as { id: unknown }).id}`
        : op.endpoint;

    try {
      const response = await apiRequest(
        endpointWithId,
        {
          method: httpMethod,
          body: op.type !== "delete" && op.payload !== null ? JSON.stringify(op.payload) : undefined
        }
      );

      if (response.ok) {
        result.processed++;
        if (SYNC_CONFIG.debugMode) {
          logger.log(`[syncEngine] ✓ ${op.type} ${entity} ${op.opId}`);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      const nextRetries = op.retries + 1;

      if (nextRetries >= MAX_RETRIES) {
        // Marcar como fallida y mover a cola de errores
        logger.error(
          `[syncEngine] ✗ ${op.type} ${entity} superó MAX_RETRIES (${MAX_RETRIES})`,
          err
        );
        newFailed.push({ ...op, retries: nextRetries, failed: true });
        result.errors.push(
          `${entity}/${op.type} falló después de ${MAX_RETRIES} intentos`
        );
      } else {
        // Re-encolar para el siguiente intento
        remaining.push({ ...op, retries: nextRetries });
        result.skipped++;
        if (SYNC_CONFIG.debugMode) {
          logger.log(
            `[syncEngine] Reintento ${nextRetries}/${MAX_RETRIES} para ${op.opId}`
          );
        }
      }
    }
  }

  // Persistir operaciones que aún no completaron
  await AsyncStorage.setItem(key, JSON.stringify(remaining));

  // Persistir operaciones fallidas para notificar al usuario
  if (newFailed.length > 0) {
    const existingFailed = await getFailedOps();
    await AsyncStorage.setItem(
      FAILED_OPS_KEY,
      JSON.stringify([...existingFailed, ...newFailed])
    );
    result.success = false;
  }

  return result;
};

/**
 * Resolución de conflictos Last-Write-Wins.
 * Compara dos versiones de un documento por su campo fechaModificacion.
 * Retorna el que tenga la marca de tiempo más reciente.
 */
export const resolveConflict = <T extends { fechaModificacion?: string }>(
  local: T,
  remote: T
): T => {
  const localDate = local.fechaModificacion
    ? new Date(local.fechaModificacion).getTime()
    : 0;
  const remoteDate = remote.fechaModificacion
    ? new Date(remote.fechaModificacion).getTime()
    : 0;

  return remoteDate > localDate ? remote : local;
};

/**
 * Fusiona una lista remota con datos locales usando Last-Write-Wins.
 * Los elementos locales sin contraparte remota se conservan.
 */
export const mergeWithLocal = <T extends { id: unknown; fechaModificacion?: string }>(
  local: T[],
  remote: T[]
): T[] => {
  const map = new Map<unknown, T>(local.map((item) => [item.id, item]));

  for (const remoteItem of remote) {
    const localItem = map.get(remoteItem.id);
    if (!localItem) {
      map.set(remoteItem.id, remoteItem);
    } else {
      map.set(remoteItem.id, resolveConflict(localItem, remoteItem));
    }
  }

  return Array.from(map.values());
};
