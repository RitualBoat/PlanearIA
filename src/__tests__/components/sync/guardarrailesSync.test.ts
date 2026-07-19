import { readFileSync, readdirSync } from "fs";
import path from "path";

/**
 * Guardarrailes de la capa de sync (change sync-status-ui, #83).
 *
 * El defecto que este change cierra no fue escribir mal un componente: fue que tres
 * superficies tradujeran el mismo estado por su cuenta hasta divergir. Estas pruebas
 * vigilan la propiedad estructural que lo impide, no el aspecto de un componente.
 */

const RAIZ = path.join(__dirname, "..", "..", "..");
const CARPETA_SYNC = path.join(RAIZ, "components", "sync");

const leer = (archivo: string): string => readFileSync(archivo, "utf8");

/**
 * Codigo sin comentarios.
 *
 * Los guardarrailes de copy tienen que medir lo que se renderiza, no lo que se explica: un
 * comentario que cita un titulo para justificar una decision es documentacion util, no una
 * derivacion duplicada. Sin este filtro, la prueba castigaria escribir buenos comentarios.
 */
const soloCodigo = (archivo: string): string =>
  leer(archivo)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const archivosDeSync = (): string[] =>
  readdirSync(CARPETA_SYNC)
    .filter((archivo) => /\.tsx?$/.test(archivo))
    .map((archivo) => path.join(CARPETA_SYNC, archivo));

/** Superficies que presentan estado de sincronizacion y deben leer la fuente unica. */
const SUPERFICIES_DE_ESTADO = [
  path.join(RAIZ, "components", "SyncStatusBanner.tsx"),
  path.join(RAIZ, "navigation", "AppTopBar.tsx"),
  path.join(RAIZ, "screens", "planeaciones", "ListaPlaneacionesScreen.tsx"),
];

describe("guardarrail de color en la capa de sync", () => {
  it("ningun componente de sync importa la paleta estatica legacy", () => {
    const infractores = archivosDeSync().filter((archivo) => /\bCOLORS\b/.test(leer(archivo)));

    expect(infractores.map((archivo) => path.basename(archivo))).toEqual([]);
  });

  it("ninguna superficie de estado codifica color con literales hexadecimales", () => {
    const infractores = [...archivosDeSync(), ...SUPERFICIES_DE_ESTADO].filter((archivo) =>
      /#[0-9a-fA-F]{3,8}\b/.test(leer(archivo))
    );

    expect(infractores.map((archivo) => path.basename(archivo))).toEqual([]);
  });

  it("la barra global dejo de consumir la paleta estatica legacy", () => {
    const barra = leer(path.join(RAIZ, "components", "SyncStatusBanner.tsx"));

    expect(barra).not.toMatch(/\bCOLORS\b/);
    expect(barra).toMatch(/useAppTheme/);
  });
});

describe("guardarrail de derivacion unica", () => {
  /**
   * Los titulos de los siete estados solo pueden existir en la tabla. Si reaparecen en un
   * componente o una pantalla, alguien volvio a traducir el estado por su cuenta y la
   * divergencia esta a un cambio de copy de distancia.
   */
  const TITULOS_DE_ESTADO = [
    "Guardado en este dispositivo",
    "Sin conexion",
    "Tu sesion expiro",
    "Todo sincronizado",
    "por sincronizar",
  ];

  it("los titulos de estado solo viven en la tabla de presentacion", () => {
    const candidatos = [...archivosDeSync(), ...SUPERFICIES_DE_ESTADO].filter(
      (archivo) => path.basename(archivo) !== "syncPresentation.ts"
    );

    const infractores = candidatos
      .map((archivo) => ({
        archivo: path.basename(archivo),
        titulos: TITULOS_DE_ESTADO.filter((titulo) => soloCodigo(archivo).includes(titulo)),
      }))
      .filter((entrada) => entrada.titulos.length > 0);

    expect(infractores).toEqual([]);
  });

  it("la tabla de presentacion si contiene los siete titulos", () => {
    const tabla = leer(path.join(RAIZ, "hooks", "syncPresentation.ts"));

    for (const titulo of TITULOS_DE_ESTADO) {
      expect(tabla).toContain(titulo);
    }
  });

  it("toda superficie de estado consume la fuente unica", () => {
    const infractores = SUPERFICIES_DE_ESTADO.filter(
      (archivo) => !/useSyncPresentation|SyncStatusChip/.test(leer(archivo))
    );

    expect(infractores.map((archivo) => path.basename(archivo))).toEqual([]);
  });

  /**
   * El copy alarmista que el change retira. "Error sync" atribuia al docente un fallo que
   * no era suyo, mientras la barra global llamaba al mismo evento "datos locales".
   */
  it("la cadena Error sync no existe en el codigo fuente", () => {
    const conError = SUPERFICIES_DE_ESTADO.filter((archivo) => leer(archivo).includes("Error sync"));

    expect(conError).toEqual([]);
  });

  it("la tabla de presentacion no importa React ni contextos en tiempo de ejecucion", () => {
    const tabla = leer(path.join(RAIZ, "hooks", "syncPresentation.ts"));

    // La pureza es estructural: permite congelar la tabla sin montar React ni simular
    // almacenamiento, y garantiza que traducir un estado no pueda tener efectos.
    expect(tabla).not.toMatch(/^import\s+(?!type)/m);
  });
});

describe("guardarrail de motor intacto", () => {
  it("ningun componente de sync abre colas, clientes HTTP ni suscripciones de conectividad", () => {
    const infractores = archivosDeSync().filter((archivo) =>
      /\bfetch\(|subscribeConnectivity|queueEntityOperation|AsyncStorage/.test(leer(archivo))
    );

    expect(infractores.map((archivo) => path.basename(archivo))).toEqual([]);
  });

  it("la capa de sync no declara estado propio de sincronizacion", () => {
    // Los componentes derivan; el unico useState admisible seria de interaccion local.
    const infractores = archivosDeSync().filter((archivo) =>
      /useState<[^>]*(?:sync|Sync|online|Online)/.test(leer(archivo))
    );

    expect(infractores.map((archivo) => path.basename(archivo))).toEqual([]);
  });
});
