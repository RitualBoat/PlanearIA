import {
  HUB_LANDING,
  HUB_ROUTES,
  INITIAL_HUB,
  ROOT_ROUTES,
} from "../../navigation/routeManifest";

/**
 * Test de guardia de la particion de rutas (change app-shell-navegacion, #81).
 *
 * El manifiesto esta atado por tipos a los param lists (routeManifest.ts) y los
 * stacks registran sus pantallas desde un Record exhaustivo, asi que afirmar la
 * particion sobre el manifiesto equivale a afirmarla sobre el registro real.
 * El inventario legacy congelado vive en
 * openspec/changes/app-shell-navegacion/evidencia/inventario-rutas-antes.md.
 */

// Las 60 rutas del stack plano previo al shell. Ninguna puede desaparecer.
const LEGACY_ROUTES = [
  "Onboarding",
  "Login",
  "Registro",
  "RecuperarContrasena",
  "MainTabs",
  "Planeaciones",
  "CrearPlaneacion",
  "GenerarPlaneacionIA",
  "ImportarPlaneacion",
  "EscanerPlantilla",
  "ExportarPlaneacion",
  "DocEditor",
  "ListaPlaneaciones",
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
  "RecursosDidacticos",
  "ListaRecursos",
  "CrearRecurso",
  "BibliotecaPlantillas",
  "ListaPlantillas",
  "DetallePlantilla",
  "EditorPlantilla",
  "Cuenta",
  "EditarPerfil",
  "AdminRoles",
  "SesionesActivas",
  "Terminos",
  "Perfil",
  "RetoResolucion",
  "RetoResultado",
  "QuestionEditor",
  "PostDetail",
  "BuscadorPerfiles",
  "Chat",
  "Conversacion",
  "Notificaciones",
  "Ayuda",
] as const;

// Pantallas que antes eran tabs y ahora son rutas dentro de un hub.
const LEGACY_TAB_SCREENS = ["Contenido", "Feed", "Social", "ClassroomHome"] as const;

const HUB_NAMES = Object.keys(HUB_ROUTES) as Array<keyof typeof HUB_ROUTES>;

const allPartitions: Array<{ owner: string; routes: readonly string[] }> = [
  { owner: "root", routes: ROOT_ROUTES },
  ...HUB_NAMES.map((hub) => ({ owner: hub, routes: HUB_ROUTES[hub] })),
];

describe("particion de rutas del shell", () => {
  it("el inventario legacy era de 60 rutas", () => {
    expect(LEGACY_ROUTES).toHaveLength(60);
  });

  it("la raiz no excede 10 rutas hermanas", () => {
    expect(ROOT_ROUTES.length).toBeLessThanOrEqual(10);
  });

  it("ninguna ruta vive en dos navegadores a la vez", () => {
    const seen = new Map<string, string>();
    for (const { owner, routes } of allPartitions) {
      for (const route of routes) {
        expect({ route, en: owner, yaEn: seen.get(route) ?? null }).toEqual({
          route,
          en: owner,
          yaEn: null,
        });
        seen.set(route, owner);
      }
    }
  });

  it("ninguna ruta del stack plano desaparece del grafo", () => {
    const union = new Set(allPartitions.flatMap(({ routes }) => [...routes]));
    const perdidas = LEGACY_ROUTES.filter((route) => !union.has(route));
    expect(perdidas).toEqual([]);
  });

  it("las pantallas que eran tabs siguen registradas como rutas", () => {
    const union = new Set(allPartitions.flatMap(({ routes }) => [...routes]));
    const perdidas = LEGACY_TAB_SCREENS.filter((route) => !union.has(route));
    expect(perdidas).toEqual([]);
  });

  it("cada hub contiene su pantalla de aterrizaje", () => {
    for (const hub of HUB_NAMES) {
      expect(HUB_ROUTES[hub]).toContain(HUB_LANDING[hub]);
    }
  });

  it("el shell abre en el hub de Inicio y su landing es el Escritorio", () => {
    expect(INITIAL_HUB).toBe("InicioTab");
    expect(HUB_LANDING.InicioTab).toBe("Escritorio");
  });

  it("los conteos por navegador coinciden con el design", () => {
    expect(ROOT_ROUTES).toHaveLength(9);
    expect(HUB_ROUTES.InicioTab).toHaveLength(1);
    expect(HUB_ROUTES.OfficeTab).toHaveLength(16);
    expect(HUB_ROUTES.ClasesTab).toHaveLength(26);
    expect(HUB_ROUTES.AsistenteTab).toHaveLength(1);
    expect(HUB_ROUTES.MasTab).toHaveLength(15);
  });
});
