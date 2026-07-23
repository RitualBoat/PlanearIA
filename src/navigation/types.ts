import { NavigatorScreenParams } from "@react-navigation/native";
import { PostAttachment } from "../../types";
import { NivelAcademico as NivelAcademicoV2 } from "../../types/planeacionV2";

/**
 * Contratos de navegacion del AppShell (change app-shell-navegacion, #81).
 *
 * La particion en hubs no es tematica: sale del analisis estatico de llamadas
 * congelado en openspec/changes/app-shell-navegacion/evidencia/. Las acciones de
 * navegacion suben al navegador padre pero nunca bajan a un hermano, asi que una
 * ruta solo puede vivir en un hub si nadie externo la alcanza por nombre plano;
 * los cruces entre hubs usan la forma anidada de navigateToHub.
 */

export type InicioStackParamList = {
  Escritorio: undefined;
};

export type OfficeStackParamList = {
  OfficeHome: undefined;
  // Planeaciones (DocEditor queda en la raiz: editor a pantalla completa)
  Planeaciones: undefined;
  CrearPlaneacion: undefined;
  GenerarPlaneacionIA: undefined;
  ImportarPlaneacion: undefined;
  EscanerPlantilla: undefined;
  ExportarPlaneacion: { planeacionId?: string };
  ListaPlaneaciones: undefined;
  // Recursos didacticos
  RecursosDidacticos: undefined;
  ListaRecursos: { filtroTipo?: string } | undefined;
  CrearRecurso: { recursoId?: number; grupoId?: number; unidadId?: string } | undefined;
  // Plantillas
  BibliotecaPlantillas: undefined;
  ListaPlantillas: { filtroCategoria?: string } | undefined;
  DetallePlantilla: { plantillaId: number };
  EditorPlantilla: { plantillaId?: number } | undefined;
  // Biblioteca transversal (antes ContenidoTab; D6 la disuelve dentro de Office)
  Contenido: { selectionMode?: boolean; targetGroupId?: string } | undefined;
};

export type ClasesStackParamList = {
  // Landing del hub: la pantalla de Classroom existente
  ClassroomHome: undefined;
  // Grupos
  ListaGrupos: undefined;
  CrearGrupo:
    | undefined
    | {
        modo?: "crear" | "editar";
        grupoId?: number;
      };
  DetalleGrupo: { grupoId: number; grupoNombre: string };
  ClassroomGroup: { grupoId: number; grupoNombre?: string };
  ReportesGrupo: { grupoId: number; grupoNombre: string };
  ImportarGrupos: undefined;
  // Tareas dentro de grupos
  CrearTareaGrupo: { grupoId: number; entregableId?: number; unidadId?: string };
  AsignarRecurso: { grupoId: number };
  DetalleTarea: { tareaId: number; grupoId: number };
  CalificarEntregas: { tareaId: number; grupoId: number };
  DetalleActividadClassroom: { tareaId: number; grupoId: number };
  AgregarContenidoClassroom: {
    grupoId: number;
    kind?: "material" | "actividad";
    modo?: "crear" | "editar";
    recursoId?: number;
    tareaId?: number;
    unidadId?: string;
    unidadNombre?: string;
  };
  DetalleRecursoClassroom: { recursoId: number; grupoId?: number };
  // Entregables
  ListaEntregables: undefined;
  // Asistencia
  RegistrarAsistencia: { grupoId: number };
  HistorialAsistencia: { grupoId: number };
  // Calificaciones
  CapturarCalificaciones: { grupoId: number };
  PromediosCalificaciones: { grupoId: number };
  // Alumnos
  CrearAlumno:
    | undefined
    | {
        modo?: "crear" | "editar";
        alumnoId?: number;
        grupoId?: number;
      };
  ListaAlumnos: undefined;
  ImportarAlumnos: { grupoId?: number; grupoNombre?: string } | undefined;
  ExportarAlumnos: { grupoId?: number; grupoNombre?: string } | undefined;
  DetalleAlumno: { alumnoId: number };
  NotasAlumno: { alumnoId: number; alumnoNombre?: string };
  ReportesAlumno: { alumnoId: number; alumnoNombre?: string };
};

export type AsistenteStackParamList = {
  AsistenteHome: undefined;
};

export type MasStackParamList = {
  MasHome: undefined;
  // Cuenta y seguridad
  Cuenta: undefined;
  EditarPerfil: undefined;
  AdminRoles: undefined;
  SesionesActivas: undefined;
  // Perfil publico
  Perfil: undefined;
  // Retos y posts (legacy accesible hasta conectaplan)
  RetoResolucion:
    | {
        titulo?: string;
        descripcion?: string;
        tiempoLimite?: number;
        preguntas?: number;
      }
    | undefined;
  RetoResultado:
    | {
        titulo?: string;
        correctas?: number;
        total?: number;
        tiempo?: number;
      }
    | undefined;
  QuestionEditor: undefined;
  PostDetail: { postId: number; userId?: string };
  // Comunicacion
  BuscadorPerfiles: undefined;
  Chat: undefined;
  Conversacion: { conversacionId: number };
  // Pantallas que antes eran tabs propias (D5: siguen vivas hasta conectaplan)
  Feed:
    | {
        openCreatePost?: boolean;
        attachmentToShare?: PostAttachment;
      }
    | undefined;
  Social: undefined;
  // Solo desarrollo: catalogo de la biblioteca base (#82). MasStack lo registra bajo
  // __DEV__, asi que no es alcanzable en produccion.
  CatalogoComponentes: undefined;
};

export type AppShellParamList = {
  InicioTab: NavigatorScreenParams<InicioStackParamList>;
  OfficeTab: NavigatorScreenParams<OfficeStackParamList>;
  ClasesTab: NavigatorScreenParams<ClasesStackParamList>;
  AsistenteTab: NavigatorScreenParams<AsistenteStackParamList>;
  MasTab: NavigatorScreenParams<MasStackParamList>;
};

/**
 * Raiz de navegacion: 9 rutas. Solo auth/onboarding (fuera del shell), el shell y
 * los destinos que son solo-destino y nunca navegan hacia un hub. Todo lo demas
 * vive dentro del hub que lo posee; el test de guardia protege la particion.
 */
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Registro: undefined;
  RecuperarContrasena: undefined;
  MainTabs: NavigatorScreenParams<AppShellParamList>;
  DocEditor: {
    modo: "crear" | "editar" | "plantilla";
    planeacionId?: string;
    plantillaId?: string;
    nivelAcademico?: NivelAcademicoV2;
  };
  Notificaciones: undefined;
  Ayuda: undefined;
  Terminos: { tab?: "terminos" | "privacidad" | "licencias" } | undefined;
};

/**
 * Catalogo plano de todos los destinos navegables de la app.
 *
 * Existe para el tipado de las pantallas delgadas durante la migracion a hubs:
 * 55 archivos tipaban su navegacion contra el antiguo RootStackParamList plano y
 * reescribir cada uno contra su hub seria churn sin valor. La alcanzabilidad real
 * la gobiernan los navegadores (particion de hubs) y su test de guardia, no este
 * tipo. Codigo nuevo que viva dentro de un hub deberia tipar contra el param list
 * de su hub.
 */
export type AppRoutesParamList = RootStackParamList &
  InicioStackParamList &
  OfficeStackParamList &
  ClasesStackParamList &
  AsistenteStackParamList &
  MasStackParamList;
