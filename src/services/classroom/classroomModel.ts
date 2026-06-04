import type {
  Alumno,
  Asistencia,
  Calificacion,
  EntregaTarea,
  Grupo,
  ID,
  Recurso,
  Tarea,
} from "../../../types";
import type {
  ClassroomActividadReciente,
  ClassroomDataset,
  ClassroomEntityAudit,
  ClassroomGrupo,
  ClassroomPendiente,
  ClassroomResumen,
} from "../../../types/classroom";

const DEFAULT_DATE = "1970-01-01T00:00:00.000Z";

export interface BuildClassroomModelResult {
  grupo: ClassroomGrupo;
  resumen: ClassroomResumen;
  actividadReciente: ClassroomActividadReciente[];
  pendientes: ClassroomPendiente[];
}

export function buildClassroomModel(dataset: ClassroomDataset): BuildClassroomModelResult {
  const grupo = buildClassroomGrupo(dataset);

  return {
    grupo,
    resumen: buildClassroomResumen(dataset),
    actividadReciente: buildClassroomActividadReciente(dataset),
    pendientes: buildClassroomPendientes(dataset),
  };
}

export function buildClassroomGrupo(dataset: ClassroomDataset): ClassroomGrupo {
  const grupo = dataset.grupo;
  const alumnos = filterByGrupoId(dataset.alumnos, grupo.id);

  return {
    id: grupo.id,
    nombre: grupo.nombre ?? "Grupo sin nombre",
    materia: grupo.materia ?? "Materia sin definir",
    periodo: grupo.periodo ?? "Periodo sin definir",
    estado: grupo.estado ?? "desconocido",
    totalAlumnos: alumnos.length,
    raw: grupo,
    audit: buildAuditFromGrupo(grupo),
  };
}

export function buildClassroomResumen(dataset: ClassroomDataset): ClassroomResumen {
  const grupo = dataset.grupo;
  const grupoId = grupo.id;
  const alumnos = filterByGrupoId(dataset.alumnos, grupoId);
  const actividades = filterByGrupoId(dataset.actividades, grupoId);
  const materiales = filterByGrupoId(dataset.materiales, grupoId);
  const asistencias = filterByGrupoId(dataset.asistencias, grupoId);
  const calificaciones = filterByGrupoId(dataset.calificaciones, grupoId);

  return {
    grupoId,
    grupoNombre: grupo.nombre ?? "Grupo sin nombre",
    materia: grupo.materia ?? "Materia sin definir",
    periodo: grupo.periodo ?? "Periodo sin definir",
    estado: grupo.estado ?? "desconocido",
    totalAlumnos: alumnos.length,
    totalActividades: actividades.length,
    actividadesPendientes: actividades.filter((actividad) => actividad.estado !== "finalizada").length,
    totalMateriales: materiales.length,
    porcentajeAsistencia: calculateAttendancePercentage(asistencias),
    promedioGrupo: calculateGroupAverage(calificaciones),
    ultimaActualizacion: getLatestDate([
      grupo.fechaCreacion,
      ...actividades.map((actividad) => actividad.fechaAsignacion),
      ...materiales.map((material) => material.fechaModificacion ?? material.fechaCreacion),
      ...asistencias.map((asistencia) => asistencia.fecha),
      ...calificaciones.map((calificacion) => calificacion.fechaRegistro),
    ]),
    audit: buildAuditFromGrupo(grupo),
  };
}

export function buildClassroomActividadReciente(
  dataset: ClassroomDataset,
  limit = 8,
): ClassroomActividadReciente[] {
  const grupoId = dataset.grupo.id;
  const actividades = filterByGrupoId(dataset.actividades, grupoId).map((tarea) => ({
    id: `tarea-${tarea.id}`,
    grupoId,
    tipo: normalizeActividadTipo(tarea.tipo),
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    fecha: toIsoDate(tarea.fechaAsignacion ?? tarea.fechaEntrega),
    estado: tarea.estado,
    entidadId: tarea.id,
    entidadOrigen: "tarea" as const,
  }));

  const materiales = filterByGrupoId(dataset.materiales, grupoId).map((recurso) => ({
    id: `recurso-${recurso.id}`,
    grupoId,
    tipo: "material" as const,
    titulo: recurso.titulo,
    descripcion: recurso.descripcion,
    fecha: toIsoDate(recurso.fechaModificacion ?? recurso.fechaCreacion),
    estado: recurso.acceso,
    entidadId: recurso.id,
    entidadOrigen: "recurso" as const,
  }));

  const asistencias = filterByGrupoId(dataset.asistencias, grupoId).map((asistencia) => ({
    id: `asistencia-${asistencia.id}`,
    grupoId,
    tipo: "asistencia" as const,
    titulo: "Asistencia registrada",
    descripcion: asistencia.observaciones,
    fecha: toIsoDate(asistencia.fecha),
    estado: asistencia.estado,
    entidadId: asistencia.id,
    entidadOrigen: "asistencia" as const,
  }));

  const calificaciones = filterByGrupoId(dataset.calificaciones, grupoId).map((calificacion) => ({
    id: `calificacion-${calificacion.id}`,
    grupoId,
    tipo: "calificacion" as const,
    titulo: "Calificacion registrada",
    descripcion: calificacion.observaciones,
    fecha: toIsoDate(calificacion.fechaRegistro),
    estado: calificacion.estado,
    entidadId: calificacion.id,
    entidadOrigen: "calificacion" as const,
  }));

  return [...actividades, ...materiales, ...asistencias, ...calificaciones]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit);
}

export function buildClassroomPendientes(dataset: ClassroomDataset): ClassroomPendiente[] {
  const grupoId = dataset.grupo.id;
  const tareasPendientes = filterByGrupoId(dataset.actividades, grupoId)
    .filter((tarea) => tarea.estado !== "finalizada")
    .map((tarea) => ({
      id: `pendiente-tarea-${tarea.id}`,
      grupoId,
      tipo: "entrega_pendiente" as const,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      prioridad: tarea.estado === "asignada" ? "alta" as const : "media" as const,
      entidadId: tarea.id,
      fechaLimite: toIsoDate(tarea.fechaEntrega),
    }));

  const calificacionesPendientes = filterByGrupoId(dataset.calificaciones, grupoId)
    .filter((calificacion) => calificacion.estado === "pendiente")
    .map((calificacion) => ({
      id: `pendiente-calificacion-${calificacion.id}`,
      grupoId,
      tipo: "calificacion_pendiente" as const,
      titulo: "Calificacion pendiente",
      descripcion: calificacion.observaciones,
      prioridad: "media" as const,
      entidadId: calificacion.id,
    }));

  const entregasPendientes = filterEntregasByGrupoId(dataset.entregas, grupoId, dataset.actividades)
    .filter((entrega) => !entrega.calificada)
    .map((entrega) => ({
      id: `pendiente-entrega-${entrega.id}`,
      grupoId,
      tipo: "actividad_sin_calificar" as const,
      titulo: "Entrega sin calificar",
      descripcion: entrega.comentarioAlumno,
      prioridad: "alta" as const,
      entidadId: entrega.id,
      fechaLimite: toIsoDate(entrega.fechaEntrega),
    }));

  return [...tareasPendientes, ...calificacionesPendientes, ...entregasPendientes];
}

function filterByGrupoId<T extends { grupoId?: ID }>(items: T[] | undefined, grupoId: ID): T[] {
  return (items ?? []).filter((item) => item.grupoId === grupoId);
}

function filterEntregasByGrupoId(
  entregas: EntregaTarea[] | undefined,
  grupoId: ID,
  tareas: Tarea[] | undefined,
): EntregaTarea[] {
  const tareasDelGrupo = new Set(filterByGrupoId(tareas, grupoId).map((tarea) => tarea.id));
  return (entregas ?? []).filter((entrega) => tareasDelGrupo.has(entrega.tareaId));
}

function calculateAttendancePercentage(asistencias: Asistencia[]): number {
  if (asistencias.length === 0) {
    return 0;
  }

  const presentes = asistencias.filter((asistencia) => asistencia.estado === "presente").length;
  return Math.round((presentes / asistencias.length) * 100);
}

function calculateGroupAverage(calificaciones: Calificacion[]): number {
  const values = calificaciones
    .map((calificacion) => Number(calificacion.promedio))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

function getLatestDate(values: Array<string | Date | undefined>): string | undefined {
  const timestamps = values
    .map((value) => new Date(toIsoDate(value)).getTime())
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) {
    return undefined;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function toIsoDate(value: string | Date | undefined): string {
  if (!value) {
    return DEFAULT_DATE;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : DEFAULT_DATE;
}

function normalizeActividadTipo(tipo: Tarea["tipo"]): ClassroomActividadReciente["tipo"] {
  if (tipo === "tarea" || tipo === "examen" || tipo === "proyecto" || tipo === "investigacion") {
    return tipo;
  }

  return "tarea";
}

function buildAuditFromGrupo(grupo: Partial<Grupo>): ClassroomEntityAudit {
  return {
    grupoId: grupo.id,
    fechaCreacion: grupo.fechaCreacion,
    syncStatus: "unknown",
  };
}
