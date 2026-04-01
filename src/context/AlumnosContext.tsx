import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Alumno } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

const ALUMNOS_STORAGE_KEY = "@planearia:alumnos";

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

const syncAlumnoRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<Alumno>
): Promise<boolean> => {
  if (!isAPIConfigured()) return true;

  try {
    if (type === "delete") {
      await apiRequest(`/api/alumnos?id=${payload.id}`, { method: "DELETE" });
      return true;
    }

    await apiRequest("/api/alumnos", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    // Offline-first: el dato local ya se guardo, la sincronizacion se reintentara mas adelante.
    return false;
  }
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

  const agregarAlumno = useCallback(
    async (
      alumno: Omit<Alumno, "id"> & { id?: number }
    ): Promise<{ alumno: Alumno; syncOk: boolean }> => {
      const nextId = alumno.id ?? alumnos.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const nuevoAlumno: Alumno = {
        ...alumno,
        id: nextId,
      };

      await persist([...alumnos, nuevoAlumno]);
      const syncOk = await syncAlumnoRemoto("create", nuevoAlumno);
      return { alumno: nuevoAlumno, syncOk };
    },
    [alumnos, persist]
  );

  const actualizarAlumno = useCallback(
    async (id: number, cambios: Partial<Alumno>) => {
      const next = alumnos.map((alumno) => (alumno.id === id ? { ...alumno, ...cambios } : alumno));
      await persist(next);
      const syncOk = await syncAlumnoRemoto("update", { id, ...cambios });
      return { syncOk };
    },
    [alumnos, persist]
  );

  const eliminarAlumno = useCallback(
    async (id: number) => {
      const next = alumnos.filter((alumno) => alumno.id !== id);
      await persist(next);
      await syncAlumnoRemoto("delete", { id });
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
