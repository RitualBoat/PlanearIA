import { useState, useCallback, useMemo } from "react";
import { COLORS, Recurso } from "../../types";
import { useRecursos } from "../context/RecursosContext";

export interface ListaRecursosViewModel {
  recursos: Recurso[];
  recursosFiltrados: Recurso[];
  isLoading: boolean;
  searchQuery: string;
  filtroTipo: string;
  setSearchQuery: (value: string) => void;
  setFiltroTipo: (value: string) => void;
  getIconByTipo: (tipo: string) => string;
  getColorByTipo: (tipo: string) => string;
  getLabelByTipo: (tipo: string) => string;
  getOrigenLabel: (origen: string) => string;
  getCountByTipo: (tipo: string) => number;
  totalRecursos: number;
  duplicarRecurso: (recurso: Recurso) => Promise<void>;
  eliminarRecurso: (id: number) => Promise<void>;
}

export const useListaRecursosViewModel = (initialFiltro?: string): ListaRecursosViewModel => {
  const { recursos, isLoading, crearRecurso, eliminarRecurso: borrar } = useRecursos();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroTipo, setFiltroTipo] = useState(initialFiltro || "todos");

  const getIconByTipo = useCallback((tipo: string): string => {
    const icons: Record<string, string> = {
      examen: "quiz",
      presentacion: "slideshow",
      mapa_mental: "account-tree",
      linea_tiempo: "timeline",
      documento: "description",
      audio: "headphones",
      video: "videocam",
      imagen: "image",
      enlace: "link",
    };
    return icons[tipo] || "description";
  }, []);

  const getColorByTipo = useCallback((tipo: string): string => {
    const colors: Record<string, string> = {
      examen: COLORS.warning,
      presentacion: COLORS.primaryLight,
      mapa_mental: COLORS.purple,
      linea_tiempo: COLORS.success,
      documento: COLORS.textSecondary,
      audio: COLORS.teal,
      video: COLORS.error,
    };
    return colors[tipo] || "#757575";
  }, []);

  const getLabelByTipo = useCallback((tipo: string): string => {
    const labels: Record<string, string> = {
      examen: "EXAMEN",
      presentacion: "PRESENTACIÓN",
      mapa_mental: "MAPA MENTAL",
      linea_tiempo: "LÍNEA DE TIEMPO",
      documento: "DOCUMENTO",
      audio: "AUDIO",
      video: "VIDEO",
      imagen: "IMAGEN",
      enlace: "ENLACE",
    };
    return labels[tipo] || tipo.toUpperCase();
  }, []);

  const getOrigenLabel = useCallback((origen: string): string => {
    const labels: Record<string, string> = {
      manual: "MANUAL",
      ia: "IA",
      plantilla: "PLANTILLA",
    };
    return labels[origen] || origen.toUpperCase();
  }, []);

  const getCountByTipo = useCallback(
    (tipo: string): number => {
      if (tipo === "todos") return recursos.length;
      return recursos.filter((r) => r.tipo === tipo).length;
    },
    [recursos]
  );

  const recursosFiltrados = useMemo(() => {
    let result = recursos;
    if (filtroTipo !== "todos") {
      result = result.filter((r) => r.tipo === filtroTipo);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.titulo.toLowerCase().includes(q) ||
          r.descripcion?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result.sort(
      (a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime()
    );
  }, [recursos, filtroTipo, searchQuery]);

  const duplicarRecurso = useCallback(
    async (recurso: Recurso) => {
      const { id, ...rest } = recurso;
      await crearRecurso({
        ...rest,
        titulo: `${recurso.titulo} (copia)`,
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
      });
    },
    [crearRecurso]
  );

  const eliminarRecurso = useCallback(
    async (id: number) => {
      await borrar(id);
    },
    [borrar]
  );

  return {
    recursos,
    recursosFiltrados,
    isLoading,
    searchQuery,
    filtroTipo,
    setSearchQuery,
    setFiltroTipo,
    getIconByTipo,
    getColorByTipo,
    getLabelByTipo,
    getOrigenLabel,
    getCountByTipo,
    totalRecursos: recursos.length,
    duplicarRecurso,
    eliminarRecurso,
  };
};
