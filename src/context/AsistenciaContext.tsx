import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Asistencia } from "../../types";
import { SYNC_ENTITIES, queueEntityOperation } from "../sync/services/entitySync";
import { onSyncEvent } from "../sync/services/syncEvents";
import { generateNumericId } from "../utils/generateId";

const ASISTENCIAS_STORAGE_KEY = SYNC_ENTITIES.asistencias.storageKey;

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

  // A pull from the backend rewrote local storage: refresh state silently
  useEffect(() => {
    return onSyncEvent((event) => {
      if (event.type !== "entity-updated" || event.entity !== "asistencias") return;
      void AsyncStorage.getItem(ASISTENCIAS_STORAGE_KEY).then((raw) => {
        setAsistencias(parseStored(raw));
      });
    });
  }, []);

  const registrarAsistencia = useCallback(
    async (
      asistencia: Omit<Asistencia, "id"> & { id?: number }
    ): Promise<{ asistencia: Asistencia; syncOk: boolean }> => {
      const nueva: Asistencia = { ...asistencia, id: asistencia.id ?? generateNumericId() };

      await persist([...asistencias, nueva]);
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.asistencias, "create", nueva);
      return { asistencia: nueva, syncOk };
    },
    [asistencias, persist]
  );

  const registrarAsistenciaMasiva = useCallback(
    async (
      registros: (Omit<Asistencia, "id"> & { id?: number })[]
    ): Promise<{ syncOk: boolean }> => {
      const nuevas: Asistencia[] = registros.map((reg) => {
        const id = reg.id ?? generateNumericId();
        return { ...reg, id } as Asistencia;
      });

      // Remove any existing records for same grupo+fecha to allow re-registering
      const fechasGrupos = new Set(nuevas.map((a) => `${a.grupoId}-${normalizeFecha(a.fecha)}`));
      const reemplazadas = asistencias.filter((a) =>
        fechasGrupos.has(`${a.grupoId}-${normalizeFecha(a.fecha)}`)
      );
      const filtered = asistencias.filter(
        (a) => !fechasGrupos.has(`${a.grupoId}-${normalizeFecha(a.fecha)}`)
      );

      await persist([...filtered, ...nuevas]);

      // The replaced records must also disappear from the backend or the
      // next pull would resurrect them
      let syncOk = true;
      for (const reemplazada of reemplazadas) {
        const ok = await queueEntityOperation(SYNC_ENTITIES.asistencias, "delete", {
          id: reemplazada.id,
        });
        syncOk = syncOk && ok;
      }
      for (const nueva of nuevas) {
        const ok = await queueEntityOperation(SYNC_ENTITIES.asistencias, "create", nueva);
        syncOk = syncOk && ok;
      }
      return { syncOk };
    },
    [asistencias, persist]
  );

  const actualizarAsistencia = useCallback(
    async (id: number, cambios: Partial<Asistencia>) => {
      const actual = asistencias.find((a) => a.id === id);
      const merged = { ...actual, ...cambios, id } as Asistencia;
      const next = asistencias.map((a) => (a.id === id ? merged : a));
      await persist(next);
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.asistencias, "update", merged);
      return { syncOk };
    },
    [asistencias, persist]
  );

  const eliminarAsistencia = useCallback(
    async (id: number) => {
      const next = asistencias.filter((a) => a.id !== id);
      await persist(next);
      await queueEntityOperation(SYNC_ENTITIES.asistencias, "delete", { id });
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
