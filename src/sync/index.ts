/**
 * Exportaciones del modulo de sincronizacion
 * Usa API Vercel + MongoDB Atlas
 */

// Configuracion
export {
  API_CONFIG,
  SYNC_CONFIG,
  STORAGE_KEYS,
  CONNECTIVITY_CONFIG,
  isAPIConfigured,
  logConfigStatus,
} from "./config/apiConfig";

// Motor de sincronizacion unificado (generico)
export {
  enqueueOperation,
  getPendingOps,
  getFailedOps,
  clearFailedOps,
  flushQueue,
  resolveConflict,
  mergeWithLocal,
  type GenericPendingOp,
  type EngineOperation,
  type EngineStatus,
  type EngineResult,
} from "./services/syncEngine";

// Provider
export { SyncProvider, useSyncPlaneaciones, usePlaneaciones } from "./providers/SyncProvider";
