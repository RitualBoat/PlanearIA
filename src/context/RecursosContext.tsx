import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recurso } from "../../types";
import { SYNC_ENTITIES, queueEntityOperation } from "../sync/services/entitySync";
import { onSyncEvent } from "../sync/services/syncEvents";
import { generateNumericId } from "../utils/generateId";

const RECURSOS_STORAGE_KEY = SYNC_ENTITIES.recursos.storageKey;

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

  // A pull from the backend rewrote local storage: refresh state silently
  useEffect(() => {
    return onSyncEvent((event) => {
      if (event.type !== "entity-updated" || event.entity !== "recursos") return;
      void AsyncStorage.getItem(RECURSOS_STORAGE_KEY).then((raw) => {
        setRecursos(parseStored(raw));
      });
    });
  }, []);

  const crearRecurso = useCallback(
    async (
      recurso: Omit<Recurso, "id"> & { id?: number }
    ): Promise<{ recurso: Recurso; syncOk: boolean }> => {
      const nuevo: Recurso = { ...recurso, id: recurso.id ?? generateNumericId() };

      await persist([...recursos, nuevo]);
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.recursos, "create", nuevo);
      return { recurso: nuevo, syncOk };
    },
    [recursos, persist]
  );

  const actualizarRecurso = useCallback(
    async (id: number, cambios: Partial<Recurso>) => {
      const actual = recursos.find((r) => r.id === id);
      const merged = { ...actual, ...cambios, id } as Recurso;
      const next = recursos.map((r) => (r.id === id ? merged : r));
      await persist(next);
      // Full doc: the backend upserts, so a partial patch could leave an
      // incomplete document if the create never reached the server
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.recursos, "update", merged);
      return { syncOk };
    },
    [recursos, persist]
  );

  const eliminarRecurso = useCallback(
    async (id: number) => {
      const next = recursos.filter((r) => r.id !== id);
      await persist(next);
      await queueEntityOperation(SYNC_ENTITIES.recursos, "delete", { id });
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
