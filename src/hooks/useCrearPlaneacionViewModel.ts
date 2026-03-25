import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { API_CONFIG } from "../sync/config/apiConfig";
import {
  NivelAcademico,
  Planeacion,
  PlaneacionPrimaria,
  PlaneacionSecundaria,
  PlaneacionPreparatoria,
  PlaneacionUniversidad,
} from "../../types/planeacion";

type Nav = StackNavigationProp<RootStackParamList, "CrearPlaneacion">;

export interface NivelOption {
  nivel: NivelAcademico;
  titulo: string;
  descripcion: string;
  icon: string;
  color: string;
}

export interface CrearPlaneacionViewModel {
  showTemplateModal: boolean;
  showNivelModal: boolean;
  promptIA: string;
  nivelIA: NivelAcademico;
  isGeneratingIA: boolean;
  iaError: string;
  planeacionGeneradaIA: Planeacion | null;
  nivelesAcademicos: NivelOption[];
  setPromptIA: (value: string) => void;
  setNivelIA: (value: NivelAcademico) => void;
  handleCrearDesdeCero: () => void;
  handleSeleccionarNivel: (nivel: NivelAcademico) => void;
  handleCloseNivelModal: () => void;
  handleGenerarPlantilla: () => void;
  handleCloseModal: () => void;
  handleGenerarConIA: () => Promise<void>;
}

export const useCrearPlaneacionViewModel = (): CrearPlaneacionViewModel => {
  const navigation = useNavigation<Nav>();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [promptIA, setPromptIA] = useState("");
  const [nivelIA, setNivelIA] = useState<NivelAcademico>(NivelAcademico.PRIMARIA);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [iaError, setIaError] = useState("");
  const [planeacionGeneradaIA, setPlaneacionGeneradaIA] = useState<Planeacion | null>(null);

  const nivelesAcademicos: NivelOption[] = [
    {
      nivel: NivelAcademico.PRIMARIA,
      titulo: "Primaria",
      descripcion: "1° a 6° grado",
      icon: "school",
      color: "#4CAF50",
    },
    {
      nivel: NivelAcademico.SECUNDARIA,
      titulo: "Secundaria",
      descripcion: "1° a 3° grado",
      icon: "menu-book",
      color: "#2196F3",
    },
    {
      nivel: NivelAcademico.PREPARATORIA,
      titulo: "Preparatoria",
      descripcion: "Bachillerato",
      icon: "library-books",
      color: "#FF9800",
    },
    {
      nivel: NivelAcademico.UNIVERSIDAD,
      titulo: "Universidad",
      descripcion: "Licenciatura y posgrado",
      icon: "account-balance",
      color: "#9C27B0",
    },
  ];

  const handleCrearDesdeCero = useCallback(() => {
    setShowNivelModal(true);
  }, []);

  const handleSeleccionarNivel = useCallback(
    (nivel: NivelAcademico) => {
      setShowNivelModal(false);
      navigation.navigate("EditorPlaneacion", { nivel, modo: "crear" });
    },
    [navigation]
  );

  const handleCloseNivelModal = useCallback(() => {
    setShowNivelModal(false);
  }, []);

  const handleGenerarPlantilla = useCallback(() => {
    setIaError("");
    setShowTemplateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowTemplateModal(false);
  }, []);

  const handleGenerarConIA = useCallback(async () => {
    const prompt = promptIA.trim();

    if (!prompt) {
      setIaError("Escribe un prompt para generar la planeación.");
      return;
    }

    if (prompt.length < 10) {
      setIaError("El prompt debe tener al menos 10 caracteres.");
      return;
    }

    if (!API_CONFIG.baseUrl) {
      setIaError("No hay URL de backend configurada para generar con IA.");
      return;
    }

    if (!API_CONFIG.apiSecret) {
      setIaError("Falta configurar EXPO_PUBLIC_API_SECRET para usar la generación con IA.");
      return;
    }

    setIaError("");
    setIsGeneratingIA(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseUrl}/api/planeaciones/generar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_CONFIG.apiSecret,
        },
        body: JSON.stringify({
          prompt,
          nivelAcademico: nivelIA,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "No se pudo generar la planeación con IA.");
      }

      const planeacionGenerada = mapResponseToPlaneacion(
        payload?.data?.planeacion,
        nivelIA,
        prompt
      );

      setPlaneacionGeneradaIA(planeacionGenerada);
      setShowTemplateModal(false);
      setPromptIA("");

      const successMessage =
        "Planeación generada correctamente. En la siguiente tarea se mostrará la vista previa antes de guardar.";

      if (Platform.OS === "web") {
        window.alert(successMessage);
      } else {
        Alert.alert("Generación IA", successMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado al generar la planeación.";
      setIaError(errorMessage);
    } finally {
      setIsGeneratingIA(false);
    }
  }, [promptIA, nivelIA]);

  return {
    showTemplateModal,
    showNivelModal,
    promptIA,
    nivelIA,
    isGeneratingIA,
    iaError,
    planeacionGeneradaIA,
    nivelesAcademicos,
    setPromptIA,
    setNivelIA,
    handleCrearDesdeCero,
    handleSeleccionarNivel,
    handleCloseNivelModal,
    handleGenerarPlantilla,
    handleCloseModal,
    handleGenerarConIA,
  };
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toIsoDate = (value: unknown): string => {
  const parsed = new Date(typeof value === "string" ? value : "");

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

const normalizeModalidad = (value: unknown): "presencial" | "hibrida" | "virtual" => {
  const modalidad = String(value || "presencial").toLowerCase();

  if (modalidad === "hibrida" || modalidad === "virtual") {
    return modalidad;
  }

  return "presencial";
};

const normalizeActividades = (value: unknown) => {
  const defaults = {
    inicio: {
      tipo: "inicio" as const,
      descripcion: "Activación de conocimientos previos",
      duracion: 10,
    },
    desarrollo: { tipo: "desarrollo" as const, descripcion: "Desarrollo del tema", duracion: 30 },
    cierre: { tipo: "cierre" as const, descripcion: "Cierre y retroalimentación", duracion: 10 },
  };

  if (!Array.isArray(value)) {
    return [defaults.inicio, defaults.desarrollo, defaults.cierre];
  }

  const byTipo = { ...defaults };

  for (const item of value) {
    const tipo = (item as { tipo?: string })?.tipo;

    if (tipo !== "inicio" && tipo !== "desarrollo" && tipo !== "cierre") {
      continue;
    }

    const descripcion = String((item as { descripcion?: unknown })?.descripcion || "").trim();
    const duracion = Number((item as { duracion?: unknown })?.duracion);

    byTipo[tipo] = {
      tipo,
      descripcion: descripcion || defaults[tipo].descripcion,
      duracion: Number.isFinite(duracion) && duracion > 0 ? duracion : defaults[tipo].duracion,
    };
  }

  return [byTipo.inicio, byTipo.desarrollo, byTipo.cierre];
};

const mapResponseToPlaneacion = (
  value: unknown,
  nivelAcademico: NivelAcademico,
  prompt: string
): Planeacion => {
  const source = (value || {}) as Record<string, unknown>;
  const nowIso = new Date().toISOString();
  const actividades = normalizeActividades(source.actividades);

  const base = {
    id: String(source.id || `ia_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    nivelAcademico,
    asignatura: String(source.asignatura || "Asignatura por definir"),
    grado: String(source.grado || "Grado por definir"),
    grupo: String(source.grupo || ""),
    fecha: toIsoDate(source.fecha),
    horaInicio: String(source.horaInicio || "08:00"),
    duracionTotal:
      Number(source.duracionTotal) ||
      actividades.reduce((sum, actividad) => sum + actividad.duracion, 0),
    unidadTematica: String(source.unidadTematica || "Unidad temática generada con IA"),
    temaSesion: String(source.temaSesion || `Planeación generada: ${prompt.slice(0, 80)}`),
    aprendizajesEsperados: toStringArray(source.aprendizajesEsperados),
    actividades,
    recursos: toStringArray(source.recursos),
    evaluacion: String(source.evaluacion || "Evaluación formativa"),
    evidencias: toStringArray(source.evidencias),
    observaciones: String(source.observaciones || ""),
    fechaCreacion: toIsoDate(source.fechaCreacion || nowIso),
    fechaModificacion: toIsoDate(source.fechaModificacion || nowIso),
  };

  if (nivelAcademico === NivelAcademico.PRIMARIA) {
    const planeacion: PlaneacionPrimaria = {
      ...base,
      nivelAcademico: NivelAcademico.PRIMARIA,
      campoFormativo: String(source.campoFormativo || "Lenguaje y Comunicación"),
    };

    return planeacion;
  }

  if (nivelAcademico === NivelAcademico.SECUNDARIA) {
    const planeacion: PlaneacionSecundaria = {
      ...base,
      nivelAcademico: NivelAcademico.SECUNDARIA,
      competenciasDisciplinares: toStringArray(source.competenciasDisciplinares),
    };

    return planeacion;
  }

  if (nivelAcademico === NivelAcademico.PREPARATORIA) {
    const planeacion: PlaneacionPreparatoria = {
      ...base,
      nivelAcademico: NivelAcademico.PREPARATORIA,
      competenciasGenericas: toStringArray(source.competenciasGenericas),
      competenciasDisciplinares: toStringArray(source.competenciasDisciplinares),
      bibliografia: toStringArray(source.bibliografia),
    };

    return planeacion;
  }

  const planeacion: PlaneacionUniversidad = {
    ...base,
    nivelAcademico: NivelAcademico.UNIVERSIDAD,
    competenciasProfesionales: toStringArray(source.competenciasProfesionales),
    objetivosAprendizaje: toStringArray(source.objetivosAprendizaje),
    bibliografia: toStringArray(source.bibliografia),
    modalidad: normalizeModalidad(source.modalidad),
  };

  return planeacion;
};
