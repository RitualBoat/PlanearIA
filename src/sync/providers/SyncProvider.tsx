/**
 * Provider de Sincronización con API Vercel
 * Envuelve la app y proporciona contexto de sync a todos los componentes
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Planeacion, FiltrosPlaneacion } from "../../../types/planeacion";
import {
  saveLocalPlaneaciones,
  loadLocalPlaneaciones,
  addPendingOperation,
  SyncStatus,
  SyncResult,
} from "../services/syncService";
import { useSync } from "../hooks/useSync";
import { STORAGE_KEYS } from "../config/apiConfig";

// =====================================
// TIPOS
// =====================================

interface SyncContextData {
  // Datos
  planeaciones: Planeacion[];
  planeacionActual: Planeacion | null;
  isLoading: boolean;

  // Operaciones CRUD
  agregarPlaneacion: (planeacion: Planeacion) => Promise<void>;
  actualizarPlaneacion: (
    id: string,
    updates: Partial<Planeacion>,
  ) => Promise<void>;
  eliminarPlaneacion: (id: string) => Promise<void>;
  obtenerPlaneacion: (id: string) => Planeacion | undefined;
  clonarPlaneacion: (id: string) => Promise<void>;
  filtrarPlaneaciones: (filtros: FiltrosPlaneacion) => Planeacion[];
  setPlaneacionActual: (planeacion: Planeacion | null) => void;
  limpiarPlaneaciones: () => Promise<void>;
  reloadFromStorage: () => Promise<void>;

  // Sincronización
  syncStatus: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
  lastSync: string | null;
  forceSync: () => Promise<void>;
  isSyncConfigured: boolean;
}

const SyncContext = createContext<SyncContextData | undefined>(undefined);

// =====================================
// PROVIDER
// =====================================

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [planeaciones, setPlaneaciones] = useState<Planeacion[]>([]);
  const [planeacionActual, setPlaneacionActual] = useState<Planeacion | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Hook de sincronización
  const {
    syncStatus,
    isOnline,
    pendingCount,
    lastSync,
    forceSync: syncForce,
    isSyncConfigured,
    justReconnected,
  } = useSync();

  /**
   * Carga planeaciones desde storage
   */
  const loadFromStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadLocalPlaneaciones();
      setPlaneaciones(data);
      console.log(`[provider] Loaded ${data.length} planeaciones`);
    } catch (error) {
      console.error("[provider] Load error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  /**
   * Recargar después de sync
   */
  useEffect(() => {
    if (justReconnected) {
      loadFromStorage();
    }
  }, [justReconnected, loadFromStorage]);

  /**
   * Guarda y registra operación pendiente
   */
  const saveAndSync = async (
    newPlaneaciones: Planeacion[],
    operation: {
      type: "create" | "update" | "delete";
      data: Planeacion | null;
    },
  ) => {
    await saveLocalPlaneaciones(newPlaneaciones);
    setPlaneaciones(newPlaneaciones);
    await addPendingOperation(operation);
  };

  /**
   * Agregar planeación
   */
  const agregarPlaneacion = async (planeacion: Planeacion) => {
    const newPlaneaciones = [...planeaciones, planeacion];
    await saveAndSync(newPlaneaciones, { type: "create", data: planeacion });
    console.log(`[provider] Added: ${planeacion.temaSesion}`);
  };

  /**
   * Actualizar planeación
   */
  const actualizarPlaneacion = async (
    id: string,
    updates: Partial<Planeacion>,
  ) => {
    const newPlaneaciones = planeaciones.map((p) =>
      p.id === id
        ? ({
            ...p,
            ...updates,
            fechaModificacion: new Date().toISOString(),
          } as Planeacion)
        : p,
    );
    const updated = newPlaneaciones.find((p) => p.id === id);
    await saveAndSync(newPlaneaciones, {
      type: "update",
      data: updated || null,
    });
    console.log(`[provider] Updated: ${id}`);
  };

  /**
   * Eliminar planeación
   */
  const eliminarPlaneacion = async (id: string) => {
    const toDelete = planeaciones.find((p) => p.id === id);
    const newPlaneaciones = planeaciones.filter((p) => p.id !== id);
    await saveAndSync(newPlaneaciones, {
      type: "delete",
      data: toDelete || null,
    });

    if (planeacionActual?.id === id) {
      setPlaneacionActual(null);
    }
    console.log(`[provider] Deleted: ${id}`);
  };

  /**
   * Obtener por ID
   */
  const obtenerPlaneacion = (id: string): Planeacion | undefined => {
    return planeaciones.find((p) => p.id === id);
  };

  /**
   * Clonar planeación
   */
  const clonarPlaneacion = async (id: string) => {
    const original = obtenerPlaneacion(id);
    if (original) {
      const clon: Planeacion = {
        ...original,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        temaSesion: `${original.temaSesion} (Copia)`,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
      };
      await agregarPlaneacion(clon);
    }
  };

  /**
   * Filtrar planeaciones
   */
  const filtrarPlaneaciones = (filtros: FiltrosPlaneacion): Planeacion[] => {
    return planeaciones.filter((p) => {
      if (filtros.nivelAcademico && p.nivelAcademico !== filtros.nivelAcademico)
        return false;
      if (
        filtros.asignatura &&
        !p.asignatura.toLowerCase().includes(filtros.asignatura.toLowerCase())
      )
        return false;
      if (filtros.grado && p.grado !== filtros.grado) return false;
      if (filtros.fechaInicio && p.fecha < filtros.fechaInicio) return false;
      if (filtros.fechaFin && p.fecha > filtros.fechaFin) return false;
      return true;
    });
  };

  /**
   * Limpiar todas
   */
  const limpiarPlaneaciones = async () => {
    setPlaneaciones([]);
    setPlaneacionActual(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.PLANEACIONES);
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_OPERATIONS);
    console.log("[provider] All planeaciones cleared");
  };

  /**
   * Recargar
   */
  const reloadFromStorage = async () => {
    await loadFromStorage();
  };

  /**
   * Forzar sync
   */
  const forceSync = async () => {
    await syncForce();
    await loadFromStorage();
  };

  const value: SyncContextData = {
    planeaciones,
    planeacionActual,
    isLoading,
    agregarPlaneacion,
    actualizarPlaneacion,
    eliminarPlaneacion,
    obtenerPlaneacion,
    clonarPlaneacion,
    filtrarPlaneaciones,
    setPlaneacionActual,
    limpiarPlaneaciones,
    reloadFromStorage,
    syncStatus,
    isOnline,
    pendingCount,
    lastSync,
    forceSync,
    isSyncConfigured,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

// =====================================
// HOOKS
// =====================================

export const useSyncPlaneaciones = (): SyncContextData => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncPlaneaciones debe usarse dentro de SyncProvider");
  }
  return context;
};

/** Alias para compatibilidad */
export const usePlaneaciones = useSyncPlaneaciones;
