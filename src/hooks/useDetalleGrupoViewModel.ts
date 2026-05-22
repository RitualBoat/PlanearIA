import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useGruposContext } from "../context/GruposContext";
import type {
  Alumno,
  Asistencia,
  Calificacion,
  Grupo,
  GrupoMiembro,
  RolGrupo,
  Recurso,
  Tarea,
} from "../../types";
import { exportarGrupoArchivo, type GrupoExportFormat } from "../services/grupoExportService";
import { useAddStudentsModal } from "./useAddStudentsModal";
import { useRemoveStudentModal } from "./useRemoveStudentModal";
import { useGrupoNotas } from "./useGrupoNotas";

type Nav = StackNavigationProp<RootStackParamList, "DetalleGrupo">;
type Route = RouteProp<RootStackParamList, "DetalleGrupo">;

export type TabType =
  | "alumnos"
  | "calificaciones"
  | "asistencias"
  | "recursos"
  | "tareas"
  | "graficas"
  | "notas"
  | "colaboradores";

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
  entregas: EntregaTarea[];
  lastDataRefreshAt: Date | null;
  grupoNotas: string;
  notasUltimaEdicion: string;
  notasEstado: "sin-cambios" | "cambios-sin-guardar" | "guardando" | "guardado" | "error";
  notasError: string;
  miembros: GrupoMiembro[];
  invitacionModalVisible: boolean;
  contextualMenuVisible: boolean;
  colaboradorSeleccionado: GrupoMiembro | null;
  openInvitacionModal: () => void;
  closeInvitacionModal: () => void;
  openContextualMenu: (miembro: GrupoMiembro) => void;
  closeContextualMenu: () => void;
  invitarDocente: (email: string, rol: RolGrupo) => Promise<void>;
  cambiarRolColaborador: (nuevoRol: RolGrupo) => Promise<void>;
  eliminarColaborador: () => Promise<void>;
  reloadDetalleData: () => Promise<void>;
  addStudentsModalVisible: boolean;
  createStudentMode: boolean;
  studentSearchQuery: string;
  selectedStudentIds: number[];
  availableStudents: Alumno[];
  isLinkingStudents: boolean;
  addStudentsError: string;
  addStudentsSuccessVisible: boolean;
  createdAndAddedCount: number;
  newStudentNombre: string;
  newStudentApellidos: string;
  newStudentNumeroControl: string;
  newStudentCarrera: string;
  setStudentSearchQuery: (value: string) => void;
  openAddStudentsModal: () => void;
  closeAddStudentsModal: () => void;
  openCreateStudentMode: () => void;
  closeCreateStudentMode: () => void;
  toggleStudentSelection: (studentId: number) => void;
  confirmAddSelectedStudents: () => Promise<void>;
  setNewStudentNombre: (value: string) => void;
  setNewStudentApellidos: (value: string) => void;
  setNewStudentNumeroControl: (value: string) => void;
  setNewStudentCarrera: (value: string) => void;
  createAndAddStudent: () => Promise<void>;
  closeAddStudentsSuccess: () => void;
  removeStudentModalVisible: boolean;
  studentToRemove: Alumno | null;
  isUnlinkingStudent: boolean;
  removeStudentError: string;
  openRemoveStudentModal: (student: Alumno) => void;
  closeRemoveStudentModal: () => void;
  confirmRemoveStudentFromGroup: () => Promise<void>;
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
  navigateAsignarDeBiblioteca: () => void;
  navigateDetalleTarea: (tareaId: number) => void;
  navigateReportesGrupo: () => void;
  navigateRegistrarAsistencia: () => void;
  navigateHistorialAsistencia: () => void;
  navigateCapturarCalificaciones: () => void;
  navigatePromediosCalificaciones: () => void;
  exportarGrupo: (formato: GrupoExportFormat) => Promise<boolean>;
  setGrupoNotas: (value: string) => void;
  guardarNotasGrupo: () => Promise<void>;
  descartarCambiosNotas: () => void;
}

export const useDetalleGrupoViewModel = (): DetalleGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { 
    obtenerGrupo, 
    eliminarGrupo, 
    actualizarGrupo,
    invitarDocenteAGrupo,
    cambiarRolDocenteGrupo,
    eliminarDocenteGrupo
  } = useGruposContext();
  const { grupoId, grupoNombre } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>("alumnos");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  
  // Estados para colaboradores
  const [invitacionModalVisible, setInvitacionModalVisible] = useState(false);
  const [contextualMenuVisible, setContextualMenuVisible] = useState(false);
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<GrupoMiembro | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [allAlumnos, setAllAlumnos] = useState<Alumno[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [entregas, setEntregas] = useState<EntregaTarea[]>([]);
  const [lastDataRefreshAt, setLastDataRefreshAt] = useState<Date | null>(null);

  const grupo = obtenerGrupo(grupoId);
  const cantidadAlumnos = grupo?.cantidadAlumnos ?? 0;
  const miembros = grupo?.miembros || [];

  const tabs: Tab[] = [
    { id: "alumnos", label: "Alumnos", icon: "people" },
    { id: "calificaciones", label: "Calificaciones", icon: "grade" },
    { id: "asistencias", label: "Asistencias", icon: "event-available" },
    { id: "recursos", label: "Recursos", icon: "folder" },
    { id: "tareas", label: "Tareas", icon: "assignment" },
    { id: "graficas", label: "Gráficas", icon: "analytics" },
    { id: "notas", label: "Notas", icon: "note-alt" },
    { id: "colaboradores", label: "Colaboradores", icon: "group-add" },
  ];

  // --- Notes sub-hook ---
  const notasHook = useGrupoNotas(grupoId, grupo, actualizarGrupo);

  // --- Shared persistence for student management ---
  const persistAlumnosAndCount = useCallback(
    async (nextAlumnos: Alumno[]) => {
      await AsyncStorage.setItem("@planearia:alumnos", JSON.stringify(nextAlumnos));
      setAllAlumnos(nextAlumnos);
      const alumnosDelGrupo = nextAlumnos.filter((alumno) => alumno.grupoId === grupoId);
      setAlumnos(alumnosDelGrupo);
      await actualizarGrupo(grupoId, { cantidadAlumnos: alumnosDelGrupo.length });
    },
    [grupoId, actualizarGrupo]
  );

  // --- Student management sub-hooks ---
  const addStudents = useAddStudentsModal(grupoId, allAlumnos, persistAlumnosAndCount);
  const removeStudent = useRemoveStudentModal(allAlumnos, persistAlumnosAndCount);

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

      const [alumnosRaw, tareasRaw, recursosRaw, asistenciasRaw, calificacionesRaw, entregasRaw] =
        await Promise.all([
          readArray<Alumno>("@planearia:alumnos"),
          readArray<Tarea>("@planearia:tareas"),
          readArray<Recurso>("@planearia:recursos"),
          readArray<Asistencia>("@planearia:asistencias"),
          readArray<Calificacion>("@planearia:calificaciones"),
          readArray<EntregaTarea>("@planearia:entregas"),
        ]);

      const entregablesRaw =
        entregasRaw.length > 0
          ? entregasRaw
          : await readArray<EntregaTarea>("@planearia:entregables");

      setAllAlumnos(alumnosRaw);
      setAlumnos(alumnosRaw.filter((alumno) => alumno.grupoId === grupoId));
      setTareas(tareasRaw.filter((tarea) => tarea.grupoId === grupoId));
      setRecursos(recursosRaw.filter((recurso) => recurso.grupoId === grupoId));
      setAsistencias(asistenciasRaw.filter((asistencia) => asistencia.grupoId === grupoId));
      setCalificaciones(
        calificacionesRaw.filter((calificacion) => calificacion.grupoId === grupoId)
      );
      const tareasGrupoIds = new Set(
        tareasRaw.filter((tarea) => tarea.grupoId === grupoId).map((t) => t.id)
      );
      setEntregas(entregablesRaw.filter((entrega) => tareasGrupoIds.has(entrega.tareaId)));
      setLastDataRefreshAt(new Date());
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

  const navigateAsignarDeBiblioteca = useCallback(() => {
    navigation.navigate("MainTabs", {
      screen: "ContenidoTab",
      params: { selectionMode: true, targetGroupId: grupoId },
    });
  }, [navigation, grupoId]);

  const navigateDetalleTarea = useCallback(
    (tareaId: number) => {
      navigation.navigate("DetalleTarea", { tareaId, grupoId });
    },
    [navigation, grupoId]
  );

  const navigateReportesGrupo = useCallback(() => {
    navigation.navigate("ReportesGrupo", {
      grupoId,
      grupoNombre,
    });
  }, [navigation, grupoId, grupoNombre]);

  const navigateRegistrarAsistencia = useCallback(() => {
    navigation.navigate("RegistrarAsistencia", { grupoId });
  }, [navigation, grupoId]);

  const navigateHistorialAsistencia = useCallback(() => {
    navigation.navigate("HistorialAsistencia", { grupoId });
  }, [navigation, grupoId]);

  const navigateCapturarCalificaciones = useCallback(() => {
    navigation.navigate("CapturarCalificaciones", { grupoId });
  }, [navigation, grupoId]);

  const navigatePromediosCalificaciones = useCallback(() => {
    navigation.navigate("PromediosCalificaciones", { grupoId });
  }, [navigation, grupoId]);

  const exportarGrupo = useCallback(
    async (formato: GrupoExportFormat): Promise<boolean> => {
      const grupoActual = obtenerGrupo(grupoId);
      if (!grupoActual) {
        return false;
      }

      return exportarGrupoArchivo({
        formato,
        grupo: {
          id: grupoId,
          nombre: String(grupoActual.nombre ?? grupoNombre),
          materia: String(grupoActual.materia ?? "Sin materia"),
          carrera: (grupoActual.carrera as Grupo["carrera"]) ?? "ISC",
          semestre: Number(grupoActual.semestre ?? 1),
          periodo: String(grupoActual.periodo ?? "Sin periodo"),
          cantidadAlumnos: Number(grupoActual.cantidadAlumnos ?? alumnos.length),
          horario: typeof grupoActual.horario === "string" ? grupoActual.horario : "",
          estado: (grupoActual.estado as Grupo["estado"]) ?? "activo",
        },
        alumnos,
      });
    },
    [alumnos, grupoId, grupoNombre, obtenerGrupo]
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

  const openInvitacionModal = useCallback(() => setInvitacionModalVisible(true), []);
  const closeInvitacionModal = useCallback(() => setInvitacionModalVisible(false), []);
  
  const openContextualMenu = useCallback((miembro: GrupoMiembro) => {
    setColaboradorSeleccionado(miembro);
    setContextualMenuVisible(true);
  }, []);
  
  const closeContextualMenu = useCallback(() => {
    setColaboradorSeleccionado(null);
    setContextualMenuVisible(false);
  }, []);

  const invitarDocente = useCallback(async (email: string, rol: RolGrupo) => {
    await invitarDocenteAGrupo(grupoId, {
      usuarioId: `usr_${Date.now()}`,
      nombre: email.split("@")[0],
      email,
      rol,
    });
  }, [grupoId, invitarDocenteAGrupo]);

  const cambiarRolColaborador = useCallback(async (nuevoRol: RolGrupo) => {
    if (!colaboradorSeleccionado) return;
    await cambiarRolDocenteGrupo(grupoId, colaboradorSeleccionado.usuarioId, nuevoRol);
    closeContextualMenu();
  }, [grupoId, colaboradorSeleccionado, cambiarRolDocenteGrupo, closeContextualMenu]);

  const eliminarColaborador = useCallback(async () => {
    if (!colaboradorSeleccionado) return;
    await eliminarDocenteGrupo(grupoId, colaboradorSeleccionado.usuarioId);
    closeContextualMenu();
  }, [grupoId, colaboradorSeleccionado, eliminarDocenteGrupo, closeContextualMenu]);

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
    entregas,
    lastDataRefreshAt,
    miembros,
    invitacionModalVisible,
    contextualMenuVisible,
    colaboradorSeleccionado,
    openInvitacionModal,
    closeInvitacionModal,
    openContextualMenu,
    closeContextualMenu,
    invitarDocente,
    cambiarRolColaborador,
    eliminarColaborador,
    ...notasHook,
    reloadDetalleData,
    ...addStudents,
    ...removeStudent,
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
    navigateAsignarDeBiblioteca,
    navigateDetalleTarea,
    navigateReportesGrupo,
    navigateRegistrarAsistencia,
    navigateHistorialAsistencia,
    navigateCapturarCalificaciones,
    navigatePromediosCalificaciones,
    exportarGrupo,
    setGrupoNotas: notasHook.setGrupoNotas,
    guardarNotasGrupo: notasHook.guardarNotasGrupo,
    descartarCambiosNotas: notasHook.descartarCambiosNotas,
  };
};
