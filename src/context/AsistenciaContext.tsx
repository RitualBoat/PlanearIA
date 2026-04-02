import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Asistencia } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

const ASISTENCIAS_STORAGE_KEY = "@planearia:asistencias";

interface AsistenciaContextData {
  asistencias: Asistencia[];
  isLoading: boolean;
  error: string | null;
  reloadAsistencias: () => Promise<void>;
  registrarAsistencia: (
    asistencia: Omit<Asistencia, "id"> & { id?: number }
  ) => Promise<{ asistencia: Asistencia; syncOk: boolean }>;
  registrarAsistenciaMasiva: (
    registros: (Omit<Asistencia, "id"> & { id?: number })[]
  ) => Promise<{ syncOk: boolean }>;
  actualizarAsistencia: (id: number, cambios: Partial<Asistencia>) => Promise<{ syncOk: boolean }>;
  eliminarAsistencia: (id: number) => Promise<void>;
  obtenerAsistenciasPorGrupoYFecha: (grupoId: number, fecha: string) => Asistencia[];
  obtenerAsistenciasPorGrupo: (grupoId: number) => Asistencia[];
  obtenerAsistenciasPorAlumno: (alumnoId: number) => Asistencia[];
}

const AsistenciaContext = createContext<AsistenciaContextData | undefined>(undefined);

interface AsistenciaProviderProps {
  children: React.ReactNode;
}

const parseStored = (raw: string | null): Asistencia[] => {
  if (!raw) return [];

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed as Asistencia[];
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

const syncAsistenciaRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<Asistencia> | Partial<Asistencia>[]
): Promise<boolean> => {
  if (!isAPIConfigured()) return true;

  try {
    if (type === "delete" && !Array.isArray(payload)) {
      await apiRequest(`/api/asistencias?id=${payload.id}`, { method: "DELETE" });
      return true;
    }

    await apiRequest("/api/asistencias", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
};

const normalizeFecha = (fecha: Date | string): string => {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const AsistenciaProvider: React.FC<AsistenciaProviderProps> = ({ children }) => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (next: Asistencia[]) => {
    await AsyncStorage.setItem(ASISTENCIAS_STORAGE_KEY, JSON.stringify(next));
    setAsistencias(next);
  }, []);

  const reloadAsistencias = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const raw = await AsyncStorage.getItem(ASISTENCIAS_STORAGE_KEY);
      const data = parseStored(raw);
      setAsistencias(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron cargar las asistencias";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadAsistencias();
  }, [reloadAsistencias]);

  const registrarAsistencia = useCallback(
    async (
      asistencia: Omit<Asistencia, "id"> & { id?: number }
    ): Promise<{ asistencia: Asistencia; syncOk: boolean }> => {
      const nextId =
        asistencia.id ?? asistencias.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const nueva: Asistencia = { ...asistencia, id: nextId };

      await persist([...asistencias, nueva]);
      const syncOk = await syncAsistenciaRemoto("create", nueva);
      return { asistencia: nueva, syncOk };
    },
    [asistencias, persist]
  );

  const registrarAsistenciaMasiva = useCallback(
    async (
      registros: (Omit<Asistencia, "id"> & { id?: number })[]
    ): Promise<{ syncOk: boolean }> => {
      let baseId = asistencias.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const nuevas: Asistencia[] = registros.map((reg) => {
        const id = reg.id ?? baseId++;
        return { ...reg, id } as Asistencia;
      });

      // Remove any existing records for same grupo+fecha to allow re-registering
      const fechasGrupos = new Set(nuevas.map((a) => `${a.grupoId}-${normalizeFecha(a.fecha)}`));
      const filtered = asistencias.filter(
        (a) => !fechasGrupos.has(`${a.grupoId}-${normalizeFecha(a.fecha)}`)
      );

      await persist([...filtered, ...nuevas]);
      const syncOk = await syncAsistenciaRemoto("create", nuevas);
      return { syncOk };
    },
    [asistencias, persist]
  );

  const actualizarAsistencia = useCallback(
    async (id: number, cambios: Partial<Asistencia>) => {
      const next = asistencias.map((a) => (a.id === id ? { ...a, ...cambios } : a));
      await persist(next);
      const syncOk = await syncAsistenciaRemoto("update", { id, ...cambios });
      return { syncOk };
    },
    [asistencias, persist]
  );

  const eliminarAsistencia = useCallback(
    async (id: number) => {
      const next = asistencias.filter((a) => a.id !== id);
      await persist(next);
      await syncAsistenciaRemoto("delete", { id });
    },
    [asistencias, persist]
  );

  const obtenerAsistenciasPorGrupoYFecha = useCallback(
    (grupoId: number, fecha: string) => {
      const target = normalizeFecha(fecha);
      return asistencias.filter((a) => a.grupoId === grupoId && normalizeFecha(a.fecha) === target);
    },
    [asistencias]
  );

  const obtenerAsistenciasPorGrupo = useCallback(
    (grupoId: number) => {
      return asistencias.filter((a) => a.grupoId === grupoId);
    },
    [asistencias]
  );

  const obtenerAsistenciasPorAlumno = useCallback(
    (alumnoId: number) => {
      return asistencias.filter((a) => a.alumnoId === alumnoId);
    },
    [asistencias]
  );

  const value = useMemo<AsistenciaContextData>(
    () => ({
      asistencias,
      isLoading,
      error,
      reloadAsistencias,
      registrarAsistencia,
      registrarAsistenciaMasiva,
      actualizarAsistencia,
      eliminarAsistencia,
      obtenerAsistenciasPorGrupoYFecha,
      obtenerAsistenciasPorGrupo,
      obtenerAsistenciasPorAlumno,
    }),
    [
      asistencias,
      isLoading,
      error,
      reloadAsistencias,
      registrarAsistencia,
      registrarAsistenciaMasiva,
      actualizarAsistencia,
      eliminarAsistencia,
      obtenerAsistenciasPorGrupoYFecha,
      obtenerAsistenciasPorGrupo,
      obtenerAsistenciasPorAlumno,
    ]
  );

  return <AsistenciaContext.Provider value={value}>{children}</AsistenciaContext.Provider>;
};

export const useAsistencias = (): AsistenciaContextData => {
  const context = useContext(AsistenciaContext);
  if (!context) {
    throw new Error("useAsistencias debe usarse dentro de AsistenciaProvider");
  }
  return context;
};
