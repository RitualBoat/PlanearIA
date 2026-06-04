import type {
  Alumno,
  Asistencia,
  Calificacion,
  EntregaTarea,
  Grupo,
  ID,
  Recurso,
  Tarea,
} from "./index";
import type { UnidadClassroom } from "./unidadClassroom";

export type ClassroomSectionId =
  | "inicio"
  | "alumnos"
  | "actividades"
  | "materiales"
  | "asistencia"
  | "calificaciones"
  | "reportes"
  | "configuracion";

export type ClassroomSyncStatus =
  | "synced"
  | "pending"
  | "error"
  | "offline"
  | "unknown";

export interface ClassroomEntityAudit {
  userId?: string;
  grupoId?: ID;
  fechaCreacion?: string | Date;
  fechaModificacion?: string | Date;
  syncStatus?: ClassroomSyncStatus;
  deletedAt?: string | Date;
}

export interface ClassroomGrupo {
  id: ID;
  nombre: string;
  materia: string;
  periodo: string;
  estado: Grupo["estado"] | "desconocido";
  totalAlumnos: number;
  raw: Grupo | Partial<Grupo>;
  audit: ClassroomEntityAudit;
}

export type ClassroomActividadTipo =
  | "tarea"
  | "examen"
  | "proyecto"
  | "investigacion"
  | "material"
  | "asistencia"
  | "calificacion"
  | "reporte";

export type ClassroomEntidadOrigen =
  | "tarea"
  | "recurso"
  | "asistencia"
  | "calificacion"
  | "entrega"
  | "sistema";

export interface ClassroomActividadReciente {
  id: string;
  grupoId: ID;
  tipo: ClassroomActividadTipo;
  titulo: string;
  descripcion?: string;
  fecha: string;
  estado?: string;
  entidadId?: ID | string;
  entidadOrigen: ClassroomEntidadOrigen;
}

export type ClassroomPendienteTipo =
  | "actividad_sin_calificar"
  | "entrega_pendiente"
  | "asistencia_pendiente"
  | "calificacion_pendiente"
  | "sync_pendiente"
  | "revision_docente";

export interface ClassroomPendiente {
  id: string;
  grupoId: ID;
  tipo: ClassroomPendienteTipo;
  titulo: string;
  descripcion?: string;
  prioridad: "baja" | "media" | "alta";
  entidadId?: ID | string;
  fechaLimite?: string;
}

export interface ClassroomResumen {
  grupoId: ID;
  grupoNombre: string;
  materia: string;
  periodo: string;
  estado: Grupo["estado"] | "desconocido";
  totalAlumnos: number;
  totalActividades: number;
  actividadesPendientes: number;
  totalMateriales: number;
  porcentajeAsistencia: number;
  promedioGrupo: number;
  ultimaActualizacion?: string;
  audit: ClassroomEntityAudit;
}

export type ClassroomGrupoInput = Pick<Grupo, "id"> & Partial<Grupo>;

export interface ClassroomDataset {
  grupo: ClassroomGrupoInput;
  alumnos?: Alumno[];
  unidades?: UnidadClassroom[];
  actividades?: Tarea[];
  materiales?: Recurso[];
  asistencias?: Asistencia[];
  calificaciones?: Calificacion[];
  entregas?: EntregaTarea[];
}

export interface ClassroomRouteMap {
  entradaPrincipal: "GruposTab";
  dashboardGrupo: "DetalleGrupo";
  crearGrupo: "CrearGrupo";
  listaGrupos: "ListaGrupos";
  alumnos: "ListaAlumnos";
  asistencia: "RegistrarAsistencia" | "HistorialAsistencia";
  calificaciones: "CapturarCalificaciones" | "PromediosCalificaciones";
  actividades: "CrearTareaGrupo" | "DetalleTarea" | "ListaEntregables";
  materiales: "ListaRecursos" | "RecursosDidacticos";
}
