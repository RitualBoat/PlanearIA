import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { NivelAcademico } from "../../types/planeacion";

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
  nivelesAcademicos: NivelOption[];
  setPromptIA: (value: string) => void;
  setNivelIA: (value: NivelAcademico) => void;
  handleCrearDesdeCero: () => void;
  handleSeleccionarNivel: (nivel: NivelAcademico) => void;
  handleCloseNivelModal: () => void;
  handleGenerarPlantilla: () => void;
  handleCloseModal: () => void;
  handleGenerarConIA: () => void;
}

export const useCrearPlaneacionViewModel = (): CrearPlaneacionViewModel => {
  const navigation = useNavigation<Nav>();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [promptIA, setPromptIA] = useState("");
  const [nivelIA, setNivelIA] = useState<NivelAcademico>(NivelAcademico.PRIMARIA);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [iaError, setIaError] = useState("");

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

    setIaError("");
    setIsGeneratingIA(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const message =
        "La conexión completa con IA se implementará en la siguiente tarea. El prompt y nivel ya se capturan correctamente.";

      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Generación IA", message);
      }

      console.log("[planeacion] Prompt IA:", prompt);
      console.log("[planeacion] Nivel IA:", nivelIA);
      setShowTemplateModal(false);
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
