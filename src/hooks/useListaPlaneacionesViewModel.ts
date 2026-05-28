import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { usePlaneaciones } from "../sync/providers/SyncProvider";
import {
  NivelAcademico,
  type FiltrosPlaneacionV2,
  type PlaneacionDocumento,
  type Sesion,
} from "../../types/planeacionV2";
import { NivelAcademico as NivelAcademicoLegacy } from "../../types/planeacionLegacy";

type Nav = StackNavigationProp<RootStackParamList, "ListaPlaneaciones">;

type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export interface ListaPlaneacionesViewModel {
  documentos: PlaneacionDocumento[];
  documentosFiltrados: PlaneacionDocumento[];

  // Compatibilidad temporal con consumo legacy
  planeaciones: PlaneacionDocumento[];
  planeacionesFiltradas: PlaneacionDocumento[];

  showFiltros: boolean;
  menuVisible: string | null;
  searchQuery: string;
  filtroNivel: NivelAcademico | undefined;
  filtroAsignatura: string;
  filtroGrado: string;
  filtroFechaInicio: string;
  filtroFechaFin: string;
  syncStatus: SyncStatus;
  pendingCount: number;
  isOnline: boolean;
  setShowFiltros: (value: boolean) => void;
  setMenuVisible: (value: string | null) => void;
  setSearchQuery: (value: string) => void;
  setFiltroNivel: (value: NivelAcademico | undefined) => void;
  setFiltroAsignatura: (value: string) => void;
  setFiltroGrado: (value: string) => void;
  setFiltroFechaInicio: (value: string) => void;
  setFiltroFechaFin: (value: string) => void;
  limpiarFiltros: () => void;
  aplicarFiltros: () => void;
  getColorNivel: (nivel: NivelAcademico) => string;
  getTextoNivel: (nivel: NivelAcademico) => string;
  formatFecha: (fecha: string) => string;
  formatearFecha: (fecha: string) => string;
  handleEditar: (doc: PlaneacionDocumento) => void;
  handleClonar: (id: string) => Promise<void>;
  handleEliminar: (id: string) => Promise<void>;
  handleExportar: (id: string) => void;
  handleCrearNueva: () => void;
}

const mapLegacyNivelToV2 = (nivel: unknown): NivelAcademico => {
  if (nivel === NivelAcademicoLegacy.SECUNDARIA) return NivelAcademico.SECUNDARIA;
  if (nivel === NivelAcademicoLegacy.PREPARATORIA) return NivelAcademico.PREPARATORIA;
  if (nivel === NivelAcademicoLegacy.UNIVERSIDAD) return NivelAcademico.UNIVERSIDAD;
  return NivelAcademico.PRIMARIA;
};

const buildSesionFromLegacy = (legacy: any): Sesion => {
  const actividades = Array.isArray(legacy?.actividades) ? legacy.actividades : [];
  const byType = new Map<string, any>();
  actividades.forEach((item: any) => {
    if (item?.tipo) byType.set(item.tipo, item);
  });

  return {
    id: `sesion_${legacy?.id || Date.now()}_1`,
    numero: 1,
    tipo: "regular",
    inicio: byType.get("inicio")?.descripcion || "",
    desarrollo: byType.get("desarrollo")?.descripcion || "",
    cierre: byType.get("cierre")?.descripcion || "",
    tarea: "",
  };
};

const fromLegacyPlaneacion = (legacy: any): PlaneacionDocumento => {
  const fecha =
    typeof legacy?.fecha === "string" ? legacy.fecha : new Date().toISOString().slice(0, 10);

  return {
    id: String(legacy?.id || `legacy_${Date.now()}`),
    version: 2,
    userId: "legacy",
    nivelAcademico: mapLegacyNivelToV2(legacy?.nivelAcademico),
    infoInstitucional: {
      institucion: "",
      cicloEscolar: "",
      subsistema: "",
      lugar: "",
    },
    datosGenerales: {
      maestro: "",
      asignatura: String(legacy?.asignatura || ""),
      fechaInicio: fecha,
      fechaFin: fecha,
      semanas: [],
      grado: String(legacy?.grado || ""),
      grupos: legacy?.grupo ? [String(legacy.grupo)] : [],
      trimestre: undefined,
    },
    elementosCurriculares: {
      proposito: Array.isArray(legacy?.aprendizajesEsperados)
        ? legacy.aprendizajesEsperados.join("\n")
        : "",
      producto: Array.isArray(legacy?.evidencias) ? legacy.evidencias.join("\n") : "",
      contenido: String(legacy?.unidadTematica || ""),
      pda: String(legacy?.temaSesion || ""),
      campoFormativo: "",
      ejeArticulador: "",
      rasgosPerfilEgreso: [],
      instrumentoEvaluacion: String(legacy?.evaluacion || ""),
    },
    sesiones: [buildSesionFromLegacy(legacy)],
    evaluacionInicial: undefined,
    evaluacionFinal: undefined,
    observaciones:
      typeof legacy?.observaciones === "string" && legacy.observaciones.trim().length > 0
        ? [{ texto: legacy.observaciones, categoria: "general" }]
        : [{ texto: "", categoria: "general" }],
    firmas: [{ rol: "Docente", nombre: "" }],
    contenidoRaw: "",
    plantillaId: undefined,
    camposNivel: {},
    fechaCreacion: String(legacy?.fechaCreacion || new Date().toISOString()),
    fechaModificacion: String(legacy?.fechaModificacion || new Date().toISOString()),
    _deleted: false,
  };
};

const normalizeDocs = (ctx: any): PlaneacionDocumento[] => {
  if (Array.isArray(ctx?.documentos)) return ctx.documentos as PlaneacionDocumento[];
  if (Array.isArray(ctx?.planeaciones)) {
    return (ctx.planeaciones as any[]).map(fromLegacyPlaneacion);
  }
  return [];
};

const includesNormalized = (value: string, query: string): boolean => {
  return value.toLowerCase().includes(query.toLowerCase());
};

const localSearch = (docs: PlaneacionDocumento[], query: string): PlaneacionDocumento[] => {
  const q = query.trim().toLowerCase();
  if (!q) return docs;

  return docs.filter((doc) => {
    const values = [
      doc.datosGenerales.asignatura,
      doc.datosGenerales.grado,
      doc.datosGenerales.maestro,
      doc.elementosCurriculares.contenido,
      doc.elementosCurriculares.pda,
      doc.elementosCurriculares.proposito,
      ...doc.observaciones.map((obs) => obs.texto),
    ];
    return values.some((value) => includesNormalized(String(value || ""), q));
  });
};

const localFilter = (
  docs: PlaneacionDocumento[],
  filtros: FiltrosPlaneacionV2
): PlaneacionDocumento[] => {
  return docs.filter((doc) => {
    if (filtros.nivelAcademico && doc.nivelAcademico !== filtros.nivelAcademico) return false;
    if (
      filtros.asignatura &&
      !includesNormalized(doc.datosGenerales.asignatura || "", filtros.asignatura)
    )
      return false;
    if (filtros.grado && !includesNormalized(doc.datosGenerales.grado || "", filtros.grado))
      return false;
    if (filtros.maestro && !includesNormalized(doc.datosGenerales.maestro || "", filtros.maestro))
      return false;
    if (filtros.fechaInicio && doc.datosGenerales.fechaInicio < filtros.fechaInicio) return false;
    if (filtros.fechaFin && doc.datosGenerales.fechaFin > filtros.fechaFin) return false;
    return true;
  });
};

export const useListaPlaneacionesViewModel = (): ListaPlaneacionesViewModel => {
  const navigation = useNavigation<Nav>();
  const context = usePlaneaciones() as any;

  const documentos = useMemo(() => normalizeDocs(context), [context]);

  const [showFiltros, setShowFiltros] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<NivelAcademico | undefined>(undefined);
  const [filtroAsignatura, setFiltroAsignatura] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosPlaneacionV2>({});

  const showMessage = useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const buscarFn = typeof context?.buscar === "function" ? context.buscar : undefined;
  const filtrarFn =
    typeof context?.filtrarDocumentos === "function" ? context.filtrarDocumentos : undefined;

  const docsByText = useMemo(() => {
    if (!searchQuery.trim()) return documentos;
    if (buscarFn) return buscarFn(searchQuery.trim()) as PlaneacionDocumento[];
    return localSearch(documentos, searchQuery.trim());
  }, [buscarFn, documentos, searchQuery]);

  const documentosFiltrados = useMemo(() => {
    const base = filtrarFn
      ? (filtrarFn({
          ...filtrosAplicados,
          busqueda: undefined,
        }) as PlaneacionDocumento[])
      : localFilter(documentos, {
          ...filtrosAplicados,
          busqueda: undefined,
        });

    const ids = new Set(base.map((doc) => doc.id));
    return docsByText.filter((doc) => ids.has(doc.id));
  }, [docsByText, documentos, filtrarFn, filtrosAplicados]);

  const aplicarFiltros = useCallback(() => {
    setFiltrosAplicados({
      nivelAcademico: filtroNivel,
      asignatura: filtroAsignatura || undefined,
      grado: filtroGrado || undefined,
      fechaInicio: filtroFechaInicio || undefined,
      fechaFin: filtroFechaFin || undefined,
    });
    setShowFiltros(false);
  }, [filtroAsignatura, filtroFechaFin, filtroFechaInicio, filtroGrado, filtroNivel]);

  const limpiarFiltros = useCallback(() => {
    setFiltroNivel(undefined);
    setFiltroAsignatura("");
    setFiltroGrado("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    setSearchQuery("");
    setFiltrosAplicados({});
  }, []);

  const getColorNivel = useCallback((nivel: NivelAcademico): string => {
    if (nivel === NivelAcademico.PRIMARIA) return "#0ea5e9";
    if (nivel === NivelAcademico.SECUNDARIA) return "#2563eb";
    if (nivel === NivelAcademico.PREPARATORIA) return "#f59e0b";
    return "#7c3aed";
  }, []);

  const getTextoNivel = useCallback((nivel: NivelAcademico): string => {
    if (nivel === NivelAcademico.PRIMARIA) return "Primaria";
    if (nivel === NivelAcademico.SECUNDARIA) return "Secundaria";
    if (nivel === NivelAcademico.PREPARATORIA) return "Preparatoria";
    return "Universidad";
  }, []);

  const formatFecha = useCallback((fecha: string): string => {
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "Sin fecha";
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const handleEditar = useCallback(
    (doc: PlaneacionDocumento) => {
      setMenuVisible(null);
      navigation.navigate("DocEditor", {
        modo: "editar",
        planeacionId: doc.id,
        nivelAcademico: doc.nivelAcademico,
      });
    },
    [navigation]
  );

  const cloneFn =
    typeof context?.clonar === "function"
      ? context.clonar
      : typeof context?.clonarPlaneacion === "function"
        ? context.clonarPlaneacion
        : undefined;

  const deleteFn =
    typeof context?.eliminar === "function"
      ? context.eliminar
      : typeof context?.eliminarPlaneacion === "function"
        ? context.eliminarPlaneacion
        : undefined;

  const handleClonar = useCallback(
    async (id: string) => {
      setMenuVisible(null);
      try {
        if (!cloneFn) throw new Error("No hay accion de clonado disponible.");
        await cloneFn(id);
        showMessage("Planeaciones", "Planeacion clonada correctamente.");
      } catch {
        showMessage("Planeaciones", "No se pudo clonar la planeacion.");
      }
    },
    [cloneFn, showMessage]
  );

  const handleEliminar = useCallback(
    async (id: string) => {
      setMenuVisible(null);

      const runDelete = async () => {
        try {
          if (!deleteFn) throw new Error("No hay accion de eliminacion disponible.");
          await deleteFn(id);
          showMessage("Planeaciones", "Planeacion eliminada.");
        } catch {
          showMessage("Planeaciones", "No se pudo eliminar la planeacion.");
        }
      };

      if (Platform.OS === "web") {
        if (window.confirm("Se eliminara esta planeacion. Esta accion no se puede deshacer.")) {
          await runDelete();
        }
      } else {
        Alert.alert("Eliminar planeacion", "Esta accion no se puede deshacer.", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              void runDelete();
            },
          },
        ]);
      }
    },
    [deleteFn, showMessage]
  );

  const handleExportar = useCallback(
    (id: string) => {
      setMenuVisible(null);
      navigation.navigate("ExportarPlaneacion", { planeacionId: id });
    },
    [navigation]
  );

  const handleCrearNueva = useCallback(() => {
    navigation.navigate("CrearPlaneacion");
  }, [navigation]);

  const syncStatus: SyncStatus = (context?.syncStatus || "idle") as SyncStatus;
  const pendingCount = typeof context?.pendingCount === "number" ? context.pendingCount : 0;
  const isOnline = context?.isOnline !== false;

  return {
    documentos,
    documentosFiltrados,
    planeaciones: documentos,
    planeacionesFiltradas: documentosFiltrados,
    showFiltros,
    menuVisible,
    searchQuery,
    filtroNivel,
    filtroAsignatura,
    filtroGrado,
    filtroFechaInicio,
    filtroFechaFin,
    syncStatus,
    pendingCount,
    isOnline,
    setShowFiltros,
    setMenuVisible,
    setSearchQuery,
    setFiltroNivel,
    setFiltroAsignatura,
    setFiltroGrado,
    setFiltroFechaInicio,
    setFiltroFechaFin,
    limpiarFiltros,
    aplicarFiltros,
    getColorNivel,
    getTextoNivel,
    formatFecha,
    formatearFecha: formatFecha,
    handleEditar,
    handleClonar,
    handleEliminar,
    handleExportar,
    handleCrearNueva,
  };
};

export default useListaPlaneacionesViewModel;
