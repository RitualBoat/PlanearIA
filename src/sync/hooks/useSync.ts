/**
 * Hook de sincronización con API Vercel
 */
import { useState, useEffect, useCallback, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  fullSync,
  getPendingOperations,
  getLastSyncTime,
  checkConnectivity,
  checkAPIHealth,
  SyncStatus,
  SyncResult,
} from "../services/syncService";
import { SYNC_CONFIG, isAPIConfigured } from "../config/apiConfig";

export interface UseSyncResult {
  syncStatus: SyncStatus;
  isOnline: boolean;
  justReconnected: boolean;
  pendingCount: number;
  lastSync: string | null;
  forceSync: () => Promise<SyncResult>;
  isSyncConfigured: boolean;
  isAPIHealthy: boolean;
}

export const useSync = (): UseSyncResult => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isAPIHealthy, setIsAPIHealthy] = useState(false);

  const wasOffline = useRef(false);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSyncConfigured = isAPIConfigured();

  // Actualizar contador de pendientes
  const updatePendingCount = useCallback(async () => {
    const pending = await getPendingOperations();
    setPendingCount(pending.length);
  }, []);

  // Actualizar última sincronización
  const updateLastSync = useCallback(async () => {
    const time = await getLastSyncTime();
    setLastSync(time);
  }, []);

  // Realizar sincronización
  const performSync = useCallback(async (): Promise<SyncResult> => {
    if (!isSyncConfigured) {
      return { success: true, uploaded: 0, downloaded: 0, errors: [] };
    }

    const online = await checkConnectivity();
    if (!online) {
      setSyncStatus("offline");
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        errors: ["Sin conexión"],
      };
    }

    try {
      setSyncStatus("syncing");
      const result = await fullSync();

      setSyncStatus(result.success ? "synced" : "error");
      await updatePendingCount();
      await updateLastSync();

      return result;
    } catch (error) {
      console.error("❌ Error en sync:", error);
      setSyncStatus("error");
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        errors: [String(error)],
      };
    }
  }, [isSyncConfigured, updatePendingCount, updateLastSync]);

  // Forzar sincronización
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    console.log("🔄 Sincronización manual iniciada");
    return performSync();
  }, [performSync]);

  // Manejar cambios de conectividad
  const handleConnectivityChange = useCallback(
    async (isConnected: boolean) => {
      setIsOnline(isConnected);

      if (!isConnected) {
        wasOffline.current = true;
        setSyncStatus("offline");
        setJustReconnected(false);
      } else if (wasOffline.current) {
        wasOffline.current = false;
        setJustReconnected(true);
        console.log("🌐 Reconectado - sincronizando...");

        await performSync();
        setTimeout(() => setJustReconnected(false), 3000);
      }
    },
    [performSync]
  );

  // Suscribirse a cambios de red
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isConnected === true);
    });

    checkConnectivity().then((connected) => {
      setIsOnline(connected);
      if (!connected) setSyncStatus("offline");
    });

    return () => unsubscribe();
  }, [handleConnectivityChange]);

  // Verificar salud de la API al inicio
  useEffect(() => {
    if (isSyncConfigured) {
      checkAPIHealth().then(setIsAPIHealthy);
    }
  }, [isSyncConfigured]);

  // Sincronización automática periódica
  useEffect(() => {
    if (!isSyncConfigured) return;

    // Sync inicial
    performSync();
    updatePendingCount();
    updateLastSync();

    // Intervalo de sync
    syncIntervalRef.current = setInterval(() => {
      if (isOnline) {
        performSync();
      }
    }, SYNC_CONFIG.autoSyncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [
    isSyncConfigured,
    isOnline,
    performSync,
    updatePendingCount,
    updateLastSync,
  ]);

  // Actualizar pendientes periódicamente
  useEffect(() => {
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  return {
    syncStatus,
    isOnline,
    justReconnected,
    pendingCount,
    lastSync,
    forceSync,
    isSyncConfigured,
    isAPIHealthy,
  };
};
