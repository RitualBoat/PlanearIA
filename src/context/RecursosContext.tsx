import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recurso } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

const RECURSOS_STORAGE_KEY = "@planearia:recursos";

interface RecursosContextData {
  recursos: Recurso[];
  isLoading: boolean;
  error: string | null;
  reloadRecursos: () => Promise<void>;
  crearRecurso: (
    recurso: Omit<Recurso, "id"> & { id?: number }
  ) => Promise<{ recurso: Recurso; syncOk: boolean }>;
  actualizarRecurso: (id: number, cambios: Partial<Recurso>) => Promise<{ syncOk: boolean }>;
  eliminarRecurso: (id: number) => Promise<void>;
  obtenerRecursoPorId: (id: number) => Recurso | undefined;
  obtenerRecursosPorTipo: (tipo: Recurso["tipo"]) => Recurso[];
}

const RecursosContext = createContext<RecursosContextData | undefined>(undefined);

interface RecursosProviderProps {
  children: React.ReactNode;
}

const parseStored = (raw: string | null): Recurso[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as Recurso[];
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

const syncRecursoRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<Recurso>
): Promise<boolean> => {
  if (!isAPIConfigured()) return true;

  try {
    if (type === "delete") {
      await apiRequest(`/api/recursos?id=${payload.id}`, {
        method: "DELETE",
      });
      return true;
    }

    await apiRequest("/api/recursos", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
};

export const RecursosProvider: React.FC<RecursosProviderProps> = ({ children }) => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (next: Recurso[]) => {
    await AsyncStorage.setItem(RECURSOS_STORAGE_KEY, JSON.stringify(next));
    setRecursos(next);
  }, []);

  const reloadRecursos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const raw = await AsyncStorage.getItem(RECURSOS_STORAGE_KEY);
      const data = parseStored(raw);
      setRecursos(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron cargar los recursos";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadRecursos();
  }, [reloadRecursos]);

  const crearRecurso = useCallback(
    async (
      recurso: Omit<Recurso, "id"> & { id?: number }
    ): Promise<{ recurso: Recurso; syncOk: boolean }> => {
      const nextId =
        recurso.id ?? recursos.reduce((max, item) => Math.max(max, item.id as number), 0) + 1;
      const nuevo: Recurso = { ...recurso, id: nextId };

      await persist([...recursos, nuevo]);
      const syncOk = await syncRecursoRemoto("create", nuevo);
      return { recurso: nuevo, syncOk };
    },
    [recursos, persist]
  );

  const actualizarRecurso = useCallback(
    async (id: number, cambios: Partial<Recurso>) => {
      const next = recursos.map((r) => (r.id === id ? { ...r, ...cambios } : r));
      await persist(next);
      const syncOk = await syncRecursoRemoto("update", { id, ...cambios });
      return { syncOk };
    },
    [recursos, persist]
  );

  const eliminarRecurso = useCallback(
    async (id: number) => {
      const next = recursos.filter((r) => r.id !== id);
      await persist(next);
      await syncRecursoRemoto("delete", { id });
    },
    [recursos, persist]
  );

  const obtenerRecursoPorId = useCallback(
    (id: number) => recursos.find((r) => r.id === id),
    [recursos]
  );

  const obtenerRecursosPorTipo = useCallback(
    (tipo: Recurso["tipo"]) => recursos.filter((r) => r.tipo === tipo),
    [recursos]
  );

  const value = useMemo<RecursosContextData>(
    () => ({
      recursos,
      isLoading,
      error,
      reloadRecursos,
      crearRecurso,
      actualizarRecurso,
      eliminarRecurso,
      obtenerRecursoPorId,
      obtenerRecursosPorTipo,
    }),
    [
      recursos,
      isLoading,
      error,
      reloadRecursos,
      crearRecurso,
      actualizarRecurso,
      eliminarRecurso,
      obtenerRecursoPorId,
      obtenerRecursosPorTipo,
    ]
  );

  return <RecursosContext.Provider value={value}>{children}</RecursosContext.Provider>;
};

export const useRecursos = (): RecursosContextData => {
  const context = useContext(RecursosContext);
  if (!context) {
    throw new Error("useRecursos debe usarse dentro de RecursosProvider");
  }
  return context;
};
