import { useState, useCallback, useMemo, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useGruposContext } from "../context/GruposContext";
import type { Alumno, Asistencia, Calificacion, EntregaTarea, Recurso, Tarea } from "../../types";

type Nav = StackNavigationProp<RootStackParamList, "DetalleGrupo">;
type Route = RouteProp<RootStackParamList, "DetalleGrupo">;

export type TabType =
  | "alumnos"
  | "calificaciones"
  | "asistencias"
  | "recursos"
  | "tareas"
  | "graficas"
  | "notas";

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
  navigateDetalleTarea: (tareaId: number) => void;
  navigateReportesGrupo: () => void;
  setGrupoNotas: (value: string) => void;
  guardarNotasGrupo: () => Promise<void>;
  descartarCambiosNotas: () => void;
}

export const useDetalleGrupoViewModel = (): DetalleGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { obtenerGrupo, eliminarGrupo, actualizarGrupo } = useGruposContext();
  const { grupoId, grupoNombre } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>("alumnos");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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
  const [savedGrupoNotas, setSavedGrupoNotas] = useState("");
  const [grupoNotas, setGrupoNotasState] = useState("");
  const [notasActualizadoEn, setNotasActualizadoEn] = useState<string | null>(null);
  const [notasEstado, setNotasEstado] = useState<
    "sin-cambios" | "cambios-sin-guardar" | "guardando" | "guardado" | "error"
  >("sin-cambios");
  const [notasError, setNotasError] = useState("");
  const [addStudentsModalVisible, setAddStudentsModalVisible] = useState(false);
  const [createStudentMode, setCreateStudentMode] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [isLinkingStudents, setIsLinkingStudents] = useState(false);
  const [addStudentsError, setAddStudentsError] = useState("");
  const [addStudentsSuccessVisible, setAddStudentsSuccessVisible] = useState(false);
  const [createdAndAddedCount, setCreatedAndAddedCount] = useState(0);
  const [newStudentNombre, setNewStudentNombre] = useState("");
  const [newStudentApellidos, setNewStudentApellidos] = useState("");
  const [newStudentNumeroControl, setNewStudentNumeroControl] = useState("");
  const [newStudentCarrera, setNewStudentCarrera] = useState("");
  const [removeStudentModalVisible, setRemoveStudentModalVisible] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<Alumno | null>(null);
  const [isUnlinkingStudent, setIsUnlinkingStudent] = useState(false);
  const [removeStudentError, setRemoveStudentError] = useState("");

  const grupo = obtenerGrupo(grupoId);
  const cantidadAlumnos = grupo?.cantidadAlumnos ?? 0;
  const notasUltimaEdicion = useMemo(() => {
    if (!notasActualizadoEn) return "Sin ediciones";

    const fecha = new Date(notasActualizadoEn);
    if (Number.isNaN(fecha.getTime())) return "Sin ediciones";

    return fecha.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [notasActualizadoEn]);

  const tabs: Tab[] = useMemo(
    () => [
      { id: "alumnos", label: "Alumnos", icon: "people" },
      { id: "calificaciones", label: "Calificaciones", icon: "grade" },
      { id: "asistencias", label: "Asistencias", icon: "event-available" },
      { id: "recursos", label: "Recursos", icon: "folder" },
      { id: "tareas", label: "Tareas", icon: "assignment" },
      { id: "graficas", label: "Gráficas", icon: "analytics" },
      { id: "notas", label: "Notas", icon: "note-alt" },
    ],
    []
  );

  useEffect(() => {
    const notasGuardadas = typeof grupo?.notasPersonales === "string" ? grupo.notasPersonales : "";
    const notasActualizadas =
      typeof grupo?.notasActualizadoEn === "string" ? grupo.notasActualizadoEn : null;

    setSavedGrupoNotas(notasGuardadas);
    setGrupoNotasState(notasGuardadas);
    setNotasActualizadoEn(notasActualizadas);
    setNotasEstado("sin-cambios");
    setNotasError("");
  }, [grupo?.id, grupo?.notasPersonales, grupo?.notasActualizadoEn]);

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

  const availableStudents = useMemo(() => {
    const query = studentSearchQuery.trim().toLowerCase();
    return allAlumnos
      .filter((alumno) => alumno.grupoId !== grupoId)
      .filter((alumno) => {
        if (!query) return true;
        return (
          `${alumno.nombre} ${alumno.apellidos}`.toLowerCase().includes(query) ||
          alumno.numeroControl.toLowerCase().includes(query)
        );
      });
  }, [allAlumnos, grupoId, studentSearchQuery]);

  const openAddStudentsModal = useCallback(() => {
    setAddStudentsError("");
    setStudentSearchQuery("");
    setSelectedStudentIds([]);
    setCreateStudentMode(false);
    setAddStudentsModalVisible(true);
  }, []);

  const closeAddStudentsModal = useCallback(() => {
    if (isLinkingStudents) return;
    setAddStudentsModalVisible(false);
    setCreateStudentMode(false);
    setAddStudentsError("");
  }, [isLinkingStudents]);

  const openCreateStudentMode = useCallback(() => {
    setCreateStudentMode(true);
    setAddStudentsError("");
  }, []);

  const closeCreateStudentMode = useCallback(() => {
    if (isLinkingStudents) return;
    setCreateStudentMode(false);
    setAddStudentsError("");
  }, [isLinkingStudents]);

  const toggleStudentSelection = useCallback((studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
    setAddStudentsError("");
  }, []);

  const persistAlumnosAndCount = useCallback(
    async (nextAlumnos: Alumno[]) => {
      await AsyncStorage.setItem("@planearia:alumnos", JSON.stringify(nextAlumnos));
      setAllAlumnos(nextAlumnos);
      const alumnosDelGrupo = nextAlumnos.filter((alumno) => alumno.grupoId === grupoId);
      setAlumnos(alumnosDelGrupo);
      await actualizarGrupo(grupoId, { cantidadAlumnos: alumnosDelGrupo.length });
      setCreatedAndAddedCount(alumnosDelGrupo.length);
    },
    [grupoId, actualizarGrupo]
  );

  const confirmAddSelectedStudents = useCallback(async () => {
    if (selectedStudentIds.length === 0) {
      setAddStudentsError("Selecciona al menos un alumno para agregar.");
      return;
    }

    try {
      setIsLinkingStudents(true);
      setAddStudentsError("");
      const nextAlumnos = allAlumnos.map((alumno) =>
        selectedStudentIds.includes(alumno.id) ? { ...alumno, grupoId } : alumno
      );

      await persistAlumnosAndCount(nextAlumnos);
      setAddStudentsModalVisible(false);
      setAddStudentsSuccessVisible(true);
      setSelectedStudentIds([]);
    } catch {
      setAddStudentsError("No se pudieron agregar los alumnos. Intenta nuevamente.");
    } finally {
      setIsLinkingStudents(false);
    }
  }, [allAlumnos, grupoId, persistAlumnosAndCount, selectedStudentIds]);

  const createAndAddStudent = useCallback(async () => {
    if (
      !newStudentNombre.trim() ||
      !newStudentApellidos.trim() ||
      !newStudentNumeroControl.trim()
    ) {
      setAddStudentsError("Completa nombre, apellidos y número de control.");
      return;
    }

    try {
      setIsLinkingStudents(true);
      setAddStudentsError("");
      const maxId = allAlumnos.reduce((max, alumno) => Math.max(max, alumno.id), 0);
      const nuevoAlumno: Alumno = {
        id: maxId + 1,
        nombre: newStudentNombre.trim(),
        apellidos: newStudentApellidos.trim(),
        numeroControl: newStudentNumeroControl.trim(),
        grupoId,
        carrera: (newStudentCarrera || "ISC") as Alumno["carrera"],
        fechaIngreso: new Date(),
        estado: "activo",
      };

      const nextAlumnos = [...allAlumnos, nuevoAlumno];
      await persistAlumnosAndCount(nextAlumnos);

      setNewStudentNombre("");
      setNewStudentApellidos("");
      setNewStudentNumeroControl("");
      setNewStudentCarrera("");
      setCreateStudentMode(false);
      setAddStudentsModalVisible(false);
      setAddStudentsSuccessVisible(true);
    } catch {
      setAddStudentsError("No se pudo crear y agregar el alumno.");
    } finally {
      setIsLinkingStudents(false);
    }
  }, [
    allAlumnos,
    grupoId,
    newStudentApellidos,
    newStudentCarrera,
    newStudentNombre,
    newStudentNumeroControl,
    persistAlumnosAndCount,
  ]);

  const closeAddStudentsSuccess = useCallback(() => {
    setAddStudentsSuccessVisible(false);
  }, []);

  const openRemoveStudentModal = useCallback((student: Alumno) => {
    setStudentToRemove(student);
    setRemoveStudentError("");
    setRemoveStudentModalVisible(true);
  }, []);

  const closeRemoveStudentModal = useCallback(() => {
    if (isUnlinkingStudent) return;
    setRemoveStudentModalVisible(false);
    setStudentToRemove(null);
    setRemoveStudentError("");
  }, [isUnlinkingStudent]);

  const confirmRemoveStudentFromGroup = useCallback(async () => {
    if (!studentToRemove) {
      setRemoveStudentError("No se encontró el alumno para desvincular.");
      return;
    }

    try {
      setIsUnlinkingStudent(true);
      setRemoveStudentError("");

      const nextAlumnos = allAlumnos.map((alumno) =>
        alumno.id === studentToRemove.id ? { ...alumno, grupoId: undefined } : alumno
      );

      await persistAlumnosAndCount(nextAlumnos);
      setRemoveStudentModalVisible(false);
      setStudentToRemove(null);
    } catch {
      setRemoveStudentError("No se pudo quitar al alumno del grupo. Intenta nuevamente.");
    } finally {
      setIsUnlinkingStudent(false);
    }
  }, [allAlumnos, persistAlumnosAndCount, studentToRemove]);

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

  const navigateReportesGrupo = useCallback(() => {
    navigation.navigate("ReportesGrupo", {
      grupoId,
      grupoNombre,
    });
  }, [navigation, grupoId, grupoNombre]);

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

  const setGrupoNotas = useCallback(
    (value: string) => {
      setGrupoNotasState(value);
      setNotasEstado(value === savedGrupoNotas ? "sin-cambios" : "cambios-sin-guardar");
      setNotasError("");
    },
    [savedGrupoNotas]
  );

  const descartarCambiosNotas = useCallback(() => {
    setGrupoNotasState(savedGrupoNotas);
    setNotasEstado("sin-cambios");
    setNotasError("");
  }, [savedGrupoNotas]);

  const guardarNotasGrupo = useCallback(async () => {
    if (grupoNotas === savedGrupoNotas) {
      setNotasEstado("sin-cambios");
      return;
    }

    try {
      setNotasEstado("guardando");
      setNotasError("");
      const nowIso = new Date().toISOString();

      await actualizarGrupo(grupoId, {
        notasPersonales: grupoNotas,
        notasActualizadoEn: nowIso,
      });

      setSavedGrupoNotas(grupoNotas);
      setNotasActualizadoEn(nowIso);
      setNotasEstado("guardado");
    } catch {
      setNotasEstado("error");
      setNotasError("No se pudieron guardar las notas. Intenta nuevamente.");
    }
  }, [actualizarGrupo, grupoId, grupoNotas, savedGrupoNotas]);

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
    grupoNotas,
    notasUltimaEdicion,
    notasEstado,
    notasError,
    reloadDetalleData,
    addStudentsModalVisible,
    createStudentMode,
    studentSearchQuery,
    selectedStudentIds,
    availableStudents,
    isLinkingStudents,
    addStudentsError,
    addStudentsSuccessVisible,
    createdAndAddedCount,
    newStudentNombre,
    newStudentApellidos,
    newStudentNumeroControl,
    newStudentCarrera,
    setStudentSearchQuery,
    openAddStudentsModal,
    closeAddStudentsModal,
    openCreateStudentMode,
    closeCreateStudentMode,
    toggleStudentSelection,
    confirmAddSelectedStudents,
    setNewStudentNombre,
    setNewStudentApellidos,
    setNewStudentNumeroControl,
    setNewStudentCarrera,
    createAndAddStudent,
    closeAddStudentsSuccess,
    removeStudentModalVisible,
    studentToRemove,
    isUnlinkingStudent,
    removeStudentError,
    openRemoveStudentModal,
    closeRemoveStudentModal,
    confirmRemoveStudentFromGroup,
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
    navigateReportesGrupo,
    setGrupoNotas,
    guardarNotasGrupo,
    descartarCambiosNotas,
  };
};
