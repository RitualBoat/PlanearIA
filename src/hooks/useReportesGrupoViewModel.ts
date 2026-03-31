import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import type { Alumno, Asistencia, Calificacion, EntregaTarea, Tarea } from "../../types";
import {
  calcularEstadisticasGrupo,
  type EstadisticasGrupo,
} from "../services/grupoReportesService";

type Nav = StackNavigationProp<RootStackParamList, "ReportesGrupo">;
type Route = RouteProp<RootStackParamList, "ReportesGrupo">;

export type PeriodoReporte = "Semana" | "Mes" | "Bimestre" | "Personalizado";
export type EstadoReporte = "loading" | "success" | "empty" | "error";

export interface UseReportesGrupoViewModel {
  grupoId: number;
  grupoNombre: string;
  periodo: PeriodoReporte;
  setPeriodo: (value: PeriodoReporte) => void;
  estado: EstadoReporte;
  errorCodigo: string;
  estadisticas: EstadisticasGrupo;
  serieTendencia: number[];
  recargar: () => Promise<void>;
  goBack: () => void;
}

const defaultStats: EstadisticasGrupo = {
  promedioGeneral: 0,
  indiceAprobacion: 0,
  indiceReprobacion: 0,
  indiceAsistencia: 0,
  indiceEntregasATiempo: 0,
  indiceEntregasTarde: 0,
  indiceNoEntregadas: 0,
  totalEsperadas: 0,
};

const isInRange = (value: string | Date | undefined, start: Date): boolean => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date >= start;
};

export const useReportesGrupoViewModel = (): UseReportesGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { grupoId, grupoNombre } = route.params;

  const [periodo, setPeriodo] = useState<PeriodoReporte>("Mes");
  const [estado, setEstado] = useState<EstadoReporte>("loading");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [estadisticas, setEstadisticas] = useState<EstadisticasGrupo>(defaultStats);
  const [serieTendencia, setSerieTendencia] = useState<number[]>([60, 62, 65, 68]);

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

      const [alumnosRaw, tareasRaw, asistenciasRaw, calificacionesRaw, entregasRaw] =
        await Promise.all([
          AsyncStorage.getItem("@planearia:alumnos"),
          AsyncStorage.getItem("@planearia:tareas"),
          AsyncStorage.getItem("@planearia:asistencias"),
          AsyncStorage.getItem("@planearia:calificaciones"),
          AsyncStorage.getItem("@planearia:entregas"),
        ]);

      const alumnos = (alumnosRaw ? JSON.parse(alumnosRaw) : []) as Alumno[];
      const tareas = (tareasRaw ? JSON.parse(tareasRaw) : []) as Tarea[];
      const asistencias = (asistenciasRaw ? JSON.parse(asistenciasRaw) : []) as Asistencia[];
      const calificaciones = (
        calificacionesRaw ? JSON.parse(calificacionesRaw) : []
      ) as Calificacion[];

      const entregasBase = (entregasRaw ? JSON.parse(entregasRaw) : []) as EntregaTarea[];
      const entregablesFallbackRaw = await AsyncStorage.getItem("@planearia:entregables");
      const entregas =
        entregasBase.length > 0
          ? entregasBase
          : ((entregablesFallbackRaw ? JSON.parse(entregablesFallbackRaw) : []) as EntregaTarea[]);

      const start = new Date();
      start.setDate(start.getDate() - daysByPeriod[periodo]);

      const alumnosGrupo = alumnos.filter((item) => item.grupoId === grupoId);
      const tareasGrupo = tareas.filter(
        (item) => item.grupoId === grupoId && isInRange(item.fechaEntrega, start)
      );
      const tareasIds = new Set(tareasGrupo.map((item) => item.id));
      const asistenciasGrupo = asistencias.filter(
        (item) => item.grupoId === grupoId && isInRange(item.fecha, start)
      );
      const calificacionesGrupo = calificaciones.filter(
        (item) => item.grupoId === grupoId && isInRange(item.fechaRegistro, start)
      );
      const entregasGrupo = entregas.filter((item) => tareasIds.has(item.tareaId));

      const stats = calcularEstadisticasGrupo({
        alumnos: alumnosGrupo,
        tareas: tareasGrupo,
        asistencias: asistenciasGrupo,
        calificaciones: calificacionesGrupo,
        entregas: entregasGrupo,
      });

      setEstadisticas(stats);

      const base = Math.round(stats.indiceAsistencia || 60);
      setSerieTendencia([
        Math.max(base - 4, 0),
        Math.max(base - 2, 0),
        Math.min(base + 3, 100),
        Math.min(base + 6, 100),
      ]);

      const hasAnyData =
        alumnosGrupo.length > 0 ||
        tareasGrupo.length > 0 ||
        asistenciasGrupo.length > 0 ||
        calificacionesGrupo.length > 0;

      setEstado(hasAnyData ? "success" : "empty");
    } catch {
      setErrorCodigo("ERR_CONNECTION_TIMEOUT");
      setEstado("error");
    }
  }, [daysByPeriod, grupoId, periodo]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    grupoId,
    grupoNombre,
    periodo,
    setPeriodo,
    estado,
    errorCodigo,
    estadisticas,
    serieTendencia,
    recargar,
    goBack,
  };
};
