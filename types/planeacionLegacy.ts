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
 * Configuración del curso universitario
 */
export interface ConfiguracionCurso {
  duracionSemanas: 12 | 16 | 18;
  horasTeoricas: number;
  horasPracticas: number;
  horasAutonomas: number;
  creditos: number;
  modalidad: "presencial" | "hibrida" | "virtual";
}

/**
 * Tipos de evaluación universitaria
 */
export enum TipoEvaluacion {
  EXAMEN = "examen",
  PROYECTO = "proyecto",
  TAREA = "tarea",
  PRESENTACION = "presentacion",
  PRACTICA = "practica",
  PARTICIPACION = "participacion",
  ENSAYO = "ensayo",
  INVESTIGACION = "investigacion",
}

/**
 * Evaluación del curso con criterios
 */
export interface Evaluacion {
  id: string;
  nombre: string;
  tipo: TipoEvaluacion;
  semana: number;
  porcentaje: number;
  descripcion: string;
  criterios: string[];
}

/**
 * Actividad presencial detallada
 */
export interface ActividadPresencial {
  descripcion: string;
  duracion: number; // minutos
  metodologia: string; // ej: "Clase magistral", "Trabajo en equipo", "Laboratorio"
}

/**
 * Semana del plan de estudios universitario
 */
export interface SemanaUniversitaria {
  numero: number;
  unidadTematica: string;
  temas: string[];
  objetivos: string[];
  actividadesPresenciales: ActividadPresencial[];
  actividadesAutonomas: string[];
  recursos: string[];
  entregables?: string;
  evaluacion?: string; // referencia al id de evaluación si aplica
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

  // Estructura detallada de semanas (si está configurado)
  configuracionCurso?: ConfiguracionCurso;
  semanas?: SemanaUniversitaria[];
  evaluaciones?: Evaluacion[];
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
