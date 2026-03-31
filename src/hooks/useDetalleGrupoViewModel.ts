import { useState, useCallback, useMemo, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useGruposContext } from "../context/GruposContext";
import type { Alumno, Asistencia, Calificacion, Recurso, Tarea } from "../../types";

type Nav = StackNavigationProp<RootStackParamList, "DetalleGrupo">;
type Route = RouteProp<RootStackParamList, "DetalleGrupo">;

export type TabType =
  | "alumnos"
  | "calificaciones"
  | "asistencias"
  | "recursos"
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
  isLoadingData: boolean;
  loadError: string;
  alumnos: Alumno[];
  tareas: Tarea[];
  recursos: Recurso[];
  asistencias: Asistencia[];
  calificaciones: Calificacion[];
  reloadDetalleData: () => Promise<void>;
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);

  const grupo = obtenerGrupo(grupoId);
  const cantidadAlumnos = grupo?.cantidadAlumnos ?? 0;

  const tabs: Tab[] = useMemo(
    () => [
      { id: "alumnos", label: "Alumnos", icon: "people" },
      { id: "calificaciones", label: "Calificaciones", icon: "grade" },
      { id: "asistencias", label: "Asistencias", icon: "event-available" },
      { id: "recursos", label: "Recursos", icon: "folder" },
      { id: "tareas", label: "Tareas", icon: "assignment" },
      { id: "graficas", label: "Gráficas", icon: "analytics" },
    ],
    []
  );

  const readArray = useCallback(async <T>(key: string): Promise<T[]> => {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  }, []);

  const reloadDetalleData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setLoadError("");

      const [alumnosRaw, tareasRaw, recursosRaw, asistenciasRaw, calificacionesRaw] =
        await Promise.all([
          readArray<Alumno>("@planearia:alumnos"),
          readArray<Tarea>("@planearia:tareas"),
          readArray<Recurso>("@planearia:recursos"),
          readArray<Asistencia>("@planearia:asistencias"),
          readArray<Calificacion>("@planearia:calificaciones"),
        ]);

      setAlumnos(alumnosRaw.filter((alumno) => alumno.grupoId === grupoId));
      setTareas(tareasRaw.filter((tarea) => tarea.grupoId === grupoId));
      setRecursos(recursosRaw.filter((recurso) => recurso.grupoId === grupoId));
      setAsistencias(asistenciasRaw.filter((asistencia) => asistencia.grupoId === grupoId));
      setCalificaciones(
        calificacionesRaw.filter((calificacion) => calificacion.grupoId === grupoId)
      );
    } catch {
      setLoadError("No se pudieron cargar los datos del grupo.");
    } finally {
      setIsLoadingData(false);
    }
  }, [grupoId, readArray]);

  useEffect(() => {
    void reloadDetalleData();
  }, [reloadDetalleData]);

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
    isLoadingData,
    loadError,
    alumnos,
    tareas,
    recursos,
    asistencias,
    calificaciones,
    reloadDetalleData,
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
