import { useState, useCallback } from "react";
import { COLORS } from "../../types";

export interface ListaRecursosViewModel {
  searchQuery: string;
  filtroTipo: string;
  setSearchQuery: (value: string) => void;
  setFiltroTipo: (value: string) => void;
  getIconByTipo: (tipo: string) => string;
  getColorByTipo: (tipo: string) => string;
}

export const useListaRecursosViewModel = (): ListaRecursosViewModel => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const getIconByTipo = useCallback((tipo: string): string => {
    const icons: Record<string, string> = {
      examen: "quiz",
      presentacion: "slideshow",
      mapa_mental: "account-tree",
      linea_tiempo: "timeline",
    };
    return icons[tipo] || "description";
  }, []);

  const getColorByTipo = useCallback((tipo: string): string => {
    const colors: Record<string, string> = {
      examen: COLORS.success,
      presentacion: COLORS.primaryLight,
      mapa_mental: COLORS.warning,
      linea_tiempo: COLORS.purple,
    };
    return colors[tipo] || "#757575";
  }, []);

  return {
    searchQuery,
    filtroTipo,
    setSearchQuery,
    setFiltroTipo,
    getIconByTipo,
    getColorByTipo,
  };
};
