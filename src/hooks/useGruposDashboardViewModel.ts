import { useMemo } from "react";
import { useGruposContext } from "../context/GruposContext";
import { useAlumnos } from "../context/AlumnosContext";
import { useCalificaciones } from "../context/CalificacionesContext";
import { useAsistencias } from "../context/AsistenciaContext";
import { useEntregables } from "../context/EntregablesContext";
import type { Alumno, Grupo, Calificacion, Asistencia, Tarea } from "../../types";

// ─── Types ───

export interface DashboardKPIs {
  totalAlumnos: number;
  promedioGeneral: number;
  indiceAsistencia: number;
  entregasPendientes: number;
  gruposActivos: number;
}

export interface GrupoMiniStats {
  id: number;
  nombre: string;
  materia: string;
  cantidadAlumnos: number;
  estado: string;
  promedio: number;
  asistencia: number;
  pendientes: number;
}

export type AlertaTipo = "critico" | "alerta" | "info";

export interface AlertaAlumno {
  alumnoId: number;
  nombre: string;
  apellidos: string;
  grupoNombre: string;
  tipo: AlertaTipo;
  mensaje: string;
}

export type QuickActionType = "calificar" | "tarea" | "reportes" | "asistencia";

export interface QuickAction {
  id: QuickActionType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface UseGruposDashboardResult {
  // State
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;

  // Data
  kpis: DashboardKPIs;
  gruposConStats: GrupoMiniStats[];
  alertas: AlertaAlumno[];
  quickActions: QuickAction[];

  // Actions
  recargar: () => Promise<void>;
}

// ─── Helpers ───

const calcPromedioGrupo = (grupoId: number, calificaciones: Calificacion[]): number => {
  const cals = calificaciones.filter((c) => c.grupoId === grupoId);
  if (cals.length === 0) return 0;
  const sum = cals.reduce((acc, c) => acc + Number(c.promedio || 0), 0);
  return Math.round((sum / cals.length) * 10) / 10;
};

const calcAsistenciaGrupo = (grupoId: number, asistencias: Asistencia[]): number => {
  const asis = asistencias.filter((a) => a.grupoId === grupoId);
  if (asis.length === 0) return 0;
  const presentes = asis.filter((a) => a.estado === "presente").length;
  return Math.round((presentes / asis.length) * 100);
};

const calcPendientesGrupo = (grupoId: number, entregables: Tarea[]): number => {
  return entregables.filter((e) => e.grupoId === grupoId && e.estado !== "finalizada").length;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "calificar",
    label: "Calificar",
    icon: "rate-review",
    color: "#004580",
    bgColor: "#d4e3ff",
  },
  { id: "tarea", label: "Tarea", icon: "assignment", color: "#EA6C00", bgColor: "#FFF3E0" },
  { id: "reportes", label: "Reportes", icon: "analytics", color: "#7B1FA2", bgColor: "#F3E5F5" },
  {
    id: "asistencia",
    label: "Asistencia",
    icon: "fact-check",
    color: "#00796B",
    bgColor: "#E0F2F1",
  },
];

// ─── Hook ───

export const useGruposDashboardViewModel = (): UseGruposDashboardResult => {
  const { grupos, isLoading: gruposLoading, error: gruposError, reloadGrupos } = useGruposContext();

  const { alumnos, isLoading: alumnosLoading } = useAlumnos();
  const { calificaciones, isLoading: calificacionesLoading } = useCalificaciones();
  const { asistencias, isLoading: asistenciasLoading } = useAsistencias();
  const { entregables, isLoading: entregablesLoading } = useEntregables();

  const isLoading =
    gruposLoading ||
    alumnosLoading ||
    calificacionesLoading ||
    asistenciasLoading ||
    entregablesLoading;

  const gruposActivos = useMemo(
    () => grupos.filter((g) => g.estado === "activo") as Grupo[],
    [grupos]
  );

  const kpis = useMemo<DashboardKPIs>(() => {
    const grupoIds = new Set(gruposActivos.map((g) => g.id));
    const alumnosDeGrupos = alumnos.filter((a) => a.grupoId && grupoIds.has(a.grupoId));
    const totalAlumnos =
      alumnosDeGrupos.length || gruposActivos.reduce((acc, g) => acc + (g.cantidadAlumnos || 0), 0);

    const calsRelevantes = calificaciones.filter((c) => grupoIds.has(c.grupoId));
    const promedioGeneral =
      calsRelevantes.length > 0
        ? Math.round(
            (calsRelevantes.reduce((acc, c) => acc + Number(c.promedio || 0), 0) /
              calsRelevantes.length) *
              10
          ) / 10
        : 0;

    const asisRelevantes = asistencias.filter((a) => grupoIds.has(a.grupoId));
    const presentes = asisRelevantes.filter((a) => a.estado === "presente").length;
    const indiceAsistencia =
      asisRelevantes.length > 0 ? Math.round((presentes / asisRelevantes.length) * 100) : 0;

    const entregasPendientes = entregables.filter(
      (e) => grupoIds.has(e.grupoId) && e.estado !== "finalizada"
    ).length;

    return {
      totalAlumnos,
      promedioGeneral,
      indiceAsistencia,
      entregasPendientes,
      gruposActivos: gruposActivos.length,
    };
  }, [gruposActivos, alumnos, calificaciones, asistencias, entregables]);

  const gruposConStats = useMemo<GrupoMiniStats[]>(() => {
    return gruposActivos.map((grupo) => ({
      id: grupo.id,
      nombre: grupo.nombre,
      materia: grupo.materia,
      cantidadAlumnos: grupo.cantidadAlumnos || 0,
      estado: grupo.estado,
      promedio: calcPromedioGrupo(grupo.id, calificaciones),
      asistencia: calcAsistenciaGrupo(grupo.id, asistencias),
      pendientes: calcPendientesGrupo(grupo.id, entregables),
    }));
  }, [gruposActivos, calificaciones, asistencias, entregables]);

  const alertas = useMemo<AlertaAlumno[]>(() => {
    const result: AlertaAlumno[] = [];
    const grupoIds = new Set(gruposActivos.map((g) => g.id));
    const grupoMap = new Map(gruposActivos.map((g) => [g.id, g.nombre]));

    // Alumnos con bajo promedio
    const alumnosActivosEnGrupos = alumnos.filter(
      (a) => a.grupoId && grupoIds.has(a.grupoId) && a.estado === "activo"
    );

    for (const alumno of alumnosActivosEnGrupos) {
      const cals = calificaciones.filter((c) => c.alumnoId === alumno.id);
      const promedio =
        cals.length > 0
          ? cals.reduce((acc, c) => acc + Number(c.promedio || 0), 0) / cals.length
          : -1;

      if (promedio >= 0 && promedio < 6) {
        result.push({
          alumnoId: alumno.id,
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          grupoNombre: grupoMap.get(alumno.grupoId!) || "",
          tipo: "critico",
          mensaje: `Promedio bajo (${promedio.toFixed(1)})`,
        });
      }

      // Faltas consecutivas (últimas 3 asistencias ausente)
      const asisAlumno = asistencias
        .filter((a) => a.alumnoId === alumno.id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      if (asisAlumno.length >= 3) {
        const ultimas3 = asisAlumno.slice(0, 3);
        const todasAusente = ultimas3.every((a) => a.estado === "ausente");
        if (todasAusente) {
          result.push({
            alumnoId: alumno.id,
            nombre: alumno.nombre,
            apellidos: alumno.apellidos,
            grupoNombre: grupoMap.get(alumno.grupoId!) || "",
            tipo: "critico",
            mensaje: "3 faltas consecutivas",
          });
        }
      }
    }

    // Limit to top 5 alerts, prioritize "critico" over "alerta"
    return result
      .sort((a, b) => {
        if (a.tipo === "critico" && b.tipo !== "critico") return -1;
        if (a.tipo !== "critico" && b.tipo === "critico") return 1;
        return 0;
      })
      .slice(0, 5);
  }, [gruposActivos, alumnos, calificaciones, asistencias]);

  const recargar = async () => {
    await reloadGrupos();
  };

  return {
    isLoading,
    error: gruposError,
    isEmpty: gruposActivos.length === 0 && !isLoading,
    kpis,
    gruposConStats,
    alertas,
    quickActions: QUICK_ACTIONS,
    recargar,
  };
};
