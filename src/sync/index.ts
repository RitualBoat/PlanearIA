/**
 * Exportaciones del módulo de sincronización
 * Usa API Vercel + MongoDB Atlas
 */

// Configuración
export {
  API_CONFIG,
  SYNC_CONFIG,
  STORAGE_KEYS,
  CONNECTIVITY_CONFIG,
  isAPIConfigured,
  logConfigStatus,
} from "./config/apiConfig";

// Servicios
export {
  saveLocalPlaneaciones,
  loadLocalPlaneaciones,
  getPendingOperations,
  addPendingOperation,
  clearPendingOperations,
  fullSync,
  getLastSyncTime,
  getDeviceId,
  checkConnectivity,
  checkAPIHealth,
  type PendingOperation,
  type SyncStatus,
  type SyncResult,
} from "./services/syncService";

// Hooks
export { useSync, type UseSyncResult } from "./hooks/useSync";

// Provider
export {
  SyncProvider,
  useSyncPlaneaciones,
  usePlaneaciones,
} from "./providers/SyncProvider";
