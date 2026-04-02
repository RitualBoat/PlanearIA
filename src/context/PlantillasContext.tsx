import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Plantilla } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

const PLANTILLAS_STORAGE_KEY = "@planearia:plantillas";

interface PlantillasContextData {
  plantillas: Plantilla[];
  isLoading: boolean;
  error: string | null;
  reloadPlantillas: () => Promise<void>;
  crearPlantilla: (
    plantilla: Omit<Plantilla, "id"> & { id?: number }
  ) => Promise<{ plantilla: Plantilla; syncOk: boolean }>;
  actualizarPlantilla: (id: number, cambios: Partial<Plantilla>) => Promise<{ syncOk: boolean }>;
  eliminarPlantilla: (id: number) => Promise<void>;
  obtenerPlantillaPorId: (id: number) => Plantilla | undefined;
  obtenerPlantillasPorCategoria: (categoria: Plantilla["categoria"]) => Plantilla[];
}

const PlantillasContext = createContext<PlantillasContextData | undefined>(undefined);

interface PlantillasProviderProps {
  children: React.ReactNode;
}

const parseStored = (raw: string | null): Plantilla[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as Plantilla[];
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

const syncPlantillaRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<Plantilla>
): Promise<boolean> => {
  if (!isAPIConfigured()) return true;

  try {
    if (type === "delete") {
      await apiRequest(`/api/plantillas?id=${payload.id}`, {
        method: "DELETE",
      });
      return true;
    }

    await apiRequest("/api/plantillas", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
};

export const PlantillasProvider: React.FC<PlantillasProviderProps> = ({ children }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlantillas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const raw = await AsyncStorage.getItem(PLANTILLAS_STORAGE_KEY);
      setPlantillas(parseStored(raw));
    } catch {
      setError("Error al cargar plantillas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlantillas();
  }, [loadPlantillas]);

  const savePlantillas = useCallback(async (updated: Plantilla[]) => {
    setPlantillas(updated);
    await AsyncStorage.setItem(PLANTILLAS_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const crearPlantilla = useCallback(
    async (
      plantilla: Omit<Plantilla, "id"> & { id?: number }
    ): Promise<{ plantilla: Plantilla; syncOk: boolean }> => {
      const newId = plantilla.id ?? Date.now();
      const nueva: Plantilla = { ...plantilla, id: newId } as Plantilla;
      const updated = [...plantillas, nueva];
      await savePlantillas(updated);
      const syncOk = await syncPlantillaRemoto("create", nueva);
      return { plantilla: nueva, syncOk };
    },
    [plantillas, savePlantillas]
  );

  const actualizarPlantilla = useCallback(
    async (id: number, cambios: Partial<Plantilla>): Promise<{ syncOk: boolean }> => {
      const updated = plantillas.map((p) => (p.id === id ? { ...p, ...cambios } : p));
      await savePlantillas(updated);
      const syncOk = await syncPlantillaRemoto("update", { id, ...cambios });
      return { syncOk };
    },
    [plantillas, savePlantillas]
  );

  const eliminarPlantilla = useCallback(
    async (id: number): Promise<void> => {
      const updated = plantillas.filter((p) => p.id !== id);
      await savePlantillas(updated);
      await syncPlantillaRemoto("delete", { id });
    },
    [plantillas, savePlantillas]
  );

  const obtenerPlantillaPorId = useCallback(
    (id: number): Plantilla | undefined => plantillas.find((p) => p.id === id),
    [plantillas]
  );

  const obtenerPlantillasPorCategoria = useCallback(
    (categoria: Plantilla["categoria"]): Plantilla[] =>
      plantillas.filter((p) => p.categoria === categoria),
    [plantillas]
  );

  const value = useMemo<PlantillasContextData>(
    () => ({
      plantillas,
      isLoading,
      error,
      reloadPlantillas: loadPlantillas,
      crearPlantilla,
      actualizarPlantilla,
      eliminarPlantilla,
      obtenerPlantillaPorId,
      obtenerPlantillasPorCategoria,
    }),
    [
      plantillas,
      isLoading,
      error,
      loadPlantillas,
      crearPlantilla,
      actualizarPlantilla,
      eliminarPlantilla,
      obtenerPlantillaPorId,
      obtenerPlantillasPorCategoria,
    ]
  );

  return <PlantillasContext.Provider value={value}>{children}</PlantillasContext.Provider>;
};

export const usePlantillas = (): PlantillasContextData => {
  const ctx = useContext(PlantillasContext);
  if (!ctx) {
    throw new Error("usePlantillas debe usarse dentro de PlantillasProvider");
  }
  return ctx;
};
