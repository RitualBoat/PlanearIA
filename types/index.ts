/**
 * Archivo central para todos los tipos TypeScript de la aplicación
 * Aquí definimos las interfaces y tipos que se usarán en toda la app
 */
// ==========================================
// TIPOS BÁSICOS DE LA APLICACIÓN
// ==========================================
/**
 * Tipo para identificadores únicos
 */
export type ID = number;
/**
 * Carreras disponibles en el sistema
 */
export type Carrera = "ISC" | "IGE" | "ARQ" | "ITICS";
// ==========================================
// INTERFACES DE ENTIDADES PRINCIPALES
// ==========================================
/**
 * Interfaz base para entidades que tienen ID
 */
export interface BaseEntity {
  id: ID;
}

/**
 * Interfaz para Planeaciones Docentes
 */
export interface Planeacion extends BaseEntity {
  titulo: string;
  materia: string;
  carrera: Carrera;
  semestre: number;
  objetivo: string;
  contenido: string;
  metodologia: string;
  evaluacion: string;
  recursos: string[];
  fechaInicio: Date;
  fechaFin: Date;
  horasTeoricas: number;
  horasPracticas: number;
  profesorId?: ID;
  estado: "borrador" | "activa" | "completada" | "archivada";
}

/**
 * Interfaz para Grupos
 * Un grupo agrupa a los alumnos de una materia específica
 */
export interface Grupo extends BaseEntity {
  nombre: string; // Ej: "7A - Matemáticas", "Grupo ISC 5to"
  materia: string;
  carrera: Carrera;
  semestre: number;
  periodo: string; // Ej: "Enero-Junio 2024"
  profesorId: ID;
  cantidadAlumnos: number;
  estado: "activo" | "inactivo" | "finalizado";
  fechaCreacion: Date;
  horario?: string; // Ej: "Lun-Mie-Vie 7:00-9:00"
  notasPersonales?: string;
  notasActualizadoEn?: string;
}

/**
 * Interfaz para Estudiantes/Alumnos
 */
export interface Alumno extends BaseEntity {
  nombre: string;
  apellidos: string;
  numeroControl: string;
  grupoId?: ID; // Relación con el grupo
  carrera: Carrera;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  fechaIngreso: Date;
  estado: "activo" | "inactivo" | "egresado" | "baja";
  fotoPerfil?: string; // URL o ruta de la foto
}

/**
 * Interfaz para Calificaciones
 */
export interface Calificacion extends BaseEntity {
  alumnoId: ID;
  grupoId: ID;
  periodo: string;
  parcial1?: number;
  parcial2?: number;
  parcial3?: number;
  final?: number;
  promedio: number;
  estado: "aprobado" | "reprobado" | "pendiente";
  observaciones?: string;
  fechaRegistro: Date;
}

/**
 * Interfaz para Asistencias
 */
export interface Asistencia extends BaseEntity {
  alumnoId: ID;
  grupoId: ID;
  fecha: Date;
  estado: "presente" | "ausente" | "retardo" | "justificada";
  observaciones?: string;
  hora?: string;
}

/**
 * Interfaz para Comentarios/Notas sobre Alumnos
 */
export interface ComentarioAlumno extends BaseEntity {
  alumnoId: ID;
  grupoId: ID;
  profesorId: ID;
  comentario: string;
  tipo: "academico" | "conductual" | "logro" | "area_mejora" | "general";
  privado: boolean; // Si es privado solo el profesor lo ve
  fecha: Date;
}

/**
 * Interfaz para Tareas/Exámenes
 * ⭐ ACTUALIZADO: Ahora está relacionado con grupos, no materias
 */
export interface Tarea extends BaseEntity {
  titulo: string;
  descripcion: string;
  tipo: "tarea" | "examen" | "proyecto" | "investigacion";
  grupoId: ID; // ⭐ Cambio: ahora relacionado con grupo específico
  recursoId?: ID; // ⭐ Opcional: si la tarea está basada en un recurso (ej: examen)
  fechaAsignacion: Date;
  fechaEntrega: Date;
  valor: number; // Porcentaje o puntos
  instrucciones: string;
  recursosNecesarios?: string[];
  estado: "asignada" | "en_progreso" | "finalizada";
  calificacionMaxima: number;
  profesorId: ID;
  permitirEntregaTardia: boolean;
  fechaLimiteEntregaTardia?: Date;
}

/**
 * Interfaz para Entregas de Tareas
 * ⭐ NUEVO: Representa la entrega individual de un alumno
 */
export interface EntregaTarea extends BaseEntity {
  tareaId: ID;
  alumnoId: ID;
  fechaEntrega: Date;
  archivo?: string; // Ruta o URL del archivo entregado
  comentarioAlumno?: string;
  calificacion?: number;
  calificada: boolean;
  retroalimentacion?: string; // Comentario del profesor
  estado: "pendiente" | "entregada" | "tarde" | "calificada";
  intentos: number; // Número de intentos de entrega
}

/**
 * Interfaz para Recursos Didácticos
 * ⭐ ACTUALIZADO: Ahora con opciones de asignación y exportación
 */
export interface Recurso extends BaseEntity {
  titulo: string;
  tipo:
    | "examen"
    | "presentacion"
    | "mapa_mental"
    | "linea_tiempo"
    | "video"
    | "documento"
    | "imagen"
    | "audio"
    | "enlace"
    | "otro";
  descripcion: string;
  archivo?: string; // Ruta del archivo
  url?: string; // Para enlaces externos
  grupoId?: ID; // ⭐ Grupo al que está asignado (opcional)
  asignadoComoTarea: boolean; // ⭐ NUEVO: Si está asignado como tarea
  tareaId?: ID; // ⭐ NUEVO: ID de la tarea si está asignado
  tags: string[];
  fechaCreacion: Date;
  fechaModificacion: Date;
  tamaño?: number; // En bytes
  formato?: string; // Extensión del archivo
  formatosExportacion?: string[]; // ⭐ NUEVO: ["pdf", "docx", "pptx", "png", "mp4"]
  acceso: "publico" | "privado" | "restringido";
  origen: "manual" | "ia" | "plantilla"; // Cómo se creó
  profesorId: ID;
  versionActual: number; // Para control de versiones
}

/**
 * Interfaz para Configuración de Seguridad
 */
export interface ConfiguracionSeguridad extends BaseEntity {
  usuarioId: ID;
  configuraciones: {
    autenticacionDosFactor: boolean;
    notificacionesEmail: boolean;
    notificacionesPush: boolean;
    sesionAutomatica: boolean;
    tiempoSesion: number; // En minutos
    backupAutomatico: boolean;
    exportarDatos: boolean;
  };
  ultimaActualizacion: Date;
}

/**
 * Interfaz para información del Usuario/Profesor
 */
export interface Usuario extends BaseEntity {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: "profesor" | "administrador" | "coordinador";
  carrera: Carrera;
  especialidad?: string;
  fechaRegistro: Date;
  ultimaConexion?: Date;
  configuracionSeguridad?: ConfiguracionSeguridad;
  estado: "activo" | "inactivo" | "suspendido";
}

// ==========================================
// TIPOS PARA COMPONENTES UI
// ==========================================
/**
 * Props para componentes de Card/Tarjeta
 */
export interface CardProps {
  titulo: string;
  subtitulo?: string;
  onPress?: () => void;
  icono?: string;
  imagen?: any; // Para require() de imágenes
}
/**
 * Props para componentes de Modal
 */
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
  children?: React.ReactNode;
}
/**
 * Props para componentes de Lista
 */
export interface ListItemProps<T> {
  item: T;
  onPress?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}
// ==========================================
// TIPOS PARA FORMULARIOS
// ==========================================
/**
 * Datos del formulario de Login
 */
export interface LoginFormData {
  username: string;
  password: string;
}

/**
 * Datos del formulario de Planeación
 */
export interface PlaneacionFormData {
  titulo: string;
  materia: string;
  carrera: Carrera;
  semestre: number;
  objetivo: string;
  contenido: string;
  metodologia: string;
  evaluacion: string;
  recursos: string[];
  fechaInicio: string; // Como string para formularios
  fechaFin: string;
  horasTeoricas: number;
  horasPracticas: number;
}

/**
 * Datos del formulario de Alumno
 */
export interface AlumnoFormData {
  nombre: string;
  apellidos: string;
  numeroControl: string;
  grupoId?: ID;
  carrera: Carrera;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  fechaIngreso: string;
}

/**
 * Datos del formulario de Grupo
 */
export interface GrupoFormData {
  nombre: string;
  materia: string;
  carrera: Carrera;
  semestre: number;
  periodo: string;
  horario?: string;
}

/**
 * Datos del formulario de Calificación
 */
export interface CalificacionFormData {
  alumnoId: ID;
  grupoId: ID;
  periodo: string;
  parcial1?: number;
  parcial2?: number;
  parcial3?: number;
  final?: number;
  observaciones?: string;
}

/**
 * Datos del formulario de Asistencia
 */
export interface AsistenciaFormData {
  alumnoId: ID;
  grupoId: ID;
  fecha: string;
  estado: "presente" | "ausente" | "retardo" | "justificada";
  observaciones?: string;
  hora?: string;
}

/**
 * Datos del formulario de Comentario
 */
export interface ComentarioFormData {
  alumnoId: ID;
  grupoId: ID;
  comentario: string;
  tipo: "academico" | "conductual" | "logro" | "area_mejora" | "general";
  privado: boolean;
}

/**
 * Datos del formulario de Tarea
 * ⭐ ACTUALIZADO: Ahora con grupoId y recursoId opcional
 */
export interface TareaFormData {
  titulo: string;
  descripcion: string;
  tipo: "tarea" | "examen" | "proyecto" | "investigacion";
  grupoId: ID; // ⭐ Específico del grupo
  recursoId?: ID; // ⭐ Opcional: si se basa en un recurso
  fechaAsignacion: string;
  fechaEntrega: string;
  valor: number;
  instrucciones: string;
  recursosNecesarios?: string[];
  calificacionMaxima: number;
  permitirEntregaTardia: boolean;
  fechaLimiteEntregaTardia?: string;
}

/**
 * Datos del formulario de Entrega de Tarea
 * ⭐ NUEVO: Para cuando un alumno entrega una tarea
 */
export interface EntregaTareaFormData {
  tareaId: ID;
  alumnoId: ID;
  archivo?: File;
  comentarioAlumno?: string;
}

/**
 * Datos del formulario de Calificación de Entrega
 * ⭐ NUEVO: Para cuando el profesor califica una entrega
 */
export interface CalificarEntregaFormData {
  entregaId: ID;
  calificacion: number;
  retroalimentacion?: string;
}

/**
 * Datos del formulario de Recurso
 * ⭐ ACTUALIZADO: Con opciones de asignación a grupo
 */
export interface RecursoFormData {
  titulo: string;
  tipo:
    | "examen"
    | "presentacion"
    | "mapa_mental"
    | "linea_tiempo"
    | "video"
    | "documento"
    | "imagen"
    | "audio"
    | "enlace"
    | "otro";
  descripcion: string;
  archivo?: File; // Para subida de archivos
  url?: string;
  tags: string[];
  acceso: "publico" | "privado" | "restringido";
  origen: "manual" | "ia" | "plantilla";
  // ⭐ NUEVO: Opciones de asignación
  asignarAGrupo: boolean; // Si se debe asignar directamente a un grupo
  grupoId?: ID; // ID del grupo si se asigna
  fechaEntrega?: string; // Fecha de entrega si se asigna como tarea
  valorTarea?: number; // Valor en puntos si se asigna como tarea
}

/**
 * Datos del formulario de Configuración de Seguridad
 */
export interface SeguridadFormData {
  autenticacionDosFactor: boolean;
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  sesionAutomatica: boolean;
  tiempoSesion: number;
  backupAutomatico: boolean;
  exportarDatos: boolean;
}

// ==========================================
// TIPOS PARA GESTIÓN DE ESTADOS
// ==========================================
/**
 * Estados de carga para operaciones asíncronas
 */
export type LoadingState = "idle" | "loading" | "success" | "error";
/**
 * Estructura para manejo de errores
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}
/**
 * Estado general de una pantalla con datos
 */
export interface ScreenState<T> {
  data: T[];
  loading: LoadingState;
  error: ErrorState;
}
// ==========================================
// TIPOS PARA NAVEGACIÓN (Complementarios)
// ==========================================
/**
 * Props que reciben las pantallas de navegación
 */
export interface ScreenProps<T = any> {
  navigation: any; // Tipo básico, se puede mejorar después
  route: {
    params?: T;
  };
}
/**
 * Parámetros específicos para pantallas de detalle
 */
export interface DetailScreenParams {
  id: ID;
  nombre: string;
}
// ==========================================
// TIPOS UTILITARIOS
// ==========================================
/**
 * Hace todas las propiedades opcionales excepto el ID
 */
export type PartialExceptId<T extends BaseEntity> = {
  id: ID;
} & Partial<Omit<T, "id">>;
/**
 * Omite el ID para crear nuevos elementos
 */
export type CreateEntity<T extends BaseEntity> = Omit<T, "id">;
/**
 * Para operaciones CRUD
 */
export type CRUDOperation = "create" | "read" | "update" | "delete";

// ==========================================
// CONSTANTES DE TIPO
// ==========================================
/**
 * Colores principales de la aplicación
 */
export const COLORS = {
  primary: "#2196F3", // Azul cielo principal (Material Blue)
  secondary: "#87CEEB", // Azul cielo más claro para acentos
  background: "#f8fbff", // Fondo con tinte azul muy suave
  surface: "#ffffff", // Blanco para superficies
  error: "#f44336", // Rojo para los errores
  text: "#1a1a1a", // Negro para el texto
  textSecondary: "#6b7280", // Gris azulado para texto secundario
};
/**
 * Tamaños de fuente estándar
 */
export const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 24,
};

// ==========================================
// EXPORTS FROM PLANEACION MODULE
// ==========================================
export {
  SemanaUniversitaria,
  ActividadPresencial,
  ConfiguracionCurso,
  Evaluacion,
  TipoEvaluacion,
} from "./planeacion";
