import { useState, useCallback, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/StackNavigator";

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
  activeTab: TabType;
  tabs: Tab[];
  setActiveTab: (tab: TabType) => void;
  navigateEditarGrupo: () => void;
  navigateCrearTarea: () => void;
  navigateAsignarRecurso: () => void;
  navigateDetalleTarea: (tareaId: number) => void;
}

export const useDetalleGrupoViewModel = (): DetalleGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { grupoId, grupoNombre } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>("alumnos");

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

  return {
    grupoId,
    grupoNombre,
    activeTab,
    tabs,
    setActiveTab,
    navigateEditarGrupo,
    navigateCrearTarea,
    navigateAsignarRecurso,
    navigateDetalleTarea,
  };
};
