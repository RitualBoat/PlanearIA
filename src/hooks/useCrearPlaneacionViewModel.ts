import { useState, useCallback } from "react";
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
  nivelesAcademicos: NivelOption[];
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
    [navigation],
  );

  const handleCloseNivelModal = useCallback(() => {
    setShowNivelModal(false);
  }, []);

  const handleGenerarPlantilla = useCallback(() => {
    setShowTemplateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowTemplateModal(false);
  }, []);

  const handleGenerarConIA = useCallback(() => {
    console.log("[planeacion] Generating AI template");
    setShowTemplateModal(false);
  }, []);

  return {
    showTemplateModal,
    showNivelModal,
    nivelesAcademicos,
    handleCrearDesdeCero,
    handleSeleccionarNivel,
    handleCloseNivelModal,
    handleGenerarPlantilla,
    handleCloseModal,
    handleGenerarConIA,
  };
};
