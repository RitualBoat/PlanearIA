import { readFileSync, readdirSync } from "fs";
import path from "path";

/**
 * Guardarrailes del selector transversal (change assign-sheet, #84).
 *
 * Vigilan las dos propiedades estructurales que este change existe para garantizar, no el
 * aspecto de la hoja: que la escritura pase siempre por el camino que encola, y que la
 * presentacion no vuelva a derivar por su cuenta lo que ya resuelve una fuente unica.
 */

const RAIZ = path.join(__dirname, "..", "..", "..");
const CARPETA_ASSIGN = path.join(RAIZ, "components", "assign");
const HOOK = path.join(RAIZ, "hooks", "useAssignSheet.ts");
const SERVICIO = path.join(RAIZ, "services", "grupoAsignacionesService.ts");

const leer = (archivo: string): string => readFileSync(archivo, "utf8");

/**
 * Codigo sin comentarios: un comentario que explica por que no se escribe aqui no puede
 * hacer fallar la guardia que verifica que no se escribe aqui.
 */
const soloCodigo = (archivo: string): string =>
  leer(archivo)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const archivosDeAssign = (): string[] =>
  readdirSync(CARPETA_ASSIGN)
    .filter((archivo) => /\.tsx?$/.test(archivo))
    .map((archivo) => path.join(CARPETA_ASSIGN, archivo));

describe("la hoja no escribe: solo el ViewModel ejecuta", () => {
  it.each(archivosDeAssign())("%s no toca almacenamiento ni la cola", (archivo) => {
    const codigo = soloCodigo(archivo);
    expect(codigo).not.toMatch(/AsyncStorage/);
    expect(codigo).not.toMatch(/queueEntityOperation/);
    expect(codigo).not.toMatch(/\bfetch\s*\(/);
  });

  it.each(archivosDeAssign())("%s no importa COLORS ni fija hex", (archivo) => {
    const codigo = soloCodigo(archivo);
    expect(codigo).not.toMatch(/\bCOLORS\b/);
    expect(codigo).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});

describe("toda asignacion pasa por el camino que encola", () => {
  /**
   * El defecto que cerro este change fue exactamente este: escribir el destino en
   * almacenamiento sin encolar. La guardia impide que vuelva por descuido.
   */
  it("el ViewModel escribe por los contextos y no por almacenamiento directo", () => {
    const codigo = soloCodigo(HOOK);
    expect(codigo).not.toMatch(/AsyncStorage/);
    expect(codigo).toMatch(/actualizarRecurso/);
    expect(codigo).toMatch(/actualizarEntregable/);
  });

  it("el servicio legacy encola cada mutacion que escribe", () => {
    const codigo = soloCodigo(SERVICIO);
    expect(codigo).toMatch(/queueEntityOperation/);
    // Cada funcion que persiste tiene que encolar: si alguna escribe y no encola, la
    // asignacion vuelve a perderse en el pull siguiente.
    const escrituras = codigo.match(/await writeArray\(/g) ?? [];
    const encolados = codigo.match(/await encolarActualizaciones\(/g) ?? [];
    expect(escrituras.length).toBeGreaterThan(0);
    expect(encolados.length).toBe(escrituras.length);
  });

  it("el servicio legacy no vuelve a escribir en la clave legacy de entregables", () => {
    const codigo = soloCodigo(SERVICIO);
    expect(codigo).not.toMatch(/@planearia:tareas/);
    expect(codigo).toMatch(/SYNC_ENTITIES\.entregables\.storageKey/);
  });
});

describe("props ARIA que React Native Web no deriva solo", () => {
  /**
   * Igual que en #82: el renderer nativo de las pruebas normaliza los `aria-*` de vuelta a
   * `accessibilityState`, asi que la diferencia solo es observable en web y la guardia va
   * sobre la fuente. Sin este prop, la eleccion de destino solo se comunica por color.
   */
  it("la opcion de destino declara aria-checked", () => {
    expect(leer(path.join(CARPETA_ASSIGN, "AssignSheet.tsx"))).toMatch(
      /aria-checked=\{seleccionada\}/
    );
  });
});

describe("la presentacion de sincronizacion no se deriva aqui", () => {
  it("la hoja usa la fuente unica y no inventa copy de falta de conexion", () => {
    const codigo = soloCodigo(path.join(CARPETA_ASSIGN, "AssignSheet.tsx"));
    expect(codigo).toMatch(/useSyncPresentation/);
    expect(codigo).not.toMatch(/Sin conexion|Sin conexión|Servidor no disponible/);
  });
});
