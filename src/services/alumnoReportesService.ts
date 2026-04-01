import type { Asistencia, Calificacion, EntregaTarea, Tarea } from "../../types";

export interface EstadisticasAlumno {
  promedioGeneral: number;
  indiceAsistencia: number;
  indiceEntregasATiempo: number;
  indiceEntregasTarde: number;
  indiceNoEntregadas: number;
  totalCalificaciones: number;
  totalAsistencias: number;
  totalEntregasEsperadas: number;
  totalEntregasRealizadas: number;
}

interface CalculoAlumnoInput {
  calificaciones: Calificacion[];
  asistencias: Asistencia[];
  tareas: Tarea[];
  entregas: EntregaTarea[];
}

const porcentaje = (parte: number, total: number): number => {
  if (total <= 0) return 0;
  return (parte / total) * 100;
};

const toDate = (value: string | Date | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const calcularEstadisticasAlumno = (
  alumnoId: number,
  { calificaciones, asistencias, tareas, entregas }: CalculoAlumnoInput
): EstadisticasAlumno => {
  const calificacionesAlumno = calificaciones.filter((item) => item.alumnoId === alumnoId);
  const asistenciasAlumno = asistencias.filter((item) => item.alumnoId === alumnoId);
  const entregasAlumno = entregas.filter((item) => item.alumnoId === alumnoId);

  const promedioGeneral =
    calificacionesAlumno.length > 0
      ? calificacionesAlumno.reduce((acc, item) => acc + Number(item.promedio || 0), 0) /
        calificacionesAlumno.length
      : 0;

  const presentes = asistenciasAlumno.filter((item) => item.estado === "presente").length;
  const indiceAsistencia = porcentaje(presentes, asistenciasAlumno.length);

  const tareasById = new Map(tareas.map((tarea) => [tarea.id, tarea]));
  const totalEsperadas = tareas.length;

  let entregadasATiempo = 0;
  let entregadasTarde = 0;

  for (const entrega of entregasAlumno) {
    const tarea = tareasById.get(entrega.tareaId);
    if (!tarea) continue;

    const dueDate = toDate(tarea.fechaEntrega);
    const submissionDate = toDate(entrega.fechaEntrega);

    const marcadaComoTarde = entrega.estado === "tarde";
    const tardePorFecha =
      dueDate !== null && submissionDate !== null && submissionDate.getTime() > dueDate.getTime();

    if (marcadaComoTarde || tardePorFecha) {
      entregadasTarde += 1;
    } else {
      entregadasATiempo += 1;
    }
  }

  const totalEntregasRealizadas = entregadasATiempo + entregadasTarde;
  const noEntregadas = Math.max(totalEsperadas - totalEntregasRealizadas, 0);

  return {
    promedioGeneral,
    indiceAsistencia,
    indiceEntregasATiempo: porcentaje(entregadasATiempo, totalEsperadas),
    indiceEntregasTarde: porcentaje(entregadasTarde, totalEsperadas),
    indiceNoEntregadas: porcentaje(noEntregadas, totalEsperadas),
    totalCalificaciones: calificacionesAlumno.length,
    totalAsistencias: asistenciasAlumno.length,
    totalEntregasEsperadas: totalEsperadas,
    totalEntregasRealizadas,
  };
};
