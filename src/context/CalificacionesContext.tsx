import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Calificacion } from "../../types";
import { SYNC_ENTITIES, queueEntityOperation } from "../sync/services/entitySync";
import { onSyncEvent } from "../sync/services/syncEvents";
import { generateNumericId } from "../utils/generateId";

const CALIFICACIONES_STORAGE_KEY = SYNC_ENTITIES.calificaciones.storageKey;

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

  // A pull from the backend rewrote local storage: refresh state silently
  useEffect(() => {
    return onSyncEvent((event) => {
      if (event.type !== "entity-updated" || event.entity !== "calificaciones") return;
      void AsyncStorage.getItem(CALIFICACIONES_STORAGE_KEY).then((raw) => {
        setCalificaciones(parseStored(raw));
      });
    });
  }, []);

  const registrarCalificacion = useCallback(
    async (
      calificacion: Omit<Calificacion, "id"> & { id?: number }
    ): Promise<{ calificacion: Calificacion; syncOk: boolean }> => {
      const nueva: Calificacion = { ...calificacion, id: calificacion.id ?? generateNumericId() };

      await persist([...calificaciones, nueva]);
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.calificaciones, "create", nueva);
      return { calificacion: nueva, syncOk };
    },
    [calificaciones, persist]
  );

  const registrarCalificacionesMasivas = useCallback(
    async (
      registros: (Omit<Calificacion, "id"> & { id?: number })[]
    ): Promise<{ syncOk: boolean }> => {
      const nuevas: Calificacion[] = registros.map((reg) => {
        const id = reg.id ?? generateNumericId();
        return { ...reg, id } as Calificacion;
      });

      // Remove existing records for same grupo+alumno to allow re-registering
      const keys = new Set(nuevas.map((c) => `${c.grupoId}-${c.alumnoId}`));
      const reemplazadas = calificaciones.filter((c) => keys.has(`${c.grupoId}-${c.alumnoId}`));
      const filtered = calificaciones.filter((c) => !keys.has(`${c.grupoId}-${c.alumnoId}`));

      await persist([...filtered, ...nuevas]);

      // The replaced records must also disappear from the backend or the
      // next pull would resurrect them
      let syncOk = true;
      for (const reemplazada of reemplazadas) {
        const ok = await queueEntityOperation(SYNC_ENTITIES.calificaciones, "delete", {
          id: reemplazada.id,
        });
        syncOk = syncOk && ok;
      }
      for (const nueva of nuevas) {
        const ok = await queueEntityOperation(SYNC_ENTITIES.calificaciones, "create", nueva);
        syncOk = syncOk && ok;
      }
      return { syncOk };
    },
    [calificaciones, persist]
  );

  const actualizarCalificacion = useCallback(
    async (id: number, cambios: Partial<Calificacion>) => {
      const actual = calificaciones.find((c) => c.id === id);
      const merged = { ...actual, ...cambios, id } as Calificacion;
      const next = calificaciones.map((c) => (c.id === id ? merged : c));
      await persist(next);
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.calificaciones, "update", merged);
      return { syncOk };
    },
    [calificaciones, persist]
  );

  const eliminarCalificacion = useCallback(
    async (id: number) => {
      const next = calificaciones.filter((c) => c.id !== id);
      await persist(next);
      await queueEntityOperation(SYNC_ENTITIES.calificaciones, "delete", { id });
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
