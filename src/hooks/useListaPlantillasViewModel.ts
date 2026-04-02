import { useState, useCallback, useMemo } from "react";
import { COLORS, Plantilla } from "../../types";
import { usePlantillas } from "../context/PlantillasContext";

export interface ListaPlantillasViewModel {
  plantillas: Plantilla[];
  plantillasFiltradas: Plantilla[];
  isLoading: boolean;
  searchQuery: string;
  filtroCategoria: string;
  setSearchQuery: (value: string) => void;
  setFiltroCategoria: (value: string) => void;
  getIconByCategoria: (cat: string) => string;
  getColorByCategoria: (cat: string) => string;
  getLabelByCategoria: (cat: string) => string;
  getCountByCategoria: (cat: string) => number;
  totalPlantillas: number;
  duplicarPlantilla: (plantilla: Plantilla) => Promise<void>;
  eliminarPlantilla: (id: number) => Promise<void>;
}

export const useListaPlantillasViewModel = (
  initialCategoria?: string
): ListaPlantillasViewModel => {
  const { plantillas, isLoading, crearPlantilla, eliminarPlantilla: borrar } = usePlantillas();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState(initialCategoria || "todos");

  const getIconByCategoria = useCallback((cat: string): string => {
    const icons: Record<string, string> = {
      examenes: "quiz",
      presentaciones: "play-circle-filled",
      mapas_mentales: "dashboard-customize",
      postales: "mail",
      reportes: "assessment",
      diapositivas: "slideshow",
    };
    return icons[cat] || "description";
  }, []);

  const getColorByCategoria = useCallback((cat: string): string => {
    const colors: Record<string, string> = {
      examenes: COLORS.warning,
      presentaciones: COLORS.primary,
      mapas_mentales: COLORS.purple,
      postales: COLORS.teal,
      reportes: COLORS.success,
      diapositivas: COLORS.primaryLight,
    };
    return colors[cat] || "#757575";
  }, []);

  const getLabelByCategoria = useCallback((cat: string): string => {
    const labels: Record<string, string> = {
      examenes: "Exámenes",
      presentaciones: "Presentaciones",
      mapas_mentales: "Mapas Mentales",
      postales: "Postales",
      reportes: "Reportes",
      diapositivas: "Diapositivas",
    };
    return labels[cat] || cat;
  }, []);

  const getCountByCategoria = useCallback(
    (cat: string): number => {
      if (cat === "todos") return plantillas.length;
      return plantillas.filter((p) => p.categoria === cat).length;
    },
    [plantillas]
  );

  const plantillasFiltradas = useMemo(() => {
    let result = plantillas;
    if (filtroCategoria !== "todos") {
      result = result.filter((p) => p.categoria === filtroCategoria);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q) ||
          r.descripcion?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result.sort(
      (a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime()
    );
  }, [plantillas, filtroCategoria, searchQuery]);

  const duplicarPlantilla = useCallback(
    async (plantilla: Plantilla) => {
      const { id, ...rest } = plantilla;
      await crearPlantilla({
        ...rest,
        nombre: `${plantilla.nombre} (copia)`,
        esDelSistema: false,
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
      });
    },
    [crearPlantilla]
  );

  const eliminarPlantilla = useCallback(
    async (id: number) => {
      await borrar(id);
    },
    [borrar]
  );

  return {
    plantillas,
    plantillasFiltradas,
    isLoading,
    searchQuery,
    filtroCategoria,
    setSearchQuery,
    setFiltroCategoria,
    getIconByCategoria,
    getColorByCategoria,
    getLabelByCategoria,
    getCountByCategoria,
    totalPlantillas: plantillas.length,
    duplicarPlantilla,
    eliminarPlantilla,
  };
};
