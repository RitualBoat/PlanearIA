import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { API_CONFIG } from "../sync/config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { usePlaneaciones } from "../sync/providers/SyncProvider";
import { buildPlaneacionDocumentoBase } from "../utils/createPlaneacionDocumentoBase";
import { mapResponseToPlaneacion } from "../utils/planeacionMapper";
import { NivelAcademico as NivelAcademicoLegacy, type Planeacion } from "../../types/planeacion";
import { NivelAcademico as NivelAcademicoV2 } from "../../types/planeacionV2";

type Nav = StackNavigationProp<RootStackParamList, "CrearPlaneacion">;

export type MetodoCreacion = "desde_cero" | "ia" | "importar" | "plantilla";

export interface NivelWizardOption {
  nivel: NivelAcademicoV2;
  titulo: string;
  descripcion: string;
  icon: string;
}

export interface MetodoWizardOption {
  id: MetodoCreacion;
  titulo: string;
  descripcion: string;
  icon: string;
}

export interface NivelOption {
  nivel: NivelAcademicoLegacy;
  titulo: string;
  descripcion: string;
  icon: string;
  color: string;
}

export interface CrearPlaneacionViewModel {
  step: 1 | 2 | 3;
  nivelSeleccionado: NivelAcademicoV2 | null;
  metodoSeleccionado: MetodoCreacion | null;
  asignatura: string;
  grado: string;
  gruposInput: string;
  isSubmitting: boolean;
  puedeAvanzar: boolean;
  niveles: NivelWizardOption[];
  metodos: MetodoWizardOption[];
  setAsignatura: (value: string) => void;
  setGrado: (value: string) => void;
  setGruposInput: (value: string) => void;
  seleccionarNivel: (nivel: NivelAcademicoV2) => void;
  seleccionarMetodo: (metodo: MetodoCreacion) => void;
  irSiguiente: () => void;
  irAnterior: () => void;
  finalizar: () => Promise<void>;

  // Compatibilidad temporal con flujo legacy de IA
  showTemplateModal: boolean;
  showNivelModal: boolean;
  showPreviewModal: boolean;
  promptIA: string;
  nivelIA: NivelAcademicoLegacy;
  isGeneratingIA: boolean;
  iaError: string;
  planeacionGeneradaIA: Planeacion | null;
  nivelesAcademicos: NivelOption[];
  setPromptIA: (value: string) => void;
  setNivelIA: (value: NivelAcademicoLegacy) => void;
  handleCrearDesdeCero: () => void;
  handleSeleccionarNivel: (nivel: NivelAcademicoLegacy) => void;
  handleCloseNivelModal: () => void;
  handleGenerarPlantilla: () => void;
  handleCloseModal: () => void;
  handleClosePreview: () => void;
  handleGenerarConIA: () => Promise<void>;
  handleGuardarPlaneacionIA: () => Promise<void>;
  handleEditarPlaneacionIA: () => Promise<void>;
  handleRegenerarPlaneacionIA: () => Promise<void>;
}

const parseGroups = (input: string): string[] => {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapLegacyToV2Nivel = (nivel: NivelAcademicoLegacy): NivelAcademicoV2 => {
  if (nivel === NivelAcademicoLegacy.SECUNDARIA) return NivelAcademicoV2.SECUNDARIA;
  if (nivel === NivelAcademicoLegacy.PREPARATORIA) return NivelAcademicoV2.PREPARATORIA;
  if (nivel === NivelAcademicoLegacy.UNIVERSIDAD) return NivelAcademicoV2.UNIVERSIDAD;
  return NivelAcademicoV2.PRIMARIA;
};

const showInfoMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
};

export const useCrearPlaneacionViewModel = (): CrearPlaneacionViewModel => {
  const navigation = useNavigation<Nav>();
  const { usuario } = useAuth();
  const { crear, agregarPlaneacion, obtenerPlaneacion, forceSync } = usePlaneaciones();

  // Nuevo wizard (Fase 4)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelAcademicoV2 | null>(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoCreacion | null>(null);
  const [asignatura, setAsignatura] = useState("");
  const [grado, setGrado] = useState("");
  const [gruposInput, setGruposInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compatibilidad temporal con flujo IA legacy
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [promptIA, setPromptIA] = useState("");
  const [nivelIA, setNivelIA] = useState<NivelAcademicoLegacy>(NivelAcademicoLegacy.PRIMARIA);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [iaError, setIaError] = useState("");
  const [planeacionGeneradaIA, setPlaneacionGeneradaIA] = useState<Planeacion | null>(null);

  const niveles: NivelWizardOption[] = useMemo(
    () => [
      {
        nivel: NivelAcademicoV2.PRIMARIA,
        titulo: "Primaria",
        descripcion: "Planeaciones para primero a sexto.",
        icon: "school",
      },
      {
        nivel: NivelAcademicoV2.SECUNDARIA,
        titulo: "Secundaria",
        descripcion: "Planeaciones para secundaria general o tecnica.",
        icon: "menu-book",
      },
      {
        nivel: NivelAcademicoV2.PREPARATORIA,
        titulo: "Preparatoria",
        descripcion: "Bachillerato por competencias.",
        icon: "library-books",
      },
      {
        nivel: NivelAcademicoV2.UNIVERSIDAD,
        titulo: "Universidad",
        descripcion: "Cursos universitarios por sesiones.",
        icon: "account-balance",
      },
    ],
    []
  );

  const metodos: MetodoWizardOption[] = useMemo(
    () => [
      {
        id: "desde_cero",
        titulo: "Desde cero",
        descripcion: "Crear un documento nuevo y editarlo en DocEditor.",
        icon: "edit-note",
      },
      {
        id: "ia",
        titulo: "Generar con IA",
        descripcion: "Ir al flujo de generacion asistida para propuesta inicial.",
        icon: "auto-awesome",
      },
      {
        id: "importar",
        titulo: "Importar",
        descripcion: "Importar una planeacion existente y ajustarla.",
        icon: "file-upload",
      },
      {
        id: "plantilla",
        titulo: "Desde plantilla",
        descripcion: "Crear desde una estructura base (temporal).",
        icon: "view-quilt",
      },
    ],
    []
  );

  const nivelesAcademicos: NivelOption[] = useMemo(
    () => [
      {
        nivel: NivelAcademicoLegacy.PRIMARIA,
        titulo: "Primaria",
        descripcion: "1 a 6 grado",
        icon: "school",
        color: "#22c55e",
      },
      {
        nivel: NivelAcademicoLegacy.SECUNDARIA,
        titulo: "Secundaria",
        descripcion: "1 a 3 grado",
        icon: "menu-book",
        color: "#3b82f6",
      },
      {
        nivel: NivelAcademicoLegacy.PREPARATORIA,
        titulo: "Preparatoria",
        descripcion: "Bachillerato",
        icon: "library-books",
        color: "#f59e0b",
      },
      {
        nivel: NivelAcademicoLegacy.UNIVERSIDAD,
        titulo: "Universidad",
        descripcion: "Licenciatura y posgrado",
        icon: "account-balance",
        color: "#7c3aed",
      },
    ],
    []
  );

  const puedeAvanzar = useMemo(() => {
    if (step === 1) return Boolean(nivelSeleccionado);
    if (step === 2) return Boolean(metodoSeleccionado);
    if (metodoSeleccionado === "ia" || metodoSeleccionado === "importar") return true;
    return Boolean(asignatura.trim() && grado.trim());
  }, [asignatura, grado, metodoSeleccionado, nivelSeleccionado, step]);

  const seleccionarNivel = useCallback((nivel: NivelAcademicoV2) => setNivelSeleccionado(nivel), []);
  const seleccionarMetodo = useCallback((metodo: MetodoCreacion) => setMetodoSeleccionado(metodo), []);

  const irSiguiente = useCallback(() => {
    if (step === 1 && nivelSeleccionado) {
      setStep(2);
      return;
    }
    if (step === 2 && metodoSeleccionado) {
      setStep(3);
    }
  }, [metodoSeleccionado, nivelSeleccionado, step]);

  const irAnterior = useCallback(() => {
    setStep((prev) => {
      if (prev === 1) return 1;
      if (prev === 2) return 1;
      return 2;
    });
  }, []);

  const finalizar = useCallback(async () => {
    if (!nivelSeleccionado || !metodoSeleccionado) return;

    if (metodoSeleccionado === "ia") {
      navigation.navigate("GenerarPlaneacionIA");
      return;
    }

    if (metodoSeleccionado === "importar") {
      navigation.navigate("ImportarPlaneacion");
      return;
    }

    setIsSubmitting(true);
    try {
      const doc = buildPlaneacionDocumentoBase({
        nivelAcademico: nivelSeleccionado,
        userId: String(usuario?.id ?? "guest"),
        usuario,
        asignatura: asignatura.trim(),
        grado: grado.trim(),
        grupos: parseGroups(gruposInput),
      });
      await crear(doc);
      navigation.navigate("DocEditor", {
        modo: "editar",
        planeacionId: doc.id,
        nivelAcademico: doc.nivelAcademico,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [asignatura, crear, grado, gruposInput, metodoSeleccionado, navigation, nivelSeleccionado, usuario]);

  const handleCrearDesdeCero = useCallback(() => {
    setShowNivelModal(true);
  }, []);

  const handleSeleccionarNivel = useCallback(
    (nivel: NivelAcademicoLegacy) => {
      setShowNivelModal(false);
      navigation.navigate("DocEditor", { modo: "crear", nivelAcademico: mapLegacyToV2Nivel(nivel) });
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

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
  }, []);

  const handleGenerarConIA = useCallback(async () => {
    const prompt = promptIA.trim();

    if (!prompt) {
      setIaError("Escribe un prompt para generar la planeacion.");
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
      setIaError("Falta configurar EXPO_PUBLIC_API_SECRET para usar la generacion con IA.");
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
        throw new Error(payload?.error || "No se pudo generar la planeacion con IA.");
      }

      const planeacionGenerada = mapResponseToPlaneacion(payload?.data?.planeacion, nivelIA, prompt);

      setPlaneacionGeneradaIA(planeacionGenerada);
      setShowTemplateModal(false);
      setShowPreviewModal(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado al generar la planeacion.";
      setIaError(errorMessage);
    } finally {
      setIsGeneratingIA(false);
    }
  }, [nivelIA, promptIA]);

  const ensurePlaneacionIAGuardada = useCallback(async (): Promise<Planeacion | null> => {
    if (!planeacionGeneradaIA) {
      setIaError("No hay una planeacion generada.");
      return null;
    }

    const existente = obtenerPlaneacion(planeacionGeneradaIA.id);
    if (!existente) {
      await agregarPlaneacion(planeacionGeneradaIA);
    }

    return planeacionGeneradaIA;
  }, [agregarPlaneacion, obtenerPlaneacion, planeacionGeneradaIA]);

  const handleGuardarPlaneacionIA = useCallback(async () => {
    try {
      const planeacion = await ensurePlaneacionIAGuardada();
      if (!planeacion) return;

      await forceSync();
      setShowPreviewModal(false);
      setShowTemplateModal(false);
      showInfoMessage("Planeacion IA", "Planeacion guardada y sincronizada correctamente.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo guardar/sincronizar la planeacion generada.";
      setIaError(errorMessage);
    }
  }, [ensurePlaneacionIAGuardada, forceSync]);

  const handleEditarPlaneacionIA = useCallback(async () => {
    try {
      const planeacion = await ensurePlaneacionIAGuardada();
      if (!planeacion) return;

      setShowPreviewModal(false);
      setShowTemplateModal(false);

      navigation.navigate("DocEditor", {
        modo: "editar",
        planeacionId: planeacion.id,
        nivelAcademico: mapLegacyToV2Nivel(planeacion.nivelAcademico as NivelAcademicoLegacy),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo abrir el editor de la planeacion generada.";
      setIaError(errorMessage);
    }
  }, [ensurePlaneacionIAGuardada, navigation]);

  const handleRegenerarPlaneacionIA = useCallback(async () => {
    setShowPreviewModal(false);
    await handleGenerarConIA();
  }, [handleGenerarConIA]);

  return {
    step,
    nivelSeleccionado,
    metodoSeleccionado,
    asignatura,
    grado,
    gruposInput,
    isSubmitting,
    puedeAvanzar,
    niveles,
    metodos,
    setAsignatura,
    setGrado,
    setGruposInput,
    seleccionarNivel,
    seleccionarMetodo,
    irSiguiente,
    irAnterior,
    finalizar,
    showTemplateModal,
    showNivelModal,
    showPreviewModal,
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
    handleClosePreview,
    handleGenerarConIA,
    handleGuardarPlaneacionIA,
    handleEditarPlaneacionIA,
    handleRegenerarPlaneacionIA,
  };
};

export default useCrearPlaneacionViewModel;
