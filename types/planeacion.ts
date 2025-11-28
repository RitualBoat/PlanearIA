/**
 * Tipos y enums para el sistema de planeaciones
 */

/**
 * Niveles académicos disponibles
 */
export enum NivelAcademico {
  PRIMARIA = "primaria",
  SECUNDARIA = "secundaria",
  PREPARATORIA = "preparatoria",
  UNIVERSIDAD = "universidad",
}

/**
 * Estructura de una actividad dentro de la planeación
 */
export interface Actividad {
  tipo: "inicio" | "desarrollo" | "cierre";
  descripcion: string;
  duracion: number; // en minutos
}

/**
 * Interfaz base para todas las planeaciones
 */
export interface PlaneacionBase {
  id: string;
  nivelAcademico: NivelAcademico;
  asignatura: string;
  grado: string;
  grupo: string;
  fecha: string; // ISO string
  horaInicio: string; // HH:mm
  duracionTotal: number; // minutos
  unidadTematica: string;
  temaSesion: string;
  aprendizajesEsperados: string[];
  actividades: Actividad[];
  recursos: string[];
  evaluacion: string;
  evidencias: string[];
  observaciones: string;
  fechaCreacion: string; // ISO string
  fechaModificacion: string; // ISO string
}

/**
 * Planeación específica para Primaria
 */
export interface PlaneacionPrimaria extends PlaneacionBase {
  nivelAcademico: NivelAcademico.PRIMARIA;
  campoFormativo: string; // Lenguaje y Comunicación, Pensamiento Matemático, etc.
  ejeTransversal?: string;
}

/**
 * Planeación específica para Secundaria
 */
export interface PlaneacionSecundaria extends PlaneacionBase {
  nivelAcademico: NivelAcademico.SECUNDARIA;
  competenciasDisciplinares: string[];
  productoFinal?: string;
}

/**
 * Planeación específica para Preparatoria/Bachillerato
 */
export interface PlaneacionPreparatoria extends PlaneacionBase {
  nivelAcademico: NivelAcademico.PREPARATORIA;
  competenciasGenericas: string[];
  competenciasDisciplinares: string[];
  bibliografia?: string[];
}

/**
 * Planeación específica para Universidad
 */
export interface PlaneacionUniversidad extends PlaneacionBase {
  nivelAcademico: NivelAcademico.UNIVERSIDAD;
  competenciasProfesionales: string[];
  objetivosAprendizaje: string[];
  bibliografia: string[];
  modalidad: "presencial" | "hibrida" | "virtual";
}

/**
 * Tipo union para cualquier tipo de planeación
 */
export type Planeacion =
  | PlaneacionPrimaria
  | PlaneacionSecundaria
  | PlaneacionPreparatoria
  | PlaneacionUniversidad;

/**
 * Filtros para búsqueda de planeaciones
 */
export interface FiltrosPlaneacion {
  nivelAcademico?: NivelAcademico;
  asignatura?: string;
  grado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * Plantilla base para crear nueva planeación
 */
export interface PlantillaPlaneacion {
  nivelAcademico: NivelAcademico;
  duracionDefecto: number;
  camposEspecificos: string[];
}

/**
 * Metadata para estadísticas y dashboard
 */
export interface EstadisticasPlaneaciones {
  total: number;
  porNivel: Record<NivelAcademico, number>;
  ultimaCreacion?: string;
}
