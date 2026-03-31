/**
 * Hook personalizado para gestión de grupos
 * ViewModel que maneja el estado y la lógica de negocio
 */
import { useState, useEffect, useCallback } from "react";
import { Grupo } from "../../types";
import { filtrarGruposPorBusqueda } from "../services/gruposService";
import { useGruposContext } from "../context/GruposContext";
import type { GrupoSyncStatus } from "../services/gruposService";

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
  syncStatus: GrupoSyncStatus;
  pendingSyncCount: number;
  isOnline: boolean;

  // Búsqueda y filtros
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Acciones
  recargarGrupos: () => Promise<void>;
  sincronizarGrupos: () => Promise<void>;
  agregarNuevoGrupo: (grupo: Partial<Grupo>) => Promise<void>;
  actualizarGrupoExistente: (id: number, actualizacion: Partial<Grupo>) => Promise<void>;
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
  const {
    grupos,
    isLoading,
    error,
    syncStatus,
    pendingSyncCount,
    isOnline,
    reloadGrupos,
    syncGrupos,
    agregarGrupo,
    actualizarGrupo,
    eliminarGrupo,
  } = useGruposContext();

  // Estado local
  const [gruposFiltrados, setGruposFiltrados] = useState<Partial<Grupo>[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const status: GruposStatus = isLoading ? "loading" : error ? "error" : "success";

  /**
   * Aplica filtros cuando cambia la búsqueda o los grupos
   */
  useEffect(() => {
    aplicarFiltros();
  }, [searchQuery, grupos]);

  /**
   * Recarga los grupos (útil para refrescar después de cambios)
   */
  const recargarGrupos = useCallback(async (): Promise<void> => {
    await reloadGrupos();
  }, [reloadGrupos]);

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
        await agregarGrupo(grupo);
        await recargarGrupos();
      } catch (err) {
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
        await actualizarGrupo(id, actualizacion);
        await recargarGrupos();
      } catch (err) {
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
        await eliminarGrupo(id);
        await recargarGrupos();
      } catch (err) {
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
    isLoading,
    syncStatus,
    pendingSyncCount,
    isOnline,

    // Búsqueda
    searchQuery,
    setSearchQuery,

    // Acciones
    recargarGrupos,
    sincronizarGrupos: syncGrupos,
    agregarNuevoGrupo,
    actualizarGrupoExistente,
    eliminarGrupoExistente,

    // Utilidades computadas
    conteoGrupos: grupos.length,
    conteoGruposFiltrados: gruposFiltrados.length,
  };
};
