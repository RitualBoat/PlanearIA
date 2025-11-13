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
 * Interfaz para Estudiantes/Alumnos
 */
export interface Alumno extends BaseEntity {
  nombre: string;
  apellidos: string;
  numeroControl: string;
  sem: string; // Semestre (ej: "7A", "8B")
  carrera: Carrera;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  fechaIngreso: Date;
  estado: "activo" | "inactivo" | "egresado" | "baja";
}

/**
 * Interfaz para Calificaciones
 */
export interface Calificacion extends BaseEntity {
  alumnoId: ID;
  materiaId: ID;
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
 * Interfaz para Tareas/Exámenes
 */
export interface Tarea extends BaseEntity {
  titulo: string;
  descripcion: string;
  tipo: "tarea" | "examen" | "proyecto" | "investigacion";
  materiaId: ID;
  fechaAsignacion: Date;
  fechaEntrega: Date;
  valor: number; // Porcentaje o puntos
  instrucciones: string;
  recursosNecesarios?: string[];
  estado: "asignada" | "en_progreso" | "entregada" | "calificada";
  calificacionMaxima: number;
}

/**
 * Interfaz para Recursos Didácticos
 */
export interface Recurso extends BaseEntity {
  titulo: string;
  tipo:
    | "diapositiva"
    | "video"
    | "documento"
    | "imagen"
    | "audio"
    | "enlace"
    | "otro";
  descripcion: string;
  archivo?: string; // Ruta del archivo
  url?: string; // Para enlaces externos
  materiaId?: ID;
  tags: string[];
  fechaCreacion: Date;
  fechaModificacion: Date;
  tamaño?: number; // En bytes
  formato?: string; // Extensión del archivo
  acceso: "publico" | "privado" | "restringido";
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
  sem: string;
  carrera: Carrera;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  fechaIngreso: string;
}

/**
 * Datos del formulario de Calificación
 */
export interface CalificacionFormData {
  alumnoId: ID;
  materiaId: ID;
  periodo: string;
  parcial1?: number;
  parcial2?: number;
  parcial3?: number;
  final?: number;
  observaciones?: string;
}

/**
 * Datos del formulario de Tarea
 */
export interface TareaFormData {
  titulo: string;
  descripcion: string;
  tipo: "tarea" | "examen" | "proyecto" | "investigacion";
  materiaId: ID;
  fechaAsignacion: string;
  fechaEntrega: string;
  valor: number;
  instrucciones: string;
  recursosNecesarios?: string[];
  calificacionMaxima: number;
}

/**
 * Datos del formulario de Recurso
 */
export interface RecursoFormData {
  titulo: string;
  tipo:
    | "diapositiva"
    | "video"
    | "documento"
    | "imagen"
    | "audio"
    | "enlace"
    | "otro";
  descripcion: string;
  archivo?: File; // Para subida de archivos
  url?: string;
  materiaId?: ID;
  tags: string[];
  acceso: "publico" | "privado" | "restringido";
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
