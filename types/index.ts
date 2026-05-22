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
// ROLES Y PERMISOS
// ==========================================

export type RolUsuario = "admin" | "supervisor" | "docente" | "alumno" | "usuario";

export const PERMISOS = {
  GESTIONAR_USUARIOS: "gestionar_usuarios",
  CAMBIAR_ROLES: "cambiar_roles",
  VER_TODOS_GRUPOS: "ver_todos_grupos",
  GESTIONAR_PLANEACIONES: "gestionar_planeaciones",
  GESTIONAR_GRUPOS: "gestionar_grupos",
  GESTIONAR_ALUMNOS: "gestionar_alumnos",
  GESTIONAR_CALIFICACIONES: "gestionar_calificaciones",
  GESTIONAR_ENTREGABLES: "gestionar_entregables",
  GESTIONAR_RECURSOS: "gestionar_recursos",
  GESTIONAR_ASISTENCIA: "gestionar_asistencia",
  VER_PROPIOS_DATOS: "ver_propios_datos",
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

export const PERMISOS_POR_ROL: Record<RolUsuario, Permiso[]> = {
  admin: Object.values(PERMISOS),
  supervisor: [
    PERMISOS.VER_TODOS_GRUPOS,
    PERMISOS.GESTIONAR_PLANEACIONES,
    PERMISOS.GESTIONAR_GRUPOS,
    PERMISOS.GESTIONAR_ALUMNOS,
    PERMISOS.GESTIONAR_CALIFICACIONES,
    PERMISOS.GESTIONAR_ENTREGABLES,
    PERMISOS.GESTIONAR_RECURSOS,
    PERMISOS.GESTIONAR_ASISTENCIA,
    PERMISOS.VER_PROPIOS_DATOS,
  ],
  docente: [
    PERMISOS.GESTIONAR_PLANEACIONES,
    PERMISOS.GESTIONAR_GRUPOS,
    PERMISOS.GESTIONAR_ALUMNOS,
    PERMISOS.GESTIONAR_CALIFICACIONES,
    PERMISOS.GESTIONAR_ENTREGABLES,
    PERMISOS.GESTIONAR_RECURSOS,
    PERMISOS.GESTIONAR_ASISTENCIA,
    PERMISOS.VER_PROPIOS_DATOS,
  ],
  alumno: [PERMISOS.VER_PROPIOS_DATOS],
  usuario: [PERMISOS.VER_PROPIOS_DATOS],
};
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
  miembros?: GrupoMiembro[];
}

/**
 * Roles dentro de un grupo para los colaboradores
 */
export type RolGrupo = "titular" | "co-docente" | "ponente_invitado";

/**
 * Miembro colaborador de un grupo
 */
export interface GrupoMiembro {
  usuarioId: string;
  nombre: string;
  email: string;
  avatar?: string;
  rol: RolGrupo;
  estado: "pendiente" | "activo";
  fechaInvitacion: string;
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
  escuela?: string;
  especialidad?: string;
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
 * Interfaz para Plantillas
 */
export interface Plantilla extends BaseEntity {
  nombre: string;
  tipo: "examen" | "presentacion" | "mapa_mental" | "linea_tiempo" | "postal" | "reporte" | "otro";
  categoria: "diapositivas" | "mapas_mentales" | "examenes" | "postales" | "reportes" | "otros";
  descripcion: string;
  contenido: string; // JSON serializado del contenido de la plantilla
  vistaPrevia?: string; // URI de preview/thumbnail
  tags: string[];
  esDelSistema: boolean; // true = plantilla precargada, false = del usuario
  profesorId?: ID;
  fechaCreacion: Date;
  fechaModificacion: Date;
  usosCount: number; // Cuántas veces se ha usado
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
// TIPOS PARA EL FEED SOCIAL
// ==========================================

export type PostMood = "😊" | "📚" | "💡" | "🎯" | "☕" | "🎨" | "🚀";

export interface PostAttachment {
  type: "image" | "document" | "link";
  url: string;
  name?: string;
  size?: string;
  mimeType?: string;
}

export interface PostComment extends BaseEntity {
  postId: ID;
  autorId: string;
  autorNombre: string;
  autorAvatar?: string;
  contenido: string;
  parentCommentId?: ID;
  likes: number;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface Post extends BaseEntity {
  autorId: string;
  autorNombre: string;
  autorRol?: string;
  autorAvatar?: string;
  titulo?: string;
  contenido: string;
  mood?: PostMood;
  attachments: PostAttachment[];
  likes: number;
  likedBy: string[];
  commentsCount: number;
  savedBy: string[];
  isChallenge?: boolean;
  challengeState?: "sin_contestar" | "cerrado" | "contestado" | "propio";
  challengeData?: {
    titulo: string;
    descripcion: string;
    tiempoLimite?: number;
    preguntas?: number;
    score?: number;
    totalPreguntas?: number;
    ranking?: number;
    totalParticipantes?: number;
    participantesActivos?: number;
    promedio?: number;
    mejorPuntaje?: number;
  };
  fechaCreacion: string;
  fechaModificacion: string;
  syncStatus?: "synced" | "pending" | "error";
}

// ==========================================
// TIPOS PARA EL SISTEMA DE CONTACTOS (Sprint 5)
// ==========================================

export type EstadoConexion = "pendiente" | "aceptada" | "rechazada" | "bloqueada";

export interface Contacto extends BaseEntity {
  usuarioId: string;
  nombre: string;
  apellidos: string;
  email: string;
  materia?: string;
  institucion?: string;
  avatar?: string;
  estado: EstadoConexion;
  enLinea: boolean;
  ultimaConexion?: string;
  fechaConexion: string;
  fechaModificacion: string;
  syncStatus?: "synced" | "pending" | "error";
}

export interface SolicitudConexion extends BaseEntity {
  deUsuarioId: string;
  deUsuarioNombre: string;
  deUsuarioAvatar?: string;
  deUsuarioMateria?: string;
  deUsuarioInstitucion?: string;
  paraUsuarioId: string;
  mensaje?: string;
  estado: "pendiente" | "aceptada" | "rechazada";
  fechaCreacion: string;
  fechaModificacion: string;
  syncStatus?: "synced" | "pending" | "error";
}

// ==========================================
// TIPOS PARA MENSAJERÍA / CHAT (Sprint 5.4)
// ==========================================

export type EstadoMensaje = "enviando" | "enviado" | "entregado" | "leido" | "error";
export type TipoMensaje = "texto" | "archivo" | "planeacion" | "recurso";

export interface MensajeArchivo {
  nombre: string;
  tamaño: number;
  formato: string;
  url?: string;
}

export interface MensajePlaneacion {
  planeacionId: string;
  titulo: string;
  materia: string;
  grado: string;
}

export interface MensajeRecurso {
  recursoId: number;
  titulo: string;
  tipo: string;
  formato?: string;
}

export interface Mensaje extends BaseEntity {
  conversacionId: number;
  remitenteId: string;
  contenido: string;
  tipo: TipoMensaje;
  archivo?: MensajeArchivo;
  planeacion?: MensajePlaneacion;
  recurso?: MensajeRecurso;
  estado: EstadoMensaje;
  fechaCreacion: string;
  fechaModificacion: string;
  syncStatus?: "synced" | "pending" | "error";
}

export interface Conversacion extends BaseEntity {
  participantes: string[];
  contactoId: number;
  contactoNombre: string;
  contactoAvatar?: string;
  contactoColor: string;
  contactoEnLinea: boolean;
  ultimoMensaje?: string;
  ultimoMensajeTipo?: TipoMensaje;
  fechaUltimoMensaje?: string;
  mensajesNoLeidos: number;
  fechaCreacion: string;
  fechaModificacion: string;
  syncStatus?: "synced" | "pending" | "error";
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
 * Sistema de diseño — paleta de colores
 *
 * Cada token tiene un propósito semántico. Usar siempre estas constantes
 * en lugar de valores hexadecimales hardcodeados.
 */
export const COLORS = {
  // ─── Primarios ───
  primary: "#1676D2",
  primaryDark: "#0C63B8",
  primaryLight: "#2196F3",
  primaryMuted: "#1E64CC",

  // ─── Fondos ───
  background: "#EEF3FA",
  backgroundSoft: "#F8FBFF",

  // ─── Superficies ───
  surface: "#FFFFFF",
  surfaceSecondary: "#ECF1F8",
  surfaceTertiary: "#F2F5FA",
  surfaceHover: "#F5F8FC",

  // ─── Bordes ───
  border: "#E3EAF4",
  borderLight: "#DDE7F5",
  borderStrong: "#D8E2F0",
  divider: "#E0E0E0",

  // ─── Texto ───
  text: "#1E2A3A",
  textSecondary: "#5C6E86",
  textTertiary: "#6B7D96",
  textMuted: "#8A97AA",
  textDark: "#2A3B56",
  textOnPrimary: "#FFFFFF",

  // ─── Estado ───
  success: "#4CAF50",
  successTint: "#E7F9F3",
  error: "#C62828",
  errorLight: "#F44336",
  errorTint: "#FFF1F2",
  warning: "#FF9800",
  warningTint: "#FFF8F1",
  danger: "#D34553",
  dangerDark: "#B12635",

  // ─── Niveles académicos ───
  nivelPrimaria: "#4CAF50",
  nivelSecundaria: "#2196F3",
  nivelPreparatoria: "#FF9800",
  nivelUniversidad: "#9C27B0",

  // ─── Acentos ───
  purple: "#9C27B0",
  teal: "#0B6F86",
  tealLight: "#0EA5A5",
  indigo: "#5C6BC0",
  amber: "#F58026",

  // ─── Dashboard métricas (Home) ───
  metricBlue: "#147AD6",
  metricTeal: "#0E8B9A",
  metricAmber: "#A6651A",
  metricRed: "#D34553",

  // ─── Componentes específicos ───
  bannerBg: "#09589E",
  bannerAccent: "#A8D6FF",
  toggleActive: "#0C74C6",
  progressTrack: "#E8EDF5",
  skeleton: "#EDF1F7",
  overlay: "rgba(19, 30, 49, 0.42)",

  // ─── Tints suaves (fondos de badges / tarjetas de estado) ───
  primaryTint: "#EAF4FF",
  successLight: "#0D9E70",
  purpleTint: "#F3E5F5",

  // ─── Stitch Material 3 surface system ───
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#f1f4f8",
  surfaceContainer: "#ebeef2",
  surfaceContainerHigh: "#e5e8ec",
  surfaceContainerHighest: "#e0e3e7",
  onSurface: "#181c1f",
  onSurfaceVariant: "#414752",
  outlineVariant: "#c0c7d4",
  primaryContainer: "#0576d2",
  secondaryContainer: "#60e2ff",
  errorContainer: "#ffdad6",
  inverseSurface: "#2d3134",
  shadowBlue: "rgba(0,93,168,0.06)",
  shadowBlueLift: "rgba(0,93,168,0.12)",
} as const;
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
