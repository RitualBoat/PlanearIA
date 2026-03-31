import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Grupo } from "../../types";
import {
  obtenerGrupos as obtenerGruposServicio,
  agregarGrupo as agregarGrupoServicio,
  actualizarGrupo as actualizarGrupoServicio,
  eliminarGrupo as eliminarGrupoServicio,
  getPendingGruposCount,
  getGruposConnectivity,
  sincronizarGruposConBackend,
  GrupoSyncStatus,
} from "../services/gruposService";

interface GruposContextData {
  grupos: Partial<Grupo>[];
  isLoading: boolean;
  error: string | null;
  syncStatus: GrupoSyncStatus;
  pendingSyncCount: number;
  isOnline: boolean;
  reloadGrupos: () => Promise<void>;
  syncGrupos: () => Promise<void>;
  agregarGrupo: (grupo: Partial<Grupo>) => Promise<void>;
  actualizarGrupo: (id: number, actualizacion: Partial<Grupo>) => Promise<void>;
  eliminarGrupo: (id: number) => Promise<void>;
  obtenerGrupo: (id: number) => Partial<Grupo> | undefined;
}

const GruposContext = createContext<GruposContextData | undefined>(undefined);

interface GruposProviderProps {
  children: React.ReactNode;
}

export const GruposProvider: React.FC<GruposProviderProps> = ({ children }) => {
  const [grupos, setGrupos] = useState<Partial<Grupo>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<GrupoSyncStatus>("idle");
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const refreshSyncMeta = useCallback(async () => {
    const [pending, online] = await Promise.all([getPendingGruposCount(), getGruposConnectivity()]);

    setPendingSyncCount(pending);
    setIsOnline(online);
    if (!online) {
      setSyncStatus("offline");
      return;
    }

    if (pending === 0) {
      setSyncStatus("synced");
    }
  }, []);

  const syncGrupos = useCallback(async () => {
    setSyncStatus("syncing");
    const result = await sincronizarGruposConBackend();
    setSyncStatus(result.status);
    await refreshSyncMeta();
    const data = await obtenerGruposServicio();
    setGrupos(data);
  }, [refreshSyncMeta]);

  const loadGrupos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await obtenerGruposServicio();
      setGrupos(data);
      await refreshSyncMeta();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "No se pudieron cargar los grupos";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  useEffect(() => {
    void syncGrupos();
  }, [syncGrupos]);

  const agregarGrupo = useCallback(
    async (grupo: Partial<Grupo>) => {
      await agregarGrupoServicio(grupo);
      await loadGrupos();
      await refreshSyncMeta();
    },
    [loadGrupos, refreshSyncMeta]
  );

  const actualizarGrupo = useCallback(
    async (id: number, actualizacion: Partial<Grupo>) => {
      await actualizarGrupoServicio(id, actualizacion);
      await loadGrupos();
      await refreshSyncMeta();
    },
    [loadGrupos, refreshSyncMeta]
  );

  const eliminarGrupo = useCallback(
    async (id: number) => {
      await eliminarGrupoServicio(id);
      await loadGrupos();
      await refreshSyncMeta();
    },
    [loadGrupos, refreshSyncMeta]
  );

  const obtenerGrupo = useCallback(
    (id: number) => {
      return grupos.find((grupo) => grupo.id === id);
    },
    [grupos]
  );

  const value: GruposContextData = {
    grupos,
    isLoading,
    error,
    syncStatus,
    pendingSyncCount,
    isOnline,
    reloadGrupos: loadGrupos,
    syncGrupos,
    agregarGrupo,
    actualizarGrupo,
    eliminarGrupo,
    obtenerGrupo,
  };

  return <GruposContext.Provider value={value}>{children}</GruposContext.Provider>;
};

export const useGruposContext = (): GruposContextData => {
  const context = useContext(GruposContext);
  if (!context) {
    throw new Error("useGruposContext debe usarse dentro de GruposProvider");
  }
  return context;
};
