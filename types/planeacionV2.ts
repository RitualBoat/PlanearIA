export enum NivelAcademico {
  PRIMARIA = "primaria",
  SECUNDARIA = "secundaria",
  PREPARATORIA = "preparatoria",
  UNIVERSIDAD = "universidad",
}

// --- Metadata Institucional ---
export interface InfoInstitucional {
  institucion: string;
  subsistema?: string;
  cicloEscolar: string;
  lugar?: string;
}

// --- Datos Generales ---
export interface DatosGenerales {
  maestro: string;
  asignatura: string;
  fechaInicio: string; // ISO date
  fechaFin: string; // ISO date
  semanas: number[]; // [33, 34]
  trimestre?: number;
  grado: string;
  grupos: string[]; // ["I", "J", "K", "L"]
}

// --- Elementos Curriculares (NEM) ---
export interface ElementosCurriculares {
  proposito: string;
  producto?: string;
  contenido: string;
  pda: string; // Procesos de Desarrollo Aprendizaje
  campoFormativo: string;
  ejeArticulador: string;
  rasgosPerfilEgreso: string[];
  instrumentoEvaluacion?: string;
}

// --- Sesión Individual ---
export type TipoSesion = "regular" | "suspension" | "proyecto_lectura" | "evaluacion";

export interface Sesion {
  id: string;
  numero: number;
  tipo: TipoSesion;
  motivo?: string; // para suspensiones: "CTE", etc.
  inicio?: string; // Rich text (JSON Tiptap)
  desarrollo?: string; // Rich text (JSON Tiptap)
  cierre?: string; // Rich text (JSON Tiptap)
  tarea?: string; // Opcional
}

// --- Evaluación Estructurada ---
export type TipoInstrumento =
  | "escala_valoracion" // Sí / A veces / No
  | "escala_estimativa" // Excelente / Bueno / Regular / Deficiente
  | "rubrica" // Criterios con niveles de desempeño
  | "lista_cotejo" // Cumple / No cumple
  | "otro";

export interface NivelEscala {
  etiqueta: string; // "Excelente", "Sí", etc.
  valor?: number; // 10, 8, etc.
}

export interface CriterioEvaluacion {
  id: string;
  descripcion: string;
  mejora?: string; // "¿Qué necesito hacer para mejorar?"
}

export interface InstrumentoEvaluacion {
  tipo: TipoInstrumento;
  escala: NivelEscala[];
  criterios: CriterioEvaluacion[];
}

// --- Firmas ---
export interface Firma {
  rol: string; // "Coordinadora académica", "Docente"
  nombre: string;
}

// --- Observaciones ---
export interface Observacion {
  texto: string;
  categoria?: "flexibilidad" | "usaer" | "proyecto" | "general";
}

// --- Documento Planeación V2 ---
export interface PlaneacionDocumento {
  // Identidad
  id: string;
  version: 2;
  userId: string; // Aislamiento por usuario
  nivelAcademico: NivelAcademico;

  // Contenido estructurado
  infoInstitucional: InfoInstitucional;
  datosGenerales: DatosGenerales;
  elementosCurriculares: ElementosCurriculares;
  sesiones: Sesion[];
  evaluacionInicial?: InstrumentoEvaluacion;
  evaluacionFinal?: InstrumentoEvaluacion;
  observaciones: Observacion[];
  firmas: Firma[];

  // Metadata del documento
  plantillaId?: string; // Si fue creado desde plantilla
  contenidoRaw?: string; // JSON serializado del editor Tiptap (documento completo)

  // Campos específicos por nivel (extensibles)
  camposNivel?: Record<string, unknown>;

  // Timestamps
  fechaCreacion: string;
  fechaModificacion: string;

  // Sync
  _syncVersion?: number;
  _deleted?: boolean;
}

// --- Filtros V2 ---
export interface FiltrosPlaneacionV2 {
  nivelAcademico?: NivelAcademico;
  asignatura?: string;
  grado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  maestro?: string;
  busqueda?: string; // Full-text search en contenido
}
