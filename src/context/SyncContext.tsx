/**
 * Global sync orchestrator (ViewModel for the sync/offline UX).
 *
 * Triggers a full push+pull cycle on: app start, login, reconnection,
 * foreground, a short polling interval while active, and manual request.
 * Exposes connection/sync state plus transient notices for the global
 * banner. Survives backend/MongoDB outages: failed cycles keep local data
 * intact and simply retry later.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { useAuth } from "./AuthContext";
import { SYNC_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";
import { subscribeConnectivity } from "../sync/services/connectivity";
import {
  DEV_LOCAL_TOKEN,
  getTotalPendingCount,
  syncAllEntities,
} from "../sync/services/entitySync";
import { emitSyncEvent, type SyncReason } from "../sync/services/syncEvents";
import logger from "../utils/logger";

export type GlobalSyncStatus = "idle" | "offline" | "syncing" | "synced" | "error";

export interface SyncNotice {
  kind: "success" | "info" | "warning";
  message: string;
  at: number;
}

interface SyncContextData {
  /** Device-level connectivity (airplane mode, wifi off) */
  isOnline: boolean;
  /** Result of the last sync cycle */
  status: GlobalSyncStatus;
  lastSyncAt: string | null;
  /** Queued operations waiting for upload across all entities */
  pendingCount: number;
  /** False for guest/dev-local sessions or unconfigured API */
  syncEnabled: boolean;
  /** Transient toast payload (auto-dismissed) */
  notice: SyncNotice | null;
  dismissNotice: () => void;
  syncNow: (reason?: SyncReason) => Promise<void>;
}

const SyncContext = createContext<SyncContextData | undefined>(undefined);

const NOTICE_DISMISS_MS = 3500;

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isGuest, isLoading: authLoading } = useAuth();

  const [isOnline, setIsOnline] = useState(true);
  const [status, setStatus] = useState<GlobalSyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [notice, setNotice] = useState<SyncNotice | null>(null);

  const syncEnabled = useMemo(
    () => isAPIConfigured() && !isGuest && Boolean(token) && token !== DEV_LOCAL_TOKEN,
    [isGuest, token]
  );

  const isOnlineRef = useRef(isOnline);
  const syncEnabledRef = useRef(syncEnabled);
  const statusRef = useRef(status);
  const runningRef = useRef(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  isOnlineRef.current = isOnline;
  syncEnabledRef.current = syncEnabled;
  statusRef.current = status;

  const dismissNotice = useCallback(() => setNotice(null), []);

  const showNotice = useCallback((kind: SyncNotice["kind"], message: string) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNotice({ kind, message, at: Date.now() });
    noticeTimerRef.current = setTimeout(() => setNotice(null), NOTICE_DISMISS_MS);
  }, []);

  const refreshPendingCount = useCallback(async () => {
    try {
      setPendingCount(await getTotalPendingCount());
    } catch {
      // non-fatal
    }
  }, []);

  const syncNow = useCallback(
    async (reason: SyncReason = "manual") => {
      if (!syncEnabledRef.current) return;
      if (runningRef.current) return;
      if (!isOnlineRef.current && reason !== "manual") {
        setStatus("offline");
        return;
      }

      runningRef.current = true;
      setStatus("syncing");
      emitSyncEvent({ type: "sync-started", reason });

      try {
        const summary = await syncAllEntities();
        await refreshPendingCount();

        if (summary.skipped) {
          setStatus("idle");
          return;
        }

        emitSyncEvent({
          type: "sync-finished",
          reason,
          ok: summary.ok,
          changedEntities: summary.changedEntities,
          pushed: summary.pushed,
        });

        if (summary.ok) {
          setStatus("synced");
          setLastSyncAt(summary.ranAt);

          const alwaysNotify =
            reason === "login" || reason === "startup" || reason === "reconnect" || reason === "manual";
          const hasNews = summary.changedEntities.length > 0 || summary.pushed > 0;

          if (reason === "reconnect") {
            showNotice("success", "Conexión restablecida. Sincronización exitosa.");
          } else if (alwaysNotify || hasNews) {
            showNotice("success", "Sincronización exitosa.");
          }
        } else {
          // Device online but backend/MongoDB unreachable or partial failure
          const wasError = statusRef.current === "error";
          setStatus("error");
          if (!wasError && reason !== "interval" && reason !== "foreground") {
            showNotice(
              "warning",
              "No se pudo sincronizar con el servidor. Tus cambios están guardados en este dispositivo."
            );
          }
          logger.log("[sync] Cycle finished with errors:", summary.failedEntities.join(", "));
        }
      } catch (error) {
        setStatus("error");
        logger.error("[sync] Cycle crashed:", error);
      } finally {
        runningRef.current = false;
      }
    },
    [refreshPendingCount, showNotice]
  );

  // Connectivity transitions: offline banner + reconnect-and-sync
  useEffect(() => {
    let isFirstEvent = true;
    const unsubscribe = subscribeConnectivity((online) => {
      setIsOnline(online);

      if (isFirstEvent) {
        // Initial state, not a transition: no toast
        isFirstEvent = false;
        if (!online) setStatus("offline");
        return;
      }

      if (online) {
        showNotice("info", "Conexión restablecida. Sincronizando...");
        void syncNow("reconnect");
      } else {
        setStatus("offline");
      }
    });
    return unsubscribe;
  }, [showNotice, syncNow]);

  // Startup sync (covers page reload on web)
  const startupDoneRef = useRef(false);
  useEffect(() => {
    if (authLoading || startupDoneRef.current) return;
    startupDoneRef.current = true;
    void refreshPendingCount();
    if (syncEnabled) void syncNow("startup");
  }, [authLoading, refreshPendingCount, syncEnabled, syncNow]);

  // Login/logout transitions
  const prevTokenRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevTokenRef.current;
    prevTokenRef.current = token;
    if (authLoading) return;

    if (!prev && token && syncEnabled && startupDoneRef.current) {
      void syncNow("login");
    }
    if (prev && !token) {
      setStatus("idle");
      setLastSyncAt(null);
    }
  }, [authLoading, syncEnabled, syncNow, token]);

  // Polling while the app is active: cross-device changes appear quickly
  useEffect(() => {
    if (!syncEnabled) return undefined;
    const interval = setInterval(() => {
      if (AppState.currentState === "active" && isOnlineRef.current) {
        void syncNow("interval");
      }
    }, SYNC_CONFIG.pollInterval);
    return () => clearInterval(interval);
  }, [syncEnabled, syncNow]);

  // Sync when the app returns to the foreground
  useEffect(() => {
    if (!syncEnabled) return undefined;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void syncNow("foreground");
    });
    return () => subscription.remove();
  }, [syncEnabled, syncNow]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const value = useMemo<SyncContextData>(
    () => ({
      isOnline,
      status,
      lastSyncAt,
      pendingCount,
      syncEnabled,
      notice,
      dismissNotice,
      syncNow,
    }),
    [isOnline, status, lastSyncAt, pendingCount, syncEnabled, notice, dismissNotice, syncNow]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSyncStatus = (): SyncContextData => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncStatus debe usarse dentro de SyncProvider");
  }
  return context;
};
