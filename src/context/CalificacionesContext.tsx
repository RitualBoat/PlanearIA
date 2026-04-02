import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Calificacion } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

const CALIFICACIONES_STORAGE_KEY = "@planearia:calificaciones";

interface CalificacionesContextData {
  calificaciones: Calificacion[];
  isLoading: boolean;
  error: string | null;
  reloadCalificaciones: () => Promise<void>;
  registrarCalificacion: (
    calificacion: Omit<Calificacion, "id"> & { id?: number }
  ) => Promise<{ calificacion: Calificacion; syncOk: boolean }>;
  registrarCalificacionesMasivas: (
    registros: (Omit<Calificacion, "id"> & { id?: number })[]
  ) => Promise<{ syncOk: boolean }>;
  actualizarCalificacion: (
    id: number,
    cambios: Partial<Calificacion>
  ) => Promise<{ syncOk: boolean }>;
  eliminarCalificacion: (id: number) => Promise<void>;
  obtenerCalificacionesPorGrupo: (grupoId: number) => Calificacion[];
  obtenerCalificacionesPorAlumno: (alumnoId: number) => Calificacion[];
  obtenerCalificacionesPorGrupoYParcial: (grupoId: number, parcial: number) => Calificacion[];
}

const CalificacionesContext = createContext<CalificacionesContextData | undefined>(undefined);

interface CalificacionesProviderProps {
  children: React.ReactNode;
}

const parseStored = (raw: string | null): Calificacion[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as Calificacion[];
};

const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": API_CONFIG.apiSecret,
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const syncCalificacionRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<Calificacion> | Partial<Calificacion>[]
): Promise<boolean> => {
  if (!isAPIConfigured()) return true;

  try {
    if (type === "delete" && !Array.isArray(payload)) {
      await apiRequest(`/api/calificaciones?id=${payload.id}`, { method: "DELETE" });
      return true;
    }

    await apiRequest("/api/calificaciones", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
};

export const CalificacionesProvider: React.FC<CalificacionesProviderProps> = ({ children }) => {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (next: Calificacion[]) => {
    await AsyncStorage.setItem(CALIFICACIONES_STORAGE_KEY, JSON.stringify(next));
    setCalificaciones(next);
  }, []);

  const reloadCalificaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const raw = await AsyncStorage.getItem(CALIFICACIONES_STORAGE_KEY);
      const data = parseStored(raw);
      setCalificaciones(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron cargar las calificaciones";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadCalificaciones();
  }, [reloadCalificaciones]);

  const registrarCalificacion = useCallback(
    async (
      calificacion: Omit<Calificacion, "id"> & { id?: number }
    ): Promise<{ calificacion: Calificacion; syncOk: boolean }> => {
      const nextId =
        calificacion.id ?? calificaciones.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const nueva: Calificacion = { ...calificacion, id: nextId };

      await persist([...calificaciones, nueva]);
      const syncOk = await syncCalificacionRemoto("create", nueva);
      return { calificacion: nueva, syncOk };
    },
    [calificaciones, persist]
  );

  const registrarCalificacionesMasivas = useCallback(
    async (
      registros: (Omit<Calificacion, "id"> & { id?: number })[]
    ): Promise<{ syncOk: boolean }> => {
      let baseId = calificaciones.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const nuevas: Calificacion[] = registros.map((reg) => {
        const id = reg.id ?? baseId++;
        return { ...reg, id } as Calificacion;
      });

      // Remove existing records for same grupo+alumno to allow re-registering
      const keys = new Set(nuevas.map((c) => `${c.grupoId}-${c.alumnoId}`));
      const filtered = calificaciones.filter((c) => !keys.has(`${c.grupoId}-${c.alumnoId}`));

      await persist([...filtered, ...nuevas]);
      const syncOk = await syncCalificacionRemoto("create", nuevas);
      return { syncOk };
    },
    [calificaciones, persist]
  );

  const actualizarCalificacion = useCallback(
    async (id: number, cambios: Partial<Calificacion>) => {
      const next = calificaciones.map((c) => (c.id === id ? { ...c, ...cambios } : c));
      await persist(next);
      const syncOk = await syncCalificacionRemoto("update", { id, ...cambios });
      return { syncOk };
    },
    [calificaciones, persist]
  );

  const eliminarCalificacion = useCallback(
    async (id: number) => {
      const next = calificaciones.filter((c) => c.id !== id);
      await persist(next);
      await syncCalificacionRemoto("delete", { id });
    },
    [calificaciones, persist]
  );

  const obtenerCalificacionesPorGrupo = useCallback(
    (grupoId: number) => calificaciones.filter((c) => c.grupoId === grupoId),
    [calificaciones]
  );

  const obtenerCalificacionesPorAlumno = useCallback(
    (alumnoId: number) => calificaciones.filter((c) => c.alumnoId === alumnoId),
    [calificaciones]
  );

  const obtenerCalificacionesPorGrupoYParcial = useCallback(
    (grupoId: number, parcial: number) => {
      return calificaciones.filter((c) => {
        if (c.grupoId !== grupoId) return false;
        const key = `parcial${parcial}` as keyof Calificacion;
        return c[key] !== undefined && c[key] !== null;
      });
    },
    [calificaciones]
  );

  const value = useMemo<CalificacionesContextData>(
    () => ({
      calificaciones,
      isLoading,
      error,
      reloadCalificaciones,
      registrarCalificacion,
      registrarCalificacionesMasivas,
      actualizarCalificacion,
      eliminarCalificacion,
      obtenerCalificacionesPorGrupo,
      obtenerCalificacionesPorAlumno,
      obtenerCalificacionesPorGrupoYParcial,
    }),
    [
      calificaciones,
      isLoading,
      error,
      reloadCalificaciones,
      registrarCalificacion,
      registrarCalificacionesMasivas,
      actualizarCalificacion,
      eliminarCalificacion,
      obtenerCalificacionesPorGrupo,
      obtenerCalificacionesPorAlumno,
      obtenerCalificacionesPorGrupoYParcial,
    ]
  );

  return <CalificacionesContext.Provider value={value}>{children}</CalificacionesContext.Provider>;
};

export const useCalificaciones = (): CalificacionesContextData => {
  const context = useContext(CalificacionesContext);
  if (!context) {
    throw new Error("useCalificaciones debe usarse dentro de CalificacionesProvider");
  }
  return context;
};
