import fs from "node:fs";
import path from "node:path";
import { HUB_ROUTES, ROOT_ROUTES } from "../../navigation/routeManifest";

/**
 * Guardia de alcanzabilidad entre hubs (change app-shell-navegacion, #81).
 *
 * Complementa a `routePartition.test.ts`. Aquel afirma que la particion esta bien
 * formada; este afirma que las LLAMADAS la respetan, que es lo que TypeScript ya
 * no puede vigilar: las pantallas existentes tipan su navegacion contra el
 * catalogo plano `AppRoutesParamList`, asi que `navigate("ListaRecursos")` desde
 * una pantalla de Clases compila aunque en runtime nunca encontraria la ruta.
 *
 * Regla que se afirma (las acciones de navegacion suben al padre pero nunca bajan
 * a un navegador hermano):
 *   - hub -> raiz            valido por bubbling
 *   - mismo navegador        valido
 *   - raiz -> hub            requiere `navigateToHub`
 *   - hub A -> hub B         requiere `navigateToHub`
 */

const SRC = path.join(__dirname, "..", "..");
const NAV = path.join(SRC, "navigation");

type Owner = "root" | keyof typeof HUB_ROUTES;

const ownerOfRoute = new Map<string, Owner>();
for (const route of ROOT_ROUTES) ownerOfRoute.set(route, "root");
for (const hub of Object.keys(HUB_ROUTES) as Array<keyof typeof HUB_ROUTES>) {
  for (const route of HUB_ROUTES[hub]) ownerOfRoute.set(route, hub);
}

/** Deriva que navegador monta cada pantalla, leyendo los imports de cada stack. */
function buildFileOwners(): Map<string, Owner> {
  const owners = new Map<string, Owner>();
  const stacks: Array<[Owner, string]> = [
    ["InicioTab", "stacks/InicioStack.tsx"],
    ["OfficeTab", "stacks/OfficeStack.tsx"],
    ["ClasesTab", "stacks/ClasesStack.tsx"],
    ["AsistenteTab", "stacks/AsistenteStack.tsx"],
    ["MasTab", "stacks/MasStack.tsx"],
  ];
  for (const [owner, file] of stacks) {
    const source = fs.readFileSync(path.join(NAV, file), "utf8");
    for (const m of source.matchAll(/from "\.\.\/\.\.\/(screens\/[^"]+)"/g)) {
      owners.set(`${m[1]}.tsx`, owner);
    }
  }
  const rootSource = fs.readFileSync(path.join(NAV, "StackNavigator.tsx"), "utf8");
  for (const m of rootSource.matchAll(/from "\.\.\/(screens\/[^"]+)"/g)) {
    owners.set(`${m[1]}.tsx`, "root");
  }
  return owners;
}

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__") listSourceFiles(full, acc);
    } else if (/\.tsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

const files = listSourceFiles(SRC);
const fileOwners = buildFileOwners();

const relative = (file: string) => path.relative(SRC, file).replaceAll(path.sep, "/");

/**
 * Los ViewModels no se montan: heredan el navegador de las pantallas que los
 * consumen, asi que una llamada dentro de un hook se evalua contra cada dueño
 * posible.
 */
function buildHookOwners(): Map<string, Set<Owner>> {
  const hookOwners = new Map<string, Set<Owner>>();
  for (const file of files) {
    const owner = fileOwners.get(relative(file));
    if (!owner) continue;
    const source = fs.readFileSync(file, "utf8");
    for (const m of source.matchAll(/from "[^"]*hooks\/(use[A-Za-z]+)"/g)) {
      if (!hookOwners.has(m[1])) hookOwners.set(m[1], new Set());
      hookOwners.get(m[1])!.add(owner);
    }
  }
  return hookOwners;
}

const hookOwners = buildHookOwners();

interface Cruce {
  archivo: string;
  destino: string;
  desde: Owner;
  hacia: Owner;
}

function findUnnestedCrossHubCalls(): { cruces: Cruce[]; desconocidas: string[] } {
  const cruces: Cruce[] = [];
  const desconocidas: string[] = [];

  for (const file of files) {
    const rel = relative(file);
    if (rel.startsWith("navigation/")) continue;

    const owners = fileOwners.has(rel)
      ? new Set<Owner>([fileOwners.get(rel)!])
      : hookOwners.get(path.basename(rel).replace(/\.tsx?$/, ""));
    if (!owners?.size) continue;

    const source = fs.readFileSync(file, "utf8");
    for (const m of source.matchAll(/navigation\.navigate\(\s*"([A-Za-z][A-Za-z0-9]*)"/g)) {
      const destino = m[1];
      if (destino === "MainTabs") continue;

      const hacia = ownerOfRoute.get(destino);
      if (!hacia) {
        desconocidas.push(`${rel} -> ${destino}`);
        continue;
      }
      if (hacia === "root") continue; // sube por bubbling

      for (const desde of owners) {
        if (desde !== hacia) cruces.push({ archivo: rel, destino, desde, hacia });
      }
    }
  }
  return { cruces, desconocidas };
}

describe("alcanzabilidad entre hubs", () => {
  const { cruces, desconocidas } = findUnnestedCrossHubCalls();

  it("ninguna llamada plana cruza de un navegador a otro", () => {
    // Un fallo aqui significa navegacion muerta en runtime: usa navigateToHub.
    expect(cruces).toEqual([]);
  });

  it("toda ruta destino existe en la particion declarada", () => {
    expect(desconocidas).toEqual([]);
  });

  it("el analisis cubre pantallas reales (no pasa en vacio)", () => {
    // Sin esto, un error de resolucion de rutas dejaria el test verde por vacio.
    expect(fileOwners.size).toBeGreaterThan(40);
    expect(hookOwners.size).toBeGreaterThan(5);
  });
});
