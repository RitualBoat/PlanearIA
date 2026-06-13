import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Alumno } from "../../types";
import { SYNC_ENTITIES, queueEntityOperation } from "../sync/services/entitySync";
import { onSyncEvent } from "../sync/services/syncEvents";
import { generateNumericId } from "../utils/generateId";

const ALUMNOS_STORAGE_KEY = SYNC_ENTITIES.alumnos.storageKey;

interface AlumnosContextData {
  alumnos: Alumno[];
  isLoading: boolean;
  error: string | null;
  reloadAlumnos: () => Promise<void>;
  agregarAlumno: (
    alumno: Omit<Alumno, "id"> & { id?: number }
  ) => Promise<{ alumno: Alumno; syncOk: boolean }>;
  actualizarAlumno: (id: number, cambios: Partial<Alumno>) => Promise<{ syncOk: boolean }>;
  eliminarAlumno: (id: number) => Promise<void>;
  obtenerAlumno: (id: number) => Alumno | undefined;
}

const AlumnosContext = createContext<AlumnosContextData | undefined>(undefined);

interface AlumnosProviderProps {
  children: React.ReactNode;
}

const parseStored = (raw: string | null): Alumno[] => {
  if (!raw) return [];

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed as Alumno[];
};

export const AlumnosProvider: React.FC<AlumnosProviderProps> = ({ children }) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (next: Alumno[]) => {
    await AsyncStorage.setItem(ALUMNOS_STORAGE_KEY, JSON.stringify(next));
    setAlumnos(next);
  }, []);

  const reloadAlumnos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const raw = await AsyncStorage.getItem(ALUMNOS_STORAGE_KEY);
      const data = parseStored(raw);
      setAlumnos(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron cargar los alumnos";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadAlumnos();
  }, [reloadAlumnos]);

  // A pull from the backend rewrote local storage: refresh state silently
  useEffect(() => {
    return onSyncEvent((event) => {
      if (event.type !== "entity-updated" || event.entity !== "alumnos") return;
      void AsyncStorage.getItem(ALUMNOS_STORAGE_KEY).then((raw) => {
        setAlumnos(parseStored(raw));
      });
    });
  }, []);

  const agregarAlumno = useCallback(
    async (
      alumno: Omit<Alumno, "id"> & { id?: number }
    ): Promise<{ alumno: Alumno; syncOk: boolean }> => {
      const nuevoAlumno: Alumno = {
        ...alumno,
        id: alumno.id ?? generateNumericId(),
      };

      await persist([...alumnos, nuevoAlumno]);
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.alumnos, "create", nuevoAlumno);
      return { alumno: nuevoAlumno, syncOk };
    },
    [alumnos, persist]
  );

  const actualizarAlumno = useCallback(
    async (id: number, cambios: Partial<Alumno>) => {
      const actual = alumnos.find((alumno) => alumno.id === id);
      const merged = { ...actual, ...cambios, id } as Alumno;
      const next = alumnos.map((alumno) => (alumno.id === id ? merged : alumno));
      await persist(next);
      const syncOk = await queueEntityOperation(SYNC_ENTITIES.alumnos, "update", merged);
      return { syncOk };
    },
    [alumnos, persist]
  );

  const eliminarAlumno = useCallback(
    async (id: number) => {
      const next = alumnos.filter((alumno) => alumno.id !== id);
      await persist(next);
      await queueEntityOperation(SYNC_ENTITIES.alumnos, "delete", { id });
    },
    [alumnos, persist]
  );

  const obtenerAlumno = useCallback(
    (id: number) => {
      return alumnos.find((alumno) => alumno.id === id);
    },
    [alumnos]
  );

  const value = useMemo<AlumnosContextData>(
    () => ({
      alumnos,
      isLoading,
      error,
      reloadAlumnos,
      agregarAlumno,
      actualizarAlumno,
      eliminarAlumno,
      obtenerAlumno,
    }),
    [
      agregarAlumno,
      alumnos,
      actualizarAlumno,
      eliminarAlumno,
      error,
      isLoading,
      obtenerAlumno,
      reloadAlumnos,
    ]
  );

  return <AlumnosContext.Provider value={value}>{children}</AlumnosContext.Provider>;
};

export const useAlumnos = (): AlumnosContextData => {
  const context = useContext(AlumnosContext);
  if (!context) {
    throw new Error("useAlumnos debe usarse dentro de AlumnosProvider");
  }
  return context;
};
