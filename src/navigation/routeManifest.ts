import type {
  AppShellParamList,
  AsistenteStackParamList,
  ClasesStackParamList,
  InicioStackParamList,
  MasStackParamList,
  OfficeStackParamList,
  RootStackParamList,
} from "./types";

/**
 * Manifiesto de la particion de rutas del shell.
 *
 * Es la unica fuente de verdad en VALORES (no solo tipos) de que ruta vive en que
 * navegador. El test de guardia consume estas listas para afirmar la particion sin
 * importar ninguna pantalla; los chequeos de tipo de abajo atan cada lista a su
 * param list en ambas direcciones, asi que un desvio entre manifiesto y contrato
 * rompe la compilacion, no un review.
 */

export const ROOT_ROUTES = [
  "Onboarding",
  "Login",
  "Registro",
  "RecuperarContrasena",
  "MainTabs",
  "DocEditor",
  "Notificaciones",
  "Ayuda",
  "Terminos",
] as const;

export const HUB_ROUTES = {
  InicioTab: ["Escritorio"] as const,
  OfficeTab: [
    "OfficeHome",
    "Planeaciones",
    "CrearPlaneacion",
    "GenerarPlaneacionIA",
    "ImportarPlaneacion",
    "EscanerPlantilla",
    "ExportarPlaneacion",
    "ListaPlaneaciones",
    "RecursosDidacticos",
    "ListaRecursos",
    "CrearRecurso",
    "BibliotecaPlantillas",
    "ListaPlantillas",
    "DetallePlantilla",
    "EditorPlantilla",
    "Contenido",
  ] as const,
  ClasesTab: [
    "ClassroomHome",
    "ListaGrupos",
    "CrearGrupo",
    "DetalleGrupo",
    "ClassroomGroup",
    "ReportesGrupo",
    "ImportarGrupos",
    "CrearTareaGrupo",
    "AsignarRecurso",
    "DetalleTarea",
    "CalificarEntregas",
    "DetalleActividadClassroom",
    "AgregarContenidoClassroom",
    "DetalleRecursoClassroom",
    "ListaEntregables",
    "RegistrarAsistencia",
    "HistorialAsistencia",
    "CapturarCalificaciones",
    "PromediosCalificaciones",
    "CrearAlumno",
    "ListaAlumnos",
    "ImportarAlumnos",
    "ExportarAlumnos",
    "DetalleAlumno",
    "NotasAlumno",
    "ReportesAlumno",
  ] as const,
  AsistenteTab: ["AsistenteHome"] as const,
  MasTab: [
    "MasHome",
    "Cuenta",
    "EditarPerfil",
    "AdminRoles",
    "SesionesActivas",
    "Perfil",
    "RetoResolucion",
    "RetoResultado",
    "QuestionEditor",
    "PostDetail",
    "BuscadorPerfiles",
    "Chat",
    "Conversacion",
    "Feed",
    "Social",
  ] as const,
} as const;

/**
 * Rutas que existen solo en compilaciones de desarrollo y por tanto NO forman parte del
 * manifiesto de produccion.
 *
 * El manifiesto inventaria la navegacion que alcanza el docente; el catalogo de la
 * biblioteca base (#82) es herramienta de revision y `MasStack` solo lo registra bajo
 * `__DEV__`. Se declara aqui, y no se omite en silencio, para que la exhaustividad siga
 * siendo total: cada ruta del contrato esta en el manifiesto o en esta lista.
 */
export const DEV_ONLY_ROUTES = ["CatalogoComponentes"] as const;

/** Hub inicial del shell: la app abre en el Escritorio (D1). */
export const INITIAL_HUB = "InicioTab" as const;

/** Pantalla de aterrizaje de cada hub, para el fallback sin historial. */
export const HUB_LANDING = {
  InicioTab: "Escritorio",
  OfficeTab: "OfficeHome",
  ClasesTab: "ClassroomHome",
  AsistenteTab: "AsistenteHome",
  MasTab: "MasHome",
} as const;

// ---------------------------------------------------------------------------
// Chequeos de compilacion: manifiesto <-> param lists, en ambas direcciones.
// Si una ruta se agrega al contrato sin registrarla aqui (o al reves), typecheck
// falla con un tipo distinto de `never`/incompatible.
// ---------------------------------------------------------------------------

type ExpectNever<T extends never> = T;

// Toda entrada del manifiesto existe en su param list (direccion manifiesto -> tipo).
const _rootMembers: readonly (keyof RootStackParamList)[] = ROOT_ROUTES;
const _inicioMembers: readonly (keyof InicioStackParamList)[] = HUB_ROUTES.InicioTab;
const _officeMembers: readonly (keyof OfficeStackParamList)[] = HUB_ROUTES.OfficeTab;
const _clasesMembers: readonly (keyof ClasesStackParamList)[] = HUB_ROUTES.ClasesTab;
const _asistenteMembers: readonly (keyof AsistenteStackParamList)[] = HUB_ROUTES.AsistenteTab;
const _masMembers: readonly (keyof MasStackParamList)[] = HUB_ROUTES.MasTab;
void _rootMembers;
void _inicioMembers;
void _officeMembers;
void _clasesMembers;
void _asistenteMembers;
void _masMembers;

// Toda ruta del param list aparece en el manifiesto (direccion tipo -> manifiesto).
type _RootExhaustive = ExpectNever<
  Exclude<keyof RootStackParamList, (typeof ROOT_ROUTES)[number]>
>;
type _InicioExhaustive = ExpectNever<
  Exclude<keyof InicioStackParamList, (typeof HUB_ROUTES.InicioTab)[number]>
>;
type _OfficeExhaustive = ExpectNever<
  Exclude<keyof OfficeStackParamList, (typeof HUB_ROUTES.OfficeTab)[number]>
>;
type _ClasesExhaustive = ExpectNever<
  Exclude<keyof ClasesStackParamList, (typeof HUB_ROUTES.ClasesTab)[number]>
>;
type _AsistenteExhaustive = ExpectNever<
  Exclude<keyof AsistenteStackParamList, (typeof HUB_ROUTES.AsistenteTab)[number]>
>;
type _MasExhaustive = ExpectNever<
  Exclude<
    keyof MasStackParamList,
    (typeof HUB_ROUTES.MasTab)[number] | (typeof DEV_ONLY_ROUTES)[number]
  >
>;
type _HubKeys = ExpectNever<Exclude<keyof AppShellParamList, keyof typeof HUB_ROUTES>>;
type _LandingKeys = ExpectNever<Exclude<keyof AppShellParamList, keyof typeof HUB_LANDING>>;
export type _ManifestChecks = [
  _RootExhaustive,
  _InicioExhaustive,
  _OfficeExhaustive,
  _ClasesExhaustive,
  _AsistenteExhaustive,
  _MasExhaustive,
  _HubKeys,
  _LandingKeys,
];
