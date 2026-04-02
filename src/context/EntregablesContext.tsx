import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Tarea } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

const ENTREGABLES_STORAGE_KEY = "@planearia:entregables";

interface EntregablesContextData {
  entregables: Tarea[];
  isLoading: boolean;
  error: string | null;
  reloadEntregables: () => Promise<void>;
  crearEntregable: (
    entregable: Omit<Tarea, "id"> & { id?: number }
  ) => Promise<{ entregable: Tarea; syncOk: boolean }>;
  actualizarEntregable: (id: number, cambios: Partial<Tarea>) => Promise<{ syncOk: boolean }>;
  eliminarEntregable: (id: number) => Promise<void>;
  obtenerEntregablesPorGrupo: (grupoId: number) => Tarea[];
  obtenerEntregablePorId: (id: number) => Tarea | undefined;
  obtenerEntregablesPorTipo: (tipo: "tarea" | "examen" | "proyecto" | "investigacion") => Tarea[];
}

const EntregablesContext = createContext<EntregablesContextData | undefined>(undefined);

interface EntregablesProviderProps {
  children: React.ReactNode;
}

const parseStored = (raw: string | null): Tarea[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as Tarea[];
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

const syncEntregableRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<Tarea>
): Promise<boolean> => {
  if (!isAPIConfigured()) return true;

  try {
    if (type === "delete") {
      await apiRequest(`/api/entregables?id=${payload.id}`, {
        method: "DELETE",
      });
      return true;
    }

    await apiRequest("/api/entregables", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
};

export const EntregablesProvider: React.FC<EntregablesProviderProps> = ({ children }) => {
  const [entregables, setEntregables] = useState<Tarea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (next: Tarea[]) => {
    await AsyncStorage.setItem(ENTREGABLES_STORAGE_KEY, JSON.stringify(next));
    setEntregables(next);
  }, []);

  const reloadEntregables = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const raw = await AsyncStorage.getItem(ENTREGABLES_STORAGE_KEY);
      const data = parseStored(raw);
      setEntregables(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron cargar los entregables";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadEntregables();
  }, [reloadEntregables]);

  const crearEntregable = useCallback(
    async (
      entregable: Omit<Tarea, "id"> & { id?: number }
    ): Promise<{ entregable: Tarea; syncOk: boolean }> => {
      const nextId =
        entregable.id ?? entregables.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const nuevo: Tarea = { ...entregable, id: nextId };

      await persist([...entregables, nuevo]);
      const syncOk = await syncEntregableRemoto("create", nuevo);
      return { entregable: nuevo, syncOk };
    },
    [entregables, persist]
  );

  const actualizarEntregable = useCallback(
    async (id: number, cambios: Partial<Tarea>) => {
      const next = entregables.map((e) => (e.id === id ? { ...e, ...cambios } : e));
      await persist(next);
      const syncOk = await syncEntregableRemoto("update", { id, ...cambios });
      return { syncOk };
    },
    [entregables, persist]
  );

  const eliminarEntregable = useCallback(
    async (id: number) => {
      const next = entregables.filter((e) => e.id !== id);
      await persist(next);
      await syncEntregableRemoto("delete", { id });
    },
    [entregables, persist]
  );

  const obtenerEntregablesPorGrupo = useCallback(
    (grupoId: number) => entregables.filter((e) => e.grupoId === grupoId),
    [entregables]
  );

  const obtenerEntregablePorId = useCallback(
    (id: number) => entregables.find((e) => e.id === id),
    [entregables]
  );

  const obtenerEntregablesPorTipo = useCallback(
    (tipo: "tarea" | "examen" | "proyecto" | "investigacion") =>
      entregables.filter((e) => e.tipo === tipo),
    [entregables]
  );

  const value = useMemo<EntregablesContextData>(
    () => ({
      entregables,
      isLoading,
      error,
      reloadEntregables,
      crearEntregable,
      actualizarEntregable,
      eliminarEntregable,
      obtenerEntregablesPorGrupo,
      obtenerEntregablePorId,
      obtenerEntregablesPorTipo,
    }),
    [
      entregables,
      isLoading,
      error,
      reloadEntregables,
      crearEntregable,
      actualizarEntregable,
      eliminarEntregable,
      obtenerEntregablesPorGrupo,
      obtenerEntregablePorId,
      obtenerEntregablesPorTipo,
    ]
  );

  return <EntregablesContext.Provider value={value}>{children}</EntregablesContext.Provider>;
};

export const useEntregables = (): EntregablesContextData => {
  const context = useContext(EntregablesContext);
  if (!context) {
    throw new Error("useEntregables debe usarse dentro de EntregablesProvider");
  }
  return context;
};
