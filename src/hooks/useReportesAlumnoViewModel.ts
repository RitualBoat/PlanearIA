import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import type { Calificacion } from "../../types";
import {
  calcularEstadisticasAlumno,
  type EstadisticasAlumno,
} from "../services/alumnoReportesService";
import { classroomRepository } from "../services/classroom/classroomRepository";
import { exportarReporteAlumno } from "../services/reportesExportService";

type Nav = StackNavigationProp<RootStackParamList, "ReportesAlumno">;
type Route = RouteProp<RootStackParamList, "ReportesAlumno">;

export type PeriodoReporteAlumno = "Semana" | "Mes" | "Bimestre" | "Personalizado";
export type EstadoReporteAlumno = "loading" | "success" | "empty" | "error";

export interface CalificacionTablaItem {
  id: number;
  periodo: string;
  promedio: number;
  estado: Calificacion["estado"];
  fechaRegistro: Date;
}

export interface TareaResumenItem {
  id: number;
  titulo: string;
  entregadas: number;
  esperadas: number;
  promedio: number;
  estado: "perfecto" | "en progreso" | "pendiente";
}

export interface UseReportesAlumnoViewModel {
  alumnoId: number;
  alumnoNombre: string;
  grupoNombre: string;
  periodo: PeriodoReporteAlumno;
  setPeriodo: (value: PeriodoReporteAlumno) => void;
  estado: EstadoReporteAlumno;
  errorCodigo: string;
  estadisticas: EstadisticasAlumno;
  promedioGrupo: number;
  diferenciaVsGrupo: number;
  serieRendimiento: number[];
  tablaCalificaciones: CalificacionTablaItem[];
  tareasResumen: TareaResumenItem[];
  recargar: () => Promise<void>;
  exportarReporte: (formato: "pdf" | "image") => Promise<boolean>;
  goBack: () => void;
}

const defaultStats: EstadisticasAlumno = {
  promedioGeneral: 0,
  indiceAsistencia: 0,
  indiceEntregasATiempo: 0,
  indiceEntregasTarde: 0,
  indiceNoEntregadas: 0,
  totalCalificaciones: 0,
  totalAsistencias: 0,
  totalEntregasEsperadas: 0,
  totalEntregasRealizadas: 0,
};

const isInRange = (value: string | Date | undefined, start: Date): boolean => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date >= start;
};

export const useReportesAlumnoViewModel = (): UseReportesAlumnoViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { alumnoId, alumnoNombre: alumnoNombreParam } = route.params;

  const [alumnoNombre, setAlumnoNombre] = useState(alumnoNombreParam || "Alumno");
  const [grupoNombre, setGrupoNombre] = useState("Grupo sin asignar");
  const [periodo, setPeriodo] = useState<PeriodoReporteAlumno>("Mes");
  const [estado, setEstado] = useState<EstadoReporteAlumno>("loading");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [estadisticas, setEstadisticas] = useState<EstadisticasAlumno>(defaultStats);
  const [promedioGrupo, setPromedioGrupo] = useState(0);
  const [diferenciaVsGrupo, setDiferenciaVsGrupo] = useState(0);
  const [serieRendimiento, setSerieRendimiento] = useState<number[]>([65, 70, 72, 75]);
  const [tablaCalificaciones, setTablaCalificaciones] = useState<CalificacionTablaItem[]>([]);
  const [tareasResumen, setTareasResumen] = useState<TareaResumenItem[]>([]);

  const daysByPeriod = useMemo(
    () => ({
      Semana: 7,
      Mes: 30,
      Bimestre: 60,
      Personalizado: 3650,
    }),
    []
  );

  const recargar = useCallback(async () => {
    try {
      setEstado("loading");
      setErrorCodigo("");

      const dataset = await classroomRepository.readDataset();
      const alumnos = dataset.alumnos;
      const tareas = dataset.actividades;
      const asistencias = dataset.asistencias;
      const calificaciones = dataset.calificaciones;
      const entregas = dataset.entregas;

      const alumno = alumnos.find((item) => item.id === alumnoId);
      if (alumno) {
        const fullName = `${alumno.nombre || ""} ${alumno.apellidos || ""}`.trim();
        if (fullName.length > 0) {
          setAlumnoNombre(fullName);
        }
        if (alumno.grupoId) {
          const grupo = dataset.grupos.find((item) => item.id === alumno.grupoId);
          setGrupoNombre(grupo?.nombre ?? `Grupo ${alumno.grupoId}`);
        } else {
          setGrupoNombre("Grupo sin asignar");
        }
      }

      const start = new Date();
      start.setDate(start.getDate() - daysByPeriod[periodo]);

      const tareasAlumno = tareas.filter(
        (item) =>
          (alumno?.grupoId ? item.grupoId === alumno.grupoId : true) &&
          isInRange(item.fechaEntrega, start)
      );

      const calificacionesAlumno = calificaciones
        .filter((item) => item.alumnoId === alumnoId && isInRange(item.fechaRegistro, start))
        .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());

      const alumnosGrupo = alumnos.filter((item) => item.grupoId === alumno?.grupoId);

      const calificacionesGrupo = calificaciones.filter(
        (item) =>
          (alumno?.grupoId ? item.grupoId === alumno.grupoId : false) &&
          isInRange(item.fechaRegistro, start)
      );

      const asistenciasAlumno = asistencias.filter(
        (item) => item.alumnoId === alumnoId && isInRange(item.fecha, start)
      );

      const tareasIds = new Set(tareasAlumno.map((item) => item.id));
      const entregasAlumno = entregas.filter(
        (item) => item.alumnoId === alumnoId && tareasIds.has(item.tareaId)
      );

      const stats = calcularEstadisticasAlumno(alumnoId, {
        calificaciones: calificacionesAlumno,
        asistencias: asistenciasAlumno,
        tareas: tareasAlumno,
        entregas: entregasAlumno,
      });

      setEstadisticas(stats);

      const promedioGrupoCalc =
        calificacionesGrupo.length > 0
          ? calificacionesGrupo.reduce((acc, item) => acc + Number(item.promedio || 0), 0) /
            calificacionesGrupo.length
          : 0;
      setPromedioGrupo(promedioGrupoCalc);
      setDiferenciaVsGrupo(stats.promedioGeneral - promedioGrupoCalc);

      const topByDate = [...calificacionesAlumno]
        .sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime())
        .slice(-4);

      const serieBase =
        topByDate.length > 0
          ? topByDate.map((item) => Math.max(0, Math.min(100, Number(item.promedio || 0) * 10)))
          : [55, 60, 66, 70];
      setSerieRendimiento(serieBase);

      setTablaCalificaciones(
        calificacionesAlumno.map((item) => ({
          id: item.id,
          periodo: item.periodo,
          promedio: Number(item.promedio || 0),
          estado: item.estado,
          fechaRegistro: new Date(item.fechaRegistro),
        }))
      );

      const tareasData: TareaResumenItem[] = tareasAlumno.slice(0, 3).map((tarea) => {
        const entregasTarea = entregas.filter((item) => item.tareaId === tarea.id);
        const entregaAlumno = entregasTarea.find((item) => item.alumnoId === alumnoId);
        const entregadas = entregasTarea.filter((item) => item.estado !== "pendiente").length;
        const esperadas = Math.max(alumnosGrupo.length, 1);

        const estadoTarea: TareaResumenItem["estado"] = !entregaAlumno
          ? "pendiente"
          : entregaAlumno.estado === "tarde" || entregaAlumno.estado === "pendiente"
            ? "en progreso"
            : "perfecto";

        return {
          id: tarea.id,
          titulo: tarea.titulo,
          entregadas,
          esperadas,
          promedio: Number(
            entregaAlumno?.calificacion ??
              (entregaAlumno ? stats.promedioGeneral : Math.max(stats.promedioGeneral - 0.8, 0))
          ),
          estado: estadoTarea,
        };
      });
      setTareasResumen(tareasData);

      const hasAnyData =
        calificacionesAlumno.length > 0 ||
        asistenciasAlumno.length > 0 ||
        entregasAlumno.length > 0;
      setEstado(hasAnyData ? "success" : "empty");
    } catch {
      setErrorCodigo("ERR_ALUMNO_REPORT_TIMEOUT");
      setEstado("error");
    }
  }, [alumnoId, daysByPeriod, periodo]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const exportarReporte = useCallback(
    async (formato: "pdf" | "image"): Promise<boolean> => {
      return exportarReporteAlumno({
        formato,
        alumnoNombre,
        periodo,
        estadisticas,
        calificaciones: tablaCalificaciones,
      });
    },
    [alumnoNombre, estadisticas, periodo, tablaCalificaciones]
  );

  return {
    alumnoId,
    alumnoNombre,
    grupoNombre,
    periodo,
    setPeriodo,
    estado,
    errorCodigo,
    estadisticas,
    promedioGrupo,
    diferenciaVsGrupo,
    serieRendimiento,
    tablaCalificaciones,
    tareasResumen,
    recargar,
    exportarReporte,
    goBack,
  };
};
