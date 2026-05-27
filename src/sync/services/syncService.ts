/**
 * Servicio de sincronización con API Vercel + MongoDB Atlas
 * Offline-first con AsyncStorage
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  SYNC_CONFIG,
  STORAGE_KEYS,
  isAPIConfigured,
} from "../config/apiConfig";
import { apiRequest } from "../../utils/apiClient";
import { Planeacion } from "../../../types/planeacion";
import logger from "../../utils/logger";

// =====================================
// TIPOS
// =====================================

export interface PendingOperation {
  id: string;
  type: "create" | "update" | "delete";
  data: Planeacion | null;
  timestamp: string;
  retries: number;
}

export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  errors: string[];
}

// =====================================
// UTILIDADES
// =====================================

const generateId = (): string =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = `device_${generateId()}`;
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
};

export const checkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return false;
  }
};

export const saveLocalPlaneaciones = async (
  planeaciones: Planeacion[]
): Promise<void> => {
  await AsyncStorage.setItem(
    STORAGE_KEYS.PLANEACIONES,
    JSON.stringify(planeaciones)
  );
  if (SYNC_CONFIG.debugMode) {
    logger.log(`[sync] Saved ${planeaciones.length} planeaciones locally`);
  }
};

export const loadLocalPlaneaciones = async (): Promise<Planeacion[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLANEACIONES);
    if (data) {
      const planeaciones = JSON.parse(data) as Planeacion[];
      if (SYNC_CONFIG.debugMode) {
        logger.log(`[sync] Loaded ${planeaciones.length} local planeaciones`);
      }
      return planeaciones;
    }
    return [];
  } catch (error) {
    logger.error("[sync] Error loading planeaciones:", error);
    return [];
  }
};

// =====================================
// OPERACIONES PENDIENTES
// =====================================

export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_OPERATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addPendingOperation = async (
  operation: Omit<PendingOperation, "id" | "timestamp" | "retries">
): Promise<void> => {
  const pending = await getPendingOperations();

  const newOp: PendingOperation = {
    ...operation,
    id: `op_${generateId()}`,
    timestamp: new Date().toISOString(),
    retries: 0,
  };

  // Eliminar operaciones duplicadas del mismo documento
  const filtered = pending.filter((op) => {
    if (operation.type === "delete" && op.data?.id === operation.data?.id) {
      return false;
    }
    if (
      operation.type === "update" &&
      op.type === "update" &&
      op.data?.id === operation.data?.id
    ) {
      return false;
    }
    return true;
  });

  filtered.push(newOp);
  await AsyncStorage.setItem(
    STORAGE_KEYS.PENDING_OPERATIONS,
    JSON.stringify(filtered)
  );

  if (SYNC_CONFIG.debugMode) {
    logger.log(`[sync] Pending operation: ${operation.type}`);
  }
};

export const clearPendingOperations = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_OPERATIONS);
};

// =====================================
// SINCRONIZACION
// =====================================

/**
 * Sincronización completa con el servidor
 */
export const fullSync = async (): Promise<SyncResult> => {
  const result: SyncResult = {
    success: true,
    uploaded: 0,
    downloaded: 0,
    errors: [],
  };

  // Verificar si la API está configurada
  if (!isAPIConfigured()) {
    if (SYNC_CONFIG.debugMode) {
      logger.log("[sync] API not configured, local-only mode");
    }
    return result;
  }

  // Verificar conectividad
  const isOnline = await checkConnectivity();
  if (!isOnline) {
    logger.log("[sync] Offline, sync postponed");
    return { ...result, success: false };
  }

  try {
    const deviceId = await getDeviceId();
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const pending = await getPendingOperations();

    logger.log(
      `[sync] Syncing... (${pending.length} pending operations)`
    );

    // Hacer request de sync
    const response = await apiRequest("/api/sync", {
      method: "POST",
      body: JSON.stringify({
        deviceId,
        lastSync,
        operations: pending,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }

    const data = await response.json();

    if (data.success) {
      result.uploaded = data.data.uploaded || 0;
      result.downloaded = data.data.downloaded?.length || 0;
      result.errors = data.data.errors || [];

      // Limpiar operaciones pendientes si se subieron
      if (result.uploaded > 0) {
        await clearPendingOperations();
      }

      // Fusionar cambios descargados con datos locales
      if (data.data.downloaded && data.data.downloaded.length > 0) {
        await mergeServerChanges(data.data.downloaded);
      }

      // Actualizar timestamp de última sincronización
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        data.data.serverTime || new Date().toISOString()
      );

      logger.log(
        `[sync] Done: ${result.uploaded} uploaded, ${result.downloaded} downloaded`
      );
    } else {
      throw new Error(data.error || "Error desconocido");
    }

    return result;
  } catch (error) {
    logger.error("[sync] Sync error:", error);
    result.success = false;
    result.errors.push(String(error));
    return result;
  }
};

/**
 * Fusiona cambios del servidor con datos locales
 */
const mergeServerChanges = async (serverData: Planeacion[]): Promise<void> => {
  const localPlaneaciones = await loadLocalPlaneaciones();
  const localMap = new Map(localPlaneaciones.map((p) => [p.id, p]));

  for (const remote of serverData) {
    const local = localMap.get(remote.id);

    if (!local) {
      // Nueva planeación del servidor
      localMap.set(remote.id, remote);
    } else if (
      new Date(remote.fechaModificacion) > new Date(local.fechaModificacion)
    ) {
      // Servidor tiene versión más reciente
      localMap.set(remote.id, remote);
    }
  }

  await saveLocalPlaneaciones(Array.from(localMap.values()));
};

/**
 * Obtiene el timestamp de última sincronización
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

/**
 * Verifica la salud de la API
 */
export const checkAPIHealth = async (): Promise<boolean> => {
  if (!isAPIConfigured()) return false;

  try {
    const response = await apiRequest("/api/health");
    const data = await response.json();
    return data.success && data.data?.status === "ok";
  } catch {
    return false;
  }
};
