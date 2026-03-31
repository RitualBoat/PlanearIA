import { useState, useCallback, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useGruposContext } from "../context/GruposContext";

type Nav = StackNavigationProp<RootStackParamList, "DetalleGrupo">;
type Route = RouteProp<RootStackParamList, "DetalleGrupo">;

export type TabType =
  | "alumnos"
  | "calificaciones"
  | "asistencias"
  | "comentarios"
  | "tareas"
  | "graficas";

export interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

export interface DetalleGrupoViewModel {
  grupoId: number;
  grupoNombre: string;
  cantidadAlumnos: number;
  deleteModalVisible: boolean;
  deleteConfirmed: boolean;
  isDeleting: boolean;
  deleteError: string;
  activeTab: TabType;
  tabs: Tab[];
  setActiveTab: (tab: TabType) => void;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  toggleDeleteConfirmed: () => void;
  confirmDeleteGrupo: () => Promise<void>;
  navigateEditarGrupo: () => void;
  navigateCrearTarea: () => void;
  navigateAsignarRecurso: () => void;
  navigateDetalleTarea: (tareaId: number) => void;
}

export const useDetalleGrupoViewModel = (): DetalleGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { obtenerGrupo, eliminarGrupo } = useGruposContext();
  const { grupoId, grupoNombre } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>("alumnos");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const grupo = obtenerGrupo(grupoId);
  const cantidadAlumnos = grupo?.cantidadAlumnos ?? 0;

  const tabs: Tab[] = useMemo(
    () => [
      { id: "alumnos", label: "Alumnos", icon: "people" },
      { id: "calificaciones", label: "Calificaciones", icon: "grade" },
      { id: "asistencias", label: "Asistencias", icon: "event-available" },
      { id: "comentarios", label: "Comentarios", icon: "comment" },
      { id: "tareas", label: "Tareas", icon: "assignment" },
      { id: "graficas", label: "Gráficas", icon: "analytics" },
    ],
    []
  );

  const navigateCrearTarea = useCallback(() => {
    navigation.navigate("CrearTareaGrupo", { grupoId });
  }, [navigation, grupoId]);

  const navigateEditarGrupo = useCallback(() => {
    navigation.navigate("CrearGrupo", {
      modo: "editar",
      grupoId,
    });
  }, [navigation, grupoId]);

  const navigateAsignarRecurso = useCallback(() => {
    navigation.navigate("AsignarRecurso", { grupoId });
  }, [navigation, grupoId]);

  const navigateDetalleTarea = useCallback(
    (tareaId: number) => {
      navigation.navigate("DetalleTarea", { tareaId, grupoId });
    },
    [navigation, grupoId]
  );

  const openDeleteModal = useCallback(() => {
    setDeleteError("");
    setDeleteConfirmed(false);
    setDeleteModalVisible(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setDeleteModalVisible(false);
    setDeleteConfirmed(false);
    setDeleteError("");
  }, [isDeleting]);

  const toggleDeleteConfirmed = useCallback(() => {
    setDeleteConfirmed((prev) => !prev);
    setDeleteError("");
  }, []);

  const confirmDeleteGrupo = useCallback(async () => {
    if (!deleteConfirmed) {
      setDeleteError("Debes confirmar que entiendes las consecuencias antes de eliminar.");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");
      await eliminarGrupo(grupoId);
      setDeleteModalVisible(false);
      navigation.navigate("ListaGrupos");
    } catch {
      setDeleteError("No se pudo eliminar el grupo. Intenta nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmed, eliminarGrupo, grupoId, navigation]);

  return {
    grupoId,
    grupoNombre,
    cantidadAlumnos,
    deleteModalVisible,
    deleteConfirmed,
    isDeleting,
    deleteError,
    activeTab,
    tabs,
    setActiveTab,
    openDeleteModal,
    closeDeleteModal,
    toggleDeleteConfirmed,
    confirmDeleteGrupo,
    navigateEditarGrupo,
    navigateCrearTarea,
    navigateAsignarRecurso,
    navigateDetalleTarea,
  };
};
