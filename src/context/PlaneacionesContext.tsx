import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Planeacion,
  NivelAcademico,
  PlaneacionBase,
  FiltrosPlaneacion,
} from "../../types/planeacion";

/**
 * Estados de sincronización
 */
export type SyncStatus = "idle" | "loading" | "synced" | "error" | "offline";

/**
 * Constantes para AsyncStorage
 */
const STORAGE_KEYS = {
  PLANEACIONES: "@planearia:planeaciones",
  LAST_SYNC: "@planearia:last_sync",
  PENDING_OPERATIONS: "@planearia:pending_ops",
};

/**
 * Interfaz para el contexto de planeaciones
 */
interface PlaneacionesContextData {
  planeaciones: Planeacion[];
  planeacionActual: Planeacion | null;
  syncStatus: SyncStatus;
  isLoading: boolean;
  agregarPlaneacion: (planeacion: Planeacion) => Promise<void>;
  actualizarPlaneacion: (
    id: string,
    planeacion: Partial<Planeacion>
  ) => Promise<void>;
  eliminarPlaneacion: (id: string) => Promise<void>;
  obtenerPlaneacion: (id: string) => Planeacion | undefined;
  clonarPlaneacion: (id: string) => Promise<void>;
  filtrarPlaneaciones: (filtros: FiltrosPlaneacion) => Planeacion[];
  setPlaneacionActual: (planeacion: Planeacion | null) => void;
  limpiarPlaneaciones: () => Promise<void>;
  reloadFromStorage: () => Promise<void>;
}

/**
 * Contexto de planeaciones
 */
const PlaneacionesContext = createContext<PlaneacionesContextData | undefined>(
  undefined
);

/**
 * Props del provider
 */
interface PlaneacionesProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de planeaciones
 * Maneja el estado global de todas las planeaciones con persistencia en AsyncStorage
 */
export const PlaneacionesProvider: React.FC<PlaneacionesProviderProps> = ({
  children,
}) => {
  const [planeaciones, setPlaneaciones] = useState<Planeacion[]>([]);
  const [planeacionActual, setPlaneacionActual] = useState<Planeacion | null>(
    null
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carga las planeaciones desde AsyncStorage al iniciar
   */
  useEffect(() => {
    loadFromStorage();
  }, []);

  /**
   * Guarda en AsyncStorage cada vez que cambian las planeaciones
   */
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(planeaciones);
    }
  }, [planeaciones, isLoading]);

  /**
   * Carga datos desde AsyncStorage
   */
  const loadFromStorage = async () => {
    try {
      setIsLoading(true);
      setSyncStatus("loading");

      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PLANEACIONES);

      if (stored) {
        const data: Planeacion[] = JSON.parse(stored);
        setPlaneaciones(data);
        console.log(`✅ Cargadas ${data.length} planeaciones desde storage`);
      } else {
        console.log("ℹ️ No hay planeaciones guardadas");
      }

      setSyncStatus("synced");
    } catch (error) {
      console.error("❌ Error cargando planeaciones:", error);
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Guarda datos en AsyncStorage
   */
  const saveToStorage = async (data: Planeacion[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PLANEACIONES,
        JSON.stringify(data)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );
      setSyncStatus("synced");
      console.log(`💾 Guardadas ${data.length} planeaciones en storage`);
    } catch (error) {
      console.error("❌ Error guardando planeaciones:", error);
      setSyncStatus("error");
    }
  };

  /**
   * Recarga datos desde AsyncStorage
   */
  const reloadFromStorage = async () => {
    await loadFromStorage();
  };

  /**
   * Agrega una nueva planeación
   */
  const agregarPlaneacion = async (planeacion: Planeacion) => {
    try {
      setSyncStatus("loading");
      setPlaneaciones((prev) => [...prev, planeacion]);
      console.log(`➕ Planeación agregada: ${planeacion.temaSesion}`);
    } catch (error) {
      console.error("❌ Error agregando planeación:", error);
      setSyncStatus("error");
      throw error;
    }
  };

  /**
   * Actualiza una planeación existente
   */
  const actualizarPlaneacion = async (
    id: string,
    actualizacion: Partial<Planeacion>
  ) => {
    try {
      setSyncStatus("loading");
      setPlaneaciones((prev) =>
        prev.map((p) =>
          p.id === id
            ? ({
                ...p,
                ...actualizacion,
                fechaModificacion: new Date().toISOString(),
              } as Planeacion)
            : p
        )
      );
      console.log(`✏️ Planeación actualizada: ${id}`);
    } catch (error) {
      console.error("❌ Error actualizando planeación:", error);
      setSyncStatus("error");
      throw error;
    }
  };

  /**
   * Elimina una planeación
   */
  const eliminarPlaneacion = async (id: string) => {
    try {
      setSyncStatus("loading");
      setPlaneaciones((prev) => prev.filter((p) => p.id !== id));
      console.log(`🗑️ Planeación eliminada: ${id}`);
    } catch (error) {
      console.error("❌ Error eliminando planeación:", error);
      setSyncStatus("error");
      throw error;
    }
  };

  /**
   * Obtiene una planeación por ID
   */
  const obtenerPlaneacion = (id: string): Planeacion | undefined => {
    return planeaciones.find((p) => p.id === id);
  };

  /**
   * Clona una planeación existente
   */
  const clonarPlaneacion = async (id: string) => {
    try {
      setSyncStatus("loading");
      const planeacionOriginal = obtenerPlaneacion(id);
      if (planeacionOriginal) {
        const nuevaPlaneacion: Planeacion = {
          ...planeacionOriginal,
          id: Date.now().toString(),
          fechaCreacion: new Date().toISOString(),
          fechaModificacion: new Date().toISOString(),
          temaSesion: `${planeacionOriginal.temaSesion} (Copia)`,
        };
        await agregarPlaneacion(nuevaPlaneacion);
        console.log(`📋 Planeación clonada: ${nuevaPlaneacion.temaSesion}`);
      }
    } catch (error) {
      console.error("❌ Error clonando planeación:", error);
      setSyncStatus("error");
      throw error;
    }
  };

  /**
   * Filtra planeaciones según criterios
   */
  const filtrarPlaneaciones = (filtros: FiltrosPlaneacion): Planeacion[] => {
    return planeaciones.filter((planeacion) => {
      if (
        filtros.nivelAcademico &&
        planeacion.nivelAcademico !== filtros.nivelAcademico
      ) {
        return false;
      }
      if (
        filtros.asignatura &&
        !planeacion.asignatura
          .toLowerCase()
          .includes(filtros.asignatura.toLowerCase())
      ) {
        return false;
      }
      if (filtros.grado && planeacion.grado !== filtros.grado) {
        return false;
      }
      if (filtros.fechaInicio && planeacion.fecha < filtros.fechaInicio) {
        return false;
      }
      if (filtros.fechaFin && planeacion.fecha > filtros.fechaFin) {
        return false;
      }
      return true;
    });
  };

  /**
   * Limpia todas las planeaciones (útil para testing)
   */
  const limpiarPlaneaciones = async () => {
    try {
      setSyncStatus("loading");
      setPlaneaciones([]);
      setPlaneacionActual(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.PLANEACIONES);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
      setSyncStatus("synced");
      console.log("🧹 Todas las planeaciones eliminadas");
    } catch (error) {
      console.error("❌ Error limpiando planeaciones:", error);
      setSyncStatus("error");
      throw error;
    }
  };

  const value: PlaneacionesContextData = {
    planeaciones,
    planeacionActual,
    syncStatus,
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
  };

  return (
    <PlaneacionesContext.Provider value={value}>
      {children}
    </PlaneacionesContext.Provider>
  );
};

/**
 * Hook para usar el contexto de planeaciones
 */
export const usePlaneaciones = (): PlaneacionesContextData => {
  const context = useContext(PlaneacionesContext);
  if (context === undefined) {
    throw new Error(
      "usePlaneaciones debe ser usado dentro de PlaneacionesProvider"
    );
  }
  return context;
};
