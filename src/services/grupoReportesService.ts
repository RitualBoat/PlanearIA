import type { Alumno, Asistencia, Calificacion, EntregaTarea, Tarea } from "../../types";

export interface EstadisticasGrupo {
  promedioGeneral: number;
  indiceAprobacion: number;
  indiceReprobacion: number;
  indiceAsistencia: number;
  indiceEntregasATiempo: number;
  indiceEntregasTarde: number;
  indiceNoEntregadas: number;
  totalEsperadas: number;
}

interface CalculoInput {
  alumnos: Alumno[];
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

export const calcularEstadisticasGrupo = ({
  alumnos,
  calificaciones,
  asistencias,
  tareas,
  entregas,
}: CalculoInput): EstadisticasGrupo => {
  const promedioGeneral =
    calificaciones.length > 0
      ? calificaciones.reduce((acc, item) => acc + Number(item.promedio || 0), 0) /
        calificaciones.length
      : 0;

  const aprobados = calificaciones.filter((item) => item.estado === "aprobado").length;
  const reprobados = calificaciones.filter((item) => item.estado === "reprobado").length;
  const presentes = asistencias.filter((item) => item.estado === "presente").length;

  const indiceAprobacion = porcentaje(aprobados, calificaciones.length);
  const indiceReprobacion = porcentaje(reprobados, calificaciones.length);
  const indiceAsistencia = porcentaje(presentes, asistencias.length);

  const tareasById = new Map(tareas.map((tarea) => [tarea.id, tarea]));
  const totalEsperadas = alumnos.length * tareas.length;

  let entregadasATiempo = 0;
  let entregadasTarde = 0;

  for (const entrega of entregas) {
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

  const noEntregadas = Math.max(totalEsperadas - (entregadasATiempo + entregadasTarde), 0);

  return {
    promedioGeneral,
    indiceAprobacion,
    indiceReprobacion,
    indiceAsistencia,
    indiceEntregasATiempo: porcentaje(entregadasATiempo, totalEsperadas),
    indiceEntregasTarde: porcentaje(entregadasTarde, totalEsperadas),
    indiceNoEntregadas: porcentaje(noEntregadas, totalEsperadas),
    totalEsperadas,
  };
};
