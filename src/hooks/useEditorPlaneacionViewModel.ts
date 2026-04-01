import { useState, useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/StackNavigator";
import {
  NivelAcademico,
  Planeacion,
  PlaneacionBase,
  PlaneacionUniversidad,
  Actividad,
  ConfiguracionCurso,
  SemanaUniversitaria,
  Evaluacion,
} from "../../types/planeacion";
import { usePlaneaciones } from "../sync/providers/SyncProvider";
import logger from "../utils/logger";
import { useUniversityDetailMode } from "./useUniversityDetailMode";

type Nav = StackNavigationProp<RootStackParamList, "EditorPlaneacion">;
type Route = RouteProp<RootStackParamList, "EditorPlaneacion">;

export interface EditorPlaneacionViewModel {
  // Route params
  nivel: NivelAcademico;
  modo: "crear" | "editar";

  // General fields
  asignatura: string;
  grado: string;
  grupo: string;
  fecha: string;
  horaInicio: string;
  duracionTotal: string;
  unidadTematica: string;
  temaSesion: string;
  aprendizajesEsperados: string;

  // Activities
  actividadInicio: string;
  duracionInicio: string;
  actividadDesarrollo: string;
  duracionDesarrollo: string;
  actividadCierre: string;
  duracionCierre: string;

  // Resources / evaluation
  recursos: string;
  evaluacion: string;
  evidencias: string;
  observaciones: string;

  // Level-specific
  campoFormativo: string;
  competenciasDisciplinares: string;
  competenciasGenericas: string;
  competenciasProfesionales: string;
  objetivosAprendizaje: string;
  bibliografia: string;
  modalidad: string;

  // University detailed mode
  modoDetallado: boolean;
  configuracionCurso: ConfiguracionCurso;
  semanas: SemanaUniversitaria[];
  evaluaciones: Evaluacion[];
  semanasVersion: number;

  // Setters for simple fields
  setAsignatura: (v: string) => void;
  setGrado: (v: string) => void;
  setGrupo: (v: string) => void;
  setFecha: (v: string) => void;
  setHoraInicio: (v: string) => void;
  setDuracionTotal: (v: string) => void;
  setUnidadTematica: (v: string) => void;
  setTemaSesion: (v: string) => void;
  setAprendizajesEsperados: (v: string) => void;
  setActividadInicio: (v: string) => void;
  setDuracionInicio: (v: string) => void;
  setActividadDesarrollo: (v: string) => void;
  setDuracionDesarrollo: (v: string) => void;
  setActividadCierre: (v: string) => void;
  setDuracionCierre: (v: string) => void;
  setRecursos: (v: string) => void;
  setEvaluacion: (v: string) => void;
  setEvidencias: (v: string) => void;
  setObservaciones: (v: string) => void;
  setCampoFormativo: (v: string) => void;
  setCompetenciasDisciplinares: (v: string) => void;
  setCompetenciasGenericas: (v: string) => void;
  setCompetenciasProfesionales: (v: string) => void;
  setObjetivosAprendizaje: (v: string) => void;
  setBibliografia: (v: string) => void;
  setModalidad: (v: string) => void;
  setConfiguracionCurso: (v: ConfiguracionCurso) => void;
  setEvaluaciones: (v: Evaluacion[]) => void;

  // Actions
  toggleModoDetallado: () => void;
  cambiarDuracionCurso: (d: 12 | 16 | 18) => void;
  actualizarSemana: (semana: SemanaUniversitaria) => void;
  eliminarSemana: (numero: number) => void;
  clonarSemana: (numero: number) => void;
  handleGuardar: () => Promise<void>;
  obtenerTitulo: () => string;
}

export const useEditorPlaneacionViewModel = (): EditorPlaneacionViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { nivel, modo, planeacionId } = route.params;
  const { agregarPlaneacion, actualizarPlaneacion, obtenerPlaneacion } = usePlaneaciones();

  // General fields
  const [asignatura, setAsignatura] = useState("");
  const [grado, setGrado] = useState("");
  const [grupo, setGrupo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [duracionTotal, setDuracionTotal] = useState("50");
  const [unidadTematica, setUnidadTematica] = useState("");
  const [temaSesion, setTemaSesion] = useState("");
  const [aprendizajesEsperados, setAprendizajesEsperados] = useState("");

  // Activities
  const [actividadInicio, setActividadInicio] = useState("");
  const [duracionInicio, setDuracionInicio] = useState("10");
  const [actividadDesarrollo, setActividadDesarrollo] = useState("");
  const [duracionDesarrollo, setDuracionDesarrollo] = useState("30");
  const [actividadCierre, setActividadCierre] = useState("");
  const [duracionCierre, setDuracionCierre] = useState("10");

  // Resources / evaluation
  const [recursos, setRecursos] = useState("");
  const [evaluacion, setEvaluacion] = useState("");
  const [evidencias, setEvidencias] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Level-specific
  const [campoFormativo, setCampoFormativo] = useState("");
  const [competenciasDisciplinares, setCompetenciasDisciplinares] = useState("");
  const [competenciasGenericas, setCompetenciasGenericas] = useState("");
  const [competenciasProfesionales, setCompetenciasProfesionales] = useState("");
  const [objetivosAprendizaje, setObjetivosAprendizaje] = useState("");
  const [bibliografia, setBibliografia] = useState("");
  const [modalidad, setModalidad] = useState("presencial");

  // University detailed mode (extracted sub-hook)
  const universityMode = useUniversityDetailMode();
  const {
    modoDetallado,
    configuracionCurso,
    semanas,
    evaluaciones,
    semanasVersion,
    setConfiguracionCurso,
    setEvaluaciones,
  } = universityMode;

  // --- Helpers ---

  const mostrarAlerta = useCallback((mensaje: string) => {
    if (Platform.OS === "web") {
      window.alert(mensaje);
    } else {
      Alert.alert("Atención", mensaje);
    }
  }, []);

  // --- Load existing data ---

  const cargarDatosPlaneacion = useCallback((planeacion: Planeacion) => {
    setAsignatura(planeacion.asignatura);
    setGrado(planeacion.grado);
    setGrupo(planeacion.grupo);
    setFecha(planeacion.fecha.split("T")[0]);
    setHoraInicio(planeacion.horaInicio);
    setDuracionTotal(planeacion.duracionTotal.toString());
    setUnidadTematica(planeacion.unidadTematica);
    setTemaSesion(planeacion.temaSesion);
    setAprendizajesEsperados(planeacion.aprendizajesEsperados.join("\n"));

    if (planeacion.actividades.length >= 3) {
      setActividadInicio(planeacion.actividades[0].descripcion);
      setDuracionInicio(planeacion.actividades[0].duracion.toString());
      setActividadDesarrollo(planeacion.actividades[1].descripcion);
      setDuracionDesarrollo(planeacion.actividades[1].duracion.toString());
      setActividadCierre(planeacion.actividades[2].descripcion);
      setDuracionCierre(planeacion.actividades[2].duracion.toString());
    }

    setRecursos(planeacion.recursos.join("\n"));
    setEvaluacion(planeacion.evaluacion);
    setEvidencias(planeacion.evidencias.join("\n"));
    setObservaciones(planeacion.observaciones);

    if (planeacion.nivelAcademico === NivelAcademico.PRIMARIA) {
      setCampoFormativo((planeacion as any).campoFormativo || "");
    } else if (planeacion.nivelAcademico === NivelAcademico.SECUNDARIA) {
      setCompetenciasDisciplinares((planeacion as any).competenciasDisciplinares?.join("\n") || "");
    } else if (planeacion.nivelAcademico === NivelAcademico.PREPARATORIA) {
      setCompetenciasGenericas((planeacion as any).competenciasGenericas?.join("\n") || "");
      setCompetenciasDisciplinares((planeacion as any).competenciasDisciplinares?.join("\n") || "");
      setBibliografia((planeacion as any).bibliografia?.join("\n") || "");
    } else if (planeacion.nivelAcademico === NivelAcademico.UNIVERSIDAD) {
      const u = planeacion as PlaneacionUniversidad;
      setCompetenciasProfesionales(u.competenciasProfesionales?.join("\n") || "");
      setObjetivosAprendizaje(u.objetivosAprendizaje?.join("\n") || "");
      setBibliografia(u.bibliografia?.join("\n") || "");
      setModalidad(u.modalidad || "presencial");

      if (u.configuracionCurso && u.semanas) {
        universityMode.setModoDetallado(true);
        universityMode.setConfiguracionCurso(u.configuracionCurso);
        universityMode.setSemanas(u.semanas);
        setEvaluaciones(u.evaluaciones || []);
      }
    }
  }, []);

  useEffect(() => {
    if (modo === "editar" && planeacionId) {
      const planeacion = obtenerPlaneacion(planeacionId);
      if (planeacion) {
        cargarDatosPlaneacion(planeacion);
      }
    }
  }, [modo, planeacionId, obtenerPlaneacion, cargarDatosPlaneacion]);

  // --- Validation & Save ---

  const validarFormulario = useCallback((): boolean => {
    if (!asignatura.trim()) {
      mostrarAlerta("Por favor ingresa la asignatura");
      return false;
    }
    if (!grado.trim()) {
      mostrarAlerta("Por favor ingresa el grado");
      return false;
    }
    if (!temaSesion.trim()) {
      mostrarAlerta("Por favor ingresa el tema de la sesión");
      return false;
    }
    return true;
  }, [asignatura, grado, temaSesion, mostrarAlerta]);

  const handleGuardar = useCallback(async () => {
    if (!validarFormulario()) return;

    const actividades: Actividad[] = [
      {
        tipo: "inicio",
        descripcion: actividadInicio,
        duracion: parseInt(duracionInicio) || 10,
      },
      {
        tipo: "desarrollo",
        descripcion: actividadDesarrollo,
        duracion: parseInt(duracionDesarrollo) || 30,
      },
      {
        tipo: "cierre",
        descripcion: actividadCierre,
        duracion: parseInt(duracionCierre) || 10,
      },
    ];

    const planeacionBase: PlaneacionBase = {
      id: modo === "editar" && planeacionId ? planeacionId : Date.now().toString(),
      nivelAcademico: nivel,
      asignatura,
      grado,
      grupo,
      fecha: new Date(fecha).toISOString(),
      horaInicio,
      duracionTotal: parseInt(duracionTotal) || 50,
      unidadTematica,
      temaSesion,
      aprendizajesEsperados: aprendizajesEsperados.split("\n").filter((a) => a.trim()),
      actividades,
      recursos: recursos.split("\n").filter((r) => r.trim()),
      evaluacion,
      evidencias: evidencias.split("\n").filter((e) => e.trim()),
      observaciones,
      fechaCreacion:
        modo === "editar" && planeacionId
          ? obtenerPlaneacion(planeacionId)?.fechaCreacion || new Date().toISOString()
          : new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
    };

    let planeacion: Planeacion;

    switch (nivel) {
      case NivelAcademico.PRIMARIA:
        planeacion = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.PRIMARIA,
          campoFormativo,
        };
        break;
      case NivelAcademico.SECUNDARIA:
        planeacion = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.SECUNDARIA,
          competenciasDisciplinares: competenciasDisciplinares.split("\n").filter((c) => c.trim()),
        };
        break;
      case NivelAcademico.PREPARATORIA:
        planeacion = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.PREPARATORIA,
          competenciasGenericas: competenciasGenericas.split("\n").filter((c) => c.trim()),
          competenciasDisciplinares: competenciasDisciplinares.split("\n").filter((c) => c.trim()),
          bibliografia: bibliografia.split("\n").filter((b) => b.trim()),
        };
        break;
      case NivelAcademico.UNIVERSIDAD: {
        const planeacionUniv: PlaneacionUniversidad = {
          ...planeacionBase,
          nivelAcademico: NivelAcademico.UNIVERSIDAD,
          competenciasProfesionales: competenciasProfesionales.split("\n").filter((c) => c.trim()),
          objetivosAprendizaje: objetivosAprendizaje.split("\n").filter((o) => o.trim()),
          bibliografia: bibliografia.split("\n").filter((b) => b.trim()),
          modalidad: modalidad as any,
        };

        if (modoDetallado && semanas.length > 0) {
          planeacionUniv.configuracionCurso = configuracionCurso;
          planeacionUniv.semanas = semanas;
          planeacionUniv.evaluaciones = evaluaciones;
        }

        planeacion = planeacionUniv;
        break;
      }
      default:
        return;
    }

    try {
      if (modo === "editar" && planeacionId) {
        await actualizarPlaneacion(planeacionId, planeacion);
        mostrarAlerta("Planeación actualizada exitosamente");
      } else {
        await agregarPlaneacion(planeacion);
        mostrarAlerta("Planeación guardada exitosamente");
      }
      navigation.navigate("ListaPlaneaciones");
    } catch (error) {
      mostrarAlerta("Error al guardar la planeación");
      logger.error("[editor]", error);
    }
  }, [
    validarFormulario,
    nivel,
    modo,
    planeacionId,
    asignatura,
    grado,
    grupo,
    fecha,
    horaInicio,
    duracionTotal,
    unidadTematica,
    temaSesion,
    aprendizajesEsperados,
    actividadInicio,
    duracionInicio,
    actividadDesarrollo,
    duracionDesarrollo,
    actividadCierre,
    duracionCierre,
    recursos,
    evaluacion,
    evidencias,
    observaciones,
    campoFormativo,
    competenciasDisciplinares,
    competenciasGenericas,
    competenciasProfesionales,
    objetivosAprendizaje,
    bibliografia,
    modalidad,
    modoDetallado,
    configuracionCurso,
    semanas,
    evaluaciones,
    obtenerPlaneacion,
    agregarPlaneacion,
    actualizarPlaneacion,
    mostrarAlerta,
    navigation,
  ]);

  const obtenerTitulo = useCallback((): string => {
    const accion = modo === "editar" ? "Editar" : "Nueva";
    const nivelTexto = {
      [NivelAcademico.PRIMARIA]: "Primaria",
      [NivelAcademico.SECUNDARIA]: "Secundaria",
      [NivelAcademico.PREPARATORIA]: "Preparatoria",
      [NivelAcademico.UNIVERSIDAD]: "Universidad",
    };
    return `${accion} Planeación - ${nivelTexto[nivel]}`;
  }, [modo, nivel]);

  return {
    nivel,
    modo,
    asignatura,
    grado,
    grupo,
    fecha,
    horaInicio,
    duracionTotal,
    unidadTematica,
    temaSesion,
    aprendizajesEsperados,
    actividadInicio,
    duracionInicio,
    actividadDesarrollo,
    duracionDesarrollo,
    actividadCierre,
    duracionCierre,
    recursos,
    evaluacion,
    evidencias,
    observaciones,
    campoFormativo,
    competenciasDisciplinares,
    competenciasGenericas,
    competenciasProfesionales,
    objetivosAprendizaje,
    bibliografia,
    modalidad,
    modoDetallado,
    configuracionCurso,
    semanas,
    evaluaciones,
    semanasVersion,
    setAsignatura,
    setGrado,
    setGrupo,
    setFecha,
    setHoraInicio,
    setDuracionTotal,
    setUnidadTematica,
    setTemaSesion,
    setAprendizajesEsperados,
    setActividadInicio,
    setDuracionInicio,
    setActividadDesarrollo,
    setDuracionDesarrollo,
    setActividadCierre,
    setDuracionCierre,
    setRecursos,
    setEvaluacion,
    setEvidencias,
    setObservaciones,
    setCampoFormativo,
    setCompetenciasDisciplinares,
    setCompetenciasGenericas,
    setCompetenciasProfesionales,
    setObjetivosAprendizaje,
    setBibliografia,
    setModalidad,
    setConfiguracionCurso,
    setEvaluaciones,
    toggleModoDetallado: universityMode.toggleModoDetallado,
    cambiarDuracionCurso: universityMode.cambiarDuracionCurso,
    actualizarSemana: universityMode.actualizarSemana,
    eliminarSemana: universityMode.eliminarSemana,
    clonarSemana: universityMode.clonarSemana,
    handleGuardar,
    obtenerTitulo,
  };
};
