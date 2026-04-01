import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { API_CONFIG } from "../sync/config/apiConfig";
import { usePlaneaciones } from "../sync/providers/SyncProvider";
import { COLORS } from "../../types";
import { NivelAcademico } from "../../types/planeacion";
import type { Planeacion } from "../../types/planeacion";
import { mapResponseToPlaneacion } from "../utils/planeacionMapper";

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
  showPreviewModal: boolean;
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
  handleClosePreview: () => void;
  handleGenerarConIA: () => Promise<void>;
  handleGuardarPlaneacionIA: () => Promise<void>;
  handleEditarPlaneacionIA: () => Promise<void>;
  handleRegenerarPlaneacionIA: () => Promise<void>;
}

export const useCrearPlaneacionViewModel = (): CrearPlaneacionViewModel => {
  const navigation = useNavigation<Nav>();
  const { agregarPlaneacion, obtenerPlaneacion, forceSync } = usePlaneaciones();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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
      color: COLORS.success,
    },
    {
      nivel: NivelAcademico.SECUNDARIA,
      titulo: "Secundaria",
      descripcion: "1° a 3° grado",
      icon: "menu-book",
      color: COLORS.primaryLight,
    },
    {
      nivel: NivelAcademico.PREPARATORIA,
      titulo: "Preparatoria",
      descripcion: "Bachillerato",
      icon: "library-books",
      color: COLORS.warning,
    },
    {
      nivel: NivelAcademico.UNIVERSIDAD,
      titulo: "Universidad",
      descripcion: "Licenciatura y posgrado",
      icon: "account-balance",
      color: COLORS.purple,
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

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
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
      setShowPreviewModal(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado al generar la planeación.";
      setIaError(errorMessage);
    } finally {
      setIsGeneratingIA(false);
    }
  }, [promptIA, nivelIA]);

  const handleGuardarPlaneacionIA = useCallback(async () => {
    if (!planeacionGeneradaIA) {
      setIaError("No hay una planeación generada para guardar.");
      return;
    }

    setIaError("");

    try {
      const existente = obtenerPlaneacion(planeacionGeneradaIA.id);
      if (!existente) {
        await agregarPlaneacion(planeacionGeneradaIA);
      }

      await forceSync();

      setShowPreviewModal(false);
      setShowTemplateModal(false);

      if (Platform.OS === "web") {
        window.alert("Planeación guardada y sincronizada correctamente.");
      } else {
        Alert.alert("Planeación IA", "Planeación guardada y sincronizada correctamente.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo guardar/sincronizar la planeación generada.";
      setIaError(errorMessage);
    }
  }, [agregarPlaneacion, forceSync, obtenerPlaneacion, planeacionGeneradaIA]);

  const handleEditarPlaneacionIA = useCallback(async () => {
    if (!planeacionGeneradaIA) {
      setIaError("No hay una planeación generada para editar.");
      return;
    }

    setIaError("");

    try {
      const existente = obtenerPlaneacion(planeacionGeneradaIA.id);
      if (!existente) {
        await agregarPlaneacion(planeacionGeneradaIA);
      }

      setShowPreviewModal(false);
      setShowTemplateModal(false);

      navigation.navigate("EditorPlaneacion", {
        nivel: planeacionGeneradaIA.nivelAcademico,
        modo: "editar",
        planeacionId: planeacionGeneradaIA.id,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo abrir el editor de la planeación generada.";
      setIaError(errorMessage);
    }
  }, [agregarPlaneacion, navigation, obtenerPlaneacion, planeacionGeneradaIA]);

  const handleRegenerarPlaneacionIA = useCallback(async () => {
    setShowPreviewModal(false);
    await handleGenerarConIA();
  }, [handleGenerarConIA]);

  return {
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
