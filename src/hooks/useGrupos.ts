/**
 * Hook personalizado para gestión de grupos
 * ViewModel que maneja el estado y la lógica de negocio
 */
import { useState, useEffect, useCallback } from "react";
import { Grupo } from "../../types";
import {
  obtenerGrupos,
  filtrarGruposPorBusqueda,
  agregarGrupo,
  actualizarGrupo,
  eliminarGrupo,
} from "../services/gruposService";

/**
 * Estados posibles del hook
 */
export type GruposStatus = "idle" | "loading" | "success" | "error";

/**
 * Interfaz del resultado del hook
 */
export interface UseGruposResult {
  // Estado
  grupos: Partial<Grupo>[];
  gruposFiltrados: Partial<Grupo>[];
  status: GruposStatus;
  error: string | null;
  isLoading: boolean;

  // Búsqueda y filtros
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Acciones
  recargarGrupos: () => Promise<void>;
  agregarNuevoGrupo: (grupo: Partial<Grupo>) => Promise<void>;
  actualizarGrupoExistente: (
    id: number,
    actualizacion: Partial<Grupo>
  ) => Promise<void>;
  eliminarGrupoExistente: (id: number) => Promise<void>;

  // Utilidades
  conteoGrupos: number;
  conteoGruposFiltrados: number;
}

/**
 * Hook personalizado para manejar grupos
 * Separa la lógica de negocio de la UI
 */
export const useGrupos = (): UseGruposResult => {
  // Estado local
  const [grupos, setGrupos] = useState<Partial<Grupo>[]>([]);
  const [gruposFiltrados, setGruposFiltrados] = useState<Partial<Grupo>[]>([]);
  const [status, setStatus] = useState<GruposStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  /**
   * Carga inicial de grupos
   */
  useEffect(() => {
    cargarGrupos();
  }, []);

  /**
   * Aplica filtros cuando cambia la búsqueda o los grupos
   */
  useEffect(() => {
    aplicarFiltros();
  }, [searchQuery, grupos]);

  /**
   * Carga los grupos desde el servicio
   */
  const cargarGrupos = async (): Promise<void> => {
    try {
      setStatus("loading");
      setError(null);

      const gruposCargados = await obtenerGrupos();
      setGrupos(gruposCargados);

      setStatus("success");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
      setStatus("error");
      console.error("[grupos] Error loading:", err);
    }
  };

  /**
   * Recarga los grupos (útil para refrescar después de cambios)
   */
  const recargarGrupos = useCallback(async (): Promise<void> => {
    await cargarGrupos();
  }, []);

  /**
   * Aplica los filtros de búsqueda
   */
  const aplicarFiltros = (): void => {
    const filtrados = filtrarGruposPorBusqueda(grupos, searchQuery);
    setGruposFiltrados(filtrados);
  };

  /**
   * Agrega un nuevo grupo
   */
  const agregarNuevoGrupo = useCallback(
    async (grupo: Partial<Grupo>): Promise<void> => {
      try {
        setStatus("loading");
        await agregarGrupo(grupo);
        await recargarGrupos();
        setStatus("success");
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error al agregar grupo";
        setError(errorMsg);
        setStatus("error");
        throw err;
      }
    },
    [recargarGrupos]
  );

  /**
   * Actualiza un grupo existente
   */
  const actualizarGrupoExistente = useCallback(
    async (id: number, actualizacion: Partial<Grupo>): Promise<void> => {
      try {
        setStatus("loading");
        await actualizarGrupo(id, actualizacion);
        await recargarGrupos();
        setStatus("success");
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error al actualizar grupo";
        setError(errorMsg);
        setStatus("error");
        throw err;
      }
    },
    [recargarGrupos]
  );

  /**
   * Elimina un grupo
   */
  const eliminarGrupoExistente = useCallback(
    async (id: number): Promise<void> => {
      try {
        setStatus("loading");
        await eliminarGrupo(id);
        await recargarGrupos();
        setStatus("success");
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error al eliminar grupo";
        setError(errorMsg);
        setStatus("error");
        throw err;
      }
    },
    [recargarGrupos]
  );

  // Retorna la interfaz pública del hook
  return {
    // Estado
    grupos,
    gruposFiltrados,
    status,
    error,
    isLoading: status === "loading",

    // Búsqueda
    searchQuery,
    setSearchQuery,

    // Acciones
    recargarGrupos,
    agregarNuevoGrupo,
    actualizarGrupoExistente,
    eliminarGrupoExistente,

    // Utilidades computadas
    conteoGrupos: grupos.length,
    conteoGruposFiltrados: gruposFiltrados.length,
  };
};
