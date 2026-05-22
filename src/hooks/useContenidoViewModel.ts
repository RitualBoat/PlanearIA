import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { usePlaneaciones } from "../sync/providers/SyncProvider";
import { useRecursos } from "../context/RecursosContext";
import { useEntregables } from "../context/EntregablesContext";
import { usePlantillas } from "../context/PlantillasContext";
import type { Recurso, Plantilla, Tarea } from "../../types";
import type { Planeacion } from "../../types/planeacion";

// ─── Tipos ───

export type CategoriaContenido =
  | "todo"
  | "planeaciones"
  | "recursos"
  | "entregables"
  | "plantillas";
export type FiltroTipo = string; // "examen" | "presentacion" | "mapa_mental" | etc.
export type FiltroFecha = "hoy" | "semana" | "mes" | "anio" | "";
export type FiltroEstado = "completo" | "borrador" | "";

export interface ContenidoItem {
  id: string;
  tipo: CategoriaContenido;
  titulo: string;
  subtitulo: string;
  tipoRecurso?: string;
  fechaModificacion: string;
  esBorrador: boolean;
  progreso?: number;
  usosCount?: number;
  raw: Planeacion | Recurso | Tarea | Plantilla;
}

export interface ContenidoViewModel {
  // Data
  items: ContenidoItem[];
  borradores: ContenidoItem[];
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
  isOffline: boolean;
  retryLoad: () => void;

  // Filters
  categoriaActiva: CategoriaContenido;
  setCategoriaActiva: (cat: CategoriaContenido) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filtroTipo: FiltroTipo;
  setFiltroTipo: (t: FiltroTipo) => void;
  filtroFecha: FiltroFecha;
  setFiltroFecha: (f: FiltroFecha) => void;
  filtroEstado: FiltroEstado;
  setFiltroEstado: (e: FiltroEstado) => void;
  filtrosActivos: number;
  limpiarFiltros: () => void;

  // Counts per category
  conteos: Record<CategoriaContenido, number>;

  // Actions
  eliminarItem: (item: ContenidoItem) => void;
  duplicarItem: (item: ContenidoItem) => void;
  handleShareFeed?: (item: ContenidoItem) => void;
  handleSendChat?: (item: ContenidoItem) => void;
}

// ─── Helpers ───

const toISOString = (d: Date | string | undefined): string => {
  if (!d) return "";
  if (typeof d === "string") return d;
  try {
    return d.toISOString();
  } catch {
    return "";
  }
};

const calcularProgreso = (p: Planeacion): number => {
  let filled = 0;
  const total = 6;
  if (p.asignatura) filled++;
  if (p.temaSesion) filled++;
  if (p.aprendizajesEsperados?.length > 0) filled++;
  if (p.actividades?.length > 0) filled++;
  if (p.evaluacion) filled++;
  if (p.recursos?.length > 0) filled++;
  return Math.round((filled / total) * 100);
};

const esBorradorPlaneacion = (p: Planeacion): boolean => {
  return calcularProgreso(p) < 100;
};

const matchFecha = (fecha: string, filtro: FiltroFecha): boolean => {
  if (!filtro) return true;
  const d = new Date(fecha);
  const now = new Date();
  switch (filtro) {
    case "hoy": {
      return d.toDateString() === now.toDateString();
    }
    case "semana": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    case "mes": {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return d >= monthAgo;
    }
    case "anio": {
      return d.getFullYear() === now.getFullYear();
    }
    default:
      return true;
  }
};

// ─── Hook ───

export const useContenidoViewModel = (): ContenidoViewModel => {
  const { planeaciones, isLoading: loadingPlan } = usePlaneaciones();
  const { recursos, isLoading: loadingRec } = useRecursos();
  const { entregables, isLoading: loadingEnt } = useEntregables();
  const { plantillas, isLoading: loadingPla } = usePlantillas();

  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaContenido>("todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("");
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("");

  const isLoading = loadingPlan || loadingRec || loadingEnt || loadingPla;

  const [isOffline, setIsOffline] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  const retryLoad = useCallback(() => {
    setIsError(false);
    setRetryKey((k) => k + 1);
  }, []);

  // Normalize all content into ContenidoItem[]
  const allItems = useMemo<ContenidoItem[]>(() => {
    const items: ContenidoItem[] = [];

    // Planeaciones
    for (const p of planeaciones) {
      const progreso = calcularProgreso(p);
      items.push({
        id: `plan-${p.id}`,
        tipo: "planeaciones",
        titulo: p.temaSesion || p.unidadTematica || "Planeación sin título",
        subtitulo: `${p.asignatura || "Sin materia"} · ${p.grado || ""} ${p.grupo || ""}`.trim(),
        fechaModificacion: p.fechaModificacion || p.fechaCreacion || "",
        esBorrador: progreso < 100,
        progreso,
        raw: p,
      });
    }

    // Recursos
    for (const r of recursos) {
      items.push({
        id: `rec-${r.id}`,
        tipo: "recursos",
        titulo: r.titulo || "Recurso sin título",
        subtitulo: getLabelByTipoRecurso(r.tipo),
        tipoRecurso: r.tipo,
        fechaModificacion: toISOString(r.fechaModificacion),
        esBorrador: false,
        raw: r,
      });
    }

    // Entregables
    for (const e of entregables) {
      items.push({
        id: `ent-${e.id}`,
        tipo: "entregables",
        titulo: e.titulo || "Entregable sin título",
        subtitulo: `${getLabelByTipoEntregable(e.tipo)} · ${e.estado === "asignada" ? "Activa" : e.estado === "en_progreso" ? "En progreso" : "Finalizada"}`,
        tipoRecurso: e.tipo,
        fechaModificacion: toISOString(e.fechaAsignacion),
        esBorrador: false,
        raw: e,
      });
    }

    // Plantillas
    for (const pl of plantillas) {
      items.push({
        id: `pla-${pl.id}`,
        tipo: "plantillas",
        titulo: pl.nombre || "Plantilla sin título",
        subtitulo: `${getLabelByTipoRecurso(pl.tipo)} · Usada ${pl.usosCount} veces`,
        tipoRecurso: pl.tipo,
        fechaModificacion: toISOString(pl.fechaModificacion),
        esBorrador: false,
        usosCount: pl.usosCount,
        raw: pl,
      });
    }

    // Sort by date (most recent first)
    items.sort((a, b) => {
      const da = new Date(a.fechaModificacion || 0).getTime();
      const db = new Date(b.fechaModificacion || 0).getTime();
      return db - da;
    });

    return items;
  }, [planeaciones, recursos, entregables, plantillas]);

  // Counts
  const conteos = useMemo<Record<CategoriaContenido, number>>(
    () => ({
      todo: allItems.length,
      planeaciones: allItems.filter((i) => i.tipo === "planeaciones").length,
      recursos: allItems.filter((i) => i.tipo === "recursos").length,
      entregables: allItems.filter((i) => i.tipo === "entregables").length,
      plantillas: allItems.filter((i) => i.tipo === "plantillas").length,
    }),
    [allItems]
  );

  // Filter items
  const items = useMemo<ContenidoItem[]>(() => {
    let filtered = allItems;

    // Category filter
    if (categoriaActiva !== "todo") {
      filtered = filtered.filter((i) => i.tipo === categoriaActiva);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (i) => i.titulo.toLowerCase().includes(q) || i.subtitulo.toLowerCase().includes(q)
      );
    }

    // Type filter (examen, presentacion, etc.)
    if (filtroTipo) {
      filtered = filtered.filter((i) => {
        if (i.tipo === "planeaciones") return false; // planeaciones don't have tipoRecurso
        return i.tipoRecurso === filtroTipo;
      });
    }

    // Date filter
    if (filtroFecha) {
      filtered = filtered.filter((i) => matchFecha(i.fechaModificacion, filtroFecha));
    }

    // Status filter
    if (filtroEstado === "borrador") {
      filtered = filtered.filter((i) => i.esBorrador);
    } else if (filtroEstado === "completo") {
      filtered = filtered.filter((i) => !i.esBorrador);
    }

    return filtered;
  }, [allItems, categoriaActiva, searchQuery, filtroTipo, filtroFecha, filtroEstado]);

  // Borradores (incomplete items, max 6)
  const borradores = useMemo<ContenidoItem[]>(
    () => allItems.filter((i) => i.esBorrador).slice(0, 6),
    [allItems]
  );

  // Active filters count
  const filtrosActivos = useMemo(() => {
    let count = 0;
    if (filtroTipo) count++;
    if (filtroFecha) count++;
    if (filtroEstado) count++;
    return count;
  }, [filtroTipo, filtroFecha, filtroEstado]);

  const limpiarFiltros = useCallback(() => {
    setFiltroTipo("");
    setFiltroFecha("");
    setFiltroEstado("");
  }, []);

  // Actions
  const { eliminarPlaneacion } = usePlaneaciones();
  const { eliminarRecurso } = useRecursos();
  const { eliminarEntregable } = useEntregables();
  const { eliminarPlantilla } = usePlantillas();

  const eliminarItem = useCallback(
    (item: ContenidoItem) => {
      const nombre = item.titulo;
      Alert.alert(
        "¿Eliminar este elemento?",
        `Se eliminará "${nombre}". Esta acción no se puede deshacer.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                if (item.tipo === "planeaciones") {
                  const rawId = (item.raw as Planeacion).id;
                  await eliminarPlaneacion(rawId);
                } else if (item.tipo === "recursos") {
                  await eliminarRecurso((item.raw as Recurso).id as number);
                } else if (item.tipo === "entregables") {
                  await eliminarEntregable((item.raw as Tarea).id);
                } else if (item.tipo === "plantillas") {
                  await eliminarPlantilla((item.raw as Plantilla).id as number);
                }
              } catch {
                Alert.alert("Error", "No se pudo eliminar el elemento. Intenta de nuevo.");
              }
            },
          },
        ]
      );
    },
    [eliminarPlaneacion, eliminarRecurso, eliminarEntregable, eliminarPlantilla]
  );

  const { agregarPlaneacion, clonarPlaneacion } = usePlaneaciones();
  const { crearRecurso } = useRecursos();
  const { crearPlantilla } = usePlantillas();

  const duplicarItem = useCallback(
    (item: ContenidoItem) => {
      void (async () => {
        try {
          if (item.tipo === "planeaciones") {
            await clonarPlaneacion((item.raw as Planeacion).id);
          } else if (item.tipo === "recursos") {
            const r = item.raw as Recurso;
            const { id, ...rest } = r;
            await crearRecurso({ ...rest, titulo: `${r.titulo} (copia)` });
          } else if (item.tipo === "plantillas") {
            const p = item.raw as Plantilla;
            const { id, ...rest } = p;
            await crearPlantilla({ ...rest, nombre: `${p.nombre} (copia)`, usosCount: 0 });
          }
          Alert.alert("Listo", "Elemento duplicado correctamente.");
        } catch {
          Alert.alert("Error", "No se pudo duplicar el elemento.");
        }
      })();
    },
    [clonarPlaneacion, crearRecurso, crearPlantilla]
  );

  return {
    items,
    borradores,
    totalItems: allItems.length,
    isLoading,
    isError,
    isOffline,
    retryLoad,
    categoriaActiva,
    setCategoriaActiva,
    searchQuery,
    setSearchQuery,
    filtroTipo,
    setFiltroTipo,
    filtroFecha,
    setFiltroFecha,
    filtroEstado,
    setFiltroEstado,
    filtrosActivos,
    limpiarFiltros,
    conteos,
    eliminarItem,
    duplicarItem,
  };
};

// ─── Label helpers ───

const getLabelByTipoRecurso = (tipo: string): string => {
  const labels: Record<string, string> = {
    examen: "Examen",
    presentacion: "Presentación",
    mapa_mental: "Mapa Mental",
    linea_tiempo: "Línea de Tiempo",
    video: "Video",
    documento: "Documento",
    imagen: "Imagen",
    audio: "Audio",
    enlace: "Enlace",
    postal: "Postal",
    reporte: "Reporte",
    otro: "Otro",
  };
  return labels[tipo] || tipo;
};

const getLabelByTipoEntregable = (tipo: string): string => {
  const labels: Record<string, string> = {
    tarea: "Tarea",
    examen: "Examen",
    proyecto: "Proyecto",
    investigacion: "Investigación",
  };
  return labels[tipo] || tipo;
};

export { getLabelByTipoRecurso, getLabelByTipoEntregable };
