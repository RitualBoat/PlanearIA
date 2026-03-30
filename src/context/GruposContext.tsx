import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Grupo } from "../../types";
import {
  obtenerGrupos as obtenerGruposServicio,
  agregarGrupo as agregarGrupoServicio,
  actualizarGrupo as actualizarGrupoServicio,
  eliminarGrupo as eliminarGrupoServicio,
} from "../services/gruposService";

interface GruposContextData {
  grupos: Partial<Grupo>[];
  isLoading: boolean;
  error: string | null;
  reloadGrupos: () => Promise<void>;
  agregarGrupo: (grupo: Partial<Grupo>) => Promise<void>;
  actualizarGrupo: (id: number, actualizacion: Partial<Grupo>) => Promise<void>;
  eliminarGrupo: (id: number) => Promise<void>;
  obtenerGrupo: (id: number) => Partial<Grupo> | undefined;
}

const GruposContext = createContext<GruposContextData | undefined>(undefined);

interface GruposProviderProps {
  children: React.ReactNode;
}

export const GruposProvider: React.FC<GruposProviderProps> = ({ children }) => {
  const [grupos, setGrupos] = useState<Partial<Grupo>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGrupos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await obtenerGruposServicio();
      setGrupos(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "No se pudieron cargar los grupos";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  const agregarGrupo = useCallback(
    async (grupo: Partial<Grupo>) => {
      await agregarGrupoServicio(grupo);
      await loadGrupos();
    },
    [loadGrupos]
  );

  const actualizarGrupo = useCallback(
    async (id: number, actualizacion: Partial<Grupo>) => {
      await actualizarGrupoServicio(id, actualizacion);
      await loadGrupos();
    },
    [loadGrupos]
  );

  const eliminarGrupo = useCallback(
    async (id: number) => {
      await eliminarGrupoServicio(id);
      await loadGrupos();
    },
    [loadGrupos]
  );

  const obtenerGrupo = useCallback(
    (id: number) => {
      return grupos.find((grupo) => grupo.id === id);
    },
    [grupos]
  );

  const value: GruposContextData = {
    grupos,
    isLoading,
    error,
    reloadGrupos: loadGrupos,
    agregarGrupo,
    actualizarGrupo,
    eliminarGrupo,
    obtenerGrupo,
  };

  return <GruposContext.Provider value={value}>{children}</GruposContext.Provider>;
};

export const useGruposContext = (): GruposContextData => {
  const context = useContext(GruposContext);
  if (!context) {
    throw new Error("useGruposContext debe usarse dentro de GruposProvider");
  }
  return context;
};
