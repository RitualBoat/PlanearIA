// Clasificacion pura del paso de archive de un change OpenSpec.
//
// La pregunta que responde este modulo no es "son equivalentes la delta y la spec principal", sino
// "aplicara `openspec archive` estas deltas sin abortar". Esa pregunta si es decidible por presencia de
// encabezados `### Requirement:`, porque es el mismo criterio con el que `buildUpdatedSpec` decide
// abortar (dist/core/specs-apply.js:176, :179, :200, :212, :229).
//
// Sin efectos: no lee el disco, no invoca git ni la CLI. El comando le entrega texto ya leido.

export const SYNC_PENDING = "pendiente";
export const SYNC_SYNCED = "sincronizada";
export const SYNC_PARTIAL = "parcial";

export const OP_APPLIED = "aplicada";
export const OP_PENDING = "pendiente";
export const OP_NEUTRAL = "neutra";
export const OP_INDETERMINATE = "indeterminada";

export const REPO_READY = "listo";
export const REPO_ARCHIVED_COMMITTED = "archivado-commiteado";
export const REPO_ARCHIVED_UNCOMMITTED = "archivado-sin-commitear";
export const REPO_UNCLASSIFIABLE = "no-clasificable";

// Misma forma canonica que la CLI (dist/core/parsers/requirement-blocks.js:5). Se replica en vez de
// importarse porque dist/core/parsers/ no es superficie publica del paquete: una actualizacion podria
// moverla y romper el cierre en tiempo de ejecucion en vez de en la suite.
const REQUIREMENT_HEADER = /^###\s*Requirement:\s*(.+?)\s*$/i;
const SECTION_HEADER = /^##\s+(.+?)\s*$/;
const RENAMED_FROM = /^\s*-?\s*FROM:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/;
const RENAMED_TO = /^\s*-?\s*TO:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/;
const REMOVED_BULLET = /^\s*-\s*`?###\s*Requirement:\s*(.+?)`?\s*$/;

// normalizeRequirementName de la CLI es exactamente name.trim().
function normalize(name) {
  return String(name).trim();
}

function splitSections(content) {
  const sections = new Map();
  let active = null;
  for (const line of String(content).replace(/\r\n/g, "\n").split("\n")) {
    const header = line.match(SECTION_HEADER);
    if (header) {
      active = header[1].trim().toLowerCase();
      sections.set(active, []);
      continue;
    }
    if (active) sections.get(active).push(line);
  }
  return sections;
}

function headerNames(lines) {
  const names = [];
  for (const line of lines ?? []) {
    const match = line.match(REQUIREMENT_HEADER);
    if (match) names.push(normalize(match[1]));
  }
  return names;
}

function removedNames(lines) {
  const names = [];
  for (const line of lines ?? []) {
    const header = line.match(REQUIREMENT_HEADER);
    if (header) {
      names.push(normalize(header[1]));
      continue;
    }
    const bullet = line.match(REMOVED_BULLET);
    if (bullet) names.push(normalize(bullet[1]));
  }
  return names;
}

function renamedPairs(lines) {
  const pairs = [];
  let from = null;
  for (const line of lines ?? []) {
    const fromMatch = line.match(RENAMED_FROM);
    if (fromMatch) {
      from = normalize(fromMatch[1]);
      continue;
    }
    const toMatch = line.match(RENAMED_TO);
    if (toMatch && from) {
      pairs.push({ from, to: normalize(toMatch[1]) });
      from = null;
    }
  }
  return pairs;
}

/** Extrae las operaciones declaradas por una delta spec. */
export function parseDeltaOperations(content) {
  const sections = splitSections(content);
  return {
    added: headerNames(sections.get("added requirements")),
    modified: headerNames(sections.get("modified requirements")),
    removed: removedNames(sections.get("removed requirements")),
    renamed: renamedPairs(sections.get("renamed requirements")),
  };
}

/** Nombres de requirement presentes en una spec principal. */
export function mainRequirementNames(content) {
  return new Set(headerNames(String(content ?? "").replace(/\r\n/g, "\n").split("\n")));
}

// Estado de una sola operacion frente a la spec principal. `exists` distingue una capacidad nueva,
// donde la CLI solo admite ADDED (specs-apply.js:148) e ignora REMOVED.
function classifyOperation(kind, operation, present, exists) {
  if (kind === "added") return present ? OP_APPLIED : OP_PENDING;

  if (kind === "removed") {
    if (!exists) return OP_NEUTRAL;
    return present ? OP_PENDING : OP_APPLIED;
  }

  if (kind === "modified") {
    if (!exists) return OP_INDETERMINATE;
    // Aplicar un MODIFIED reemplaza el bloque entero (specs-apply.js:223), asi que es idempotente:
    // su presencia no distingue sincronizado de pendiente y no debe forzar una clasificacion.
    return present ? OP_NEUTRAL : OP_INDETERMINATE;
  }

  if (!exists) return OP_INDETERMINATE;
  const { fromPresent, toPresent } = operation;
  if (fromPresent && !toPresent) return OP_PENDING;
  if (!fromPresent && toPresent) return OP_APPLIED;
  return OP_INDETERMINATE;
}

/**
 * Clasifica el estado de sincronizacion de un change completo.
 *
 * @param {Array<{capability: string, delta: string, mainSpec: string|null}>} capabilities
 * @returns {{state: string, operations: Array, discrepancies: Array}}
 */
export function classifySyncState(capabilities) {
  const operations = [];

  for (const { capability, delta, mainSpec } of capabilities ?? []) {
    const exists = typeof mainSpec === "string";
    const present = exists ? mainRequirementNames(mainSpec) : new Set();
    const parsed = parseDeltaOperations(delta);

    for (const name of parsed.added) {
      operations.push({ capability, kind: "added", name, status: classifyOperation("added", { name }, present.has(name), exists) });
    }
    for (const name of parsed.modified) {
      operations.push({ capability, kind: "modified", name, status: classifyOperation("modified", { name }, present.has(name), exists) });
    }
    for (const name of parsed.removed) {
      operations.push({ capability, kind: "removed", name, status: classifyOperation("removed", { name }, present.has(name), exists) });
    }
    for (const { from, to } of parsed.renamed) {
      const detail = { fromPresent: present.has(from), toPresent: present.has(to) };
      operations.push({
        capability,
        kind: "renamed",
        name: `${from} -> ${to}`,
        status: classifyOperation("renamed", detail, null, exists),
      });
    }
  }

  const indeterminate = operations.filter((operation) => operation.status === OP_INDETERMINATE);
  if (indeterminate.length) return { state: SYNC_PARTIAL, operations, discrepancies: indeterminate };

  const decisive = operations.filter((operation) => operation.status === OP_APPLIED || operation.status === OP_PENDING);

  // Sin operaciones decisivas (solo neutras, o ninguna delta) la aplicacion es idempotente y conserva
  // a la CLI como unico owner de la escritura, asi que se archiva aplicando deltas.
  if (!decisive.length) return { state: SYNC_PENDING, operations, discrepancies: [] };

  const applied = decisive.filter((operation) => operation.status === OP_APPLIED);
  if (applied.length === decisive.length) return { state: SYNC_SYNCED, operations, discrepancies: [] };
  if (applied.length === 0) return { state: SYNC_PENDING, operations, discrepancies: [] };

  // Mezcla: aplicar deltas aborta a medias dejando specs escritas, y omitirlas archiva declarando
  // sincronizado algo que no lo esta. Ninguna rama es segura, asi que se nombra la discrepancia.
  return { state: SYNC_PARTIAL, operations, discrepancies: decisive.filter((operation) => operation.status === OP_PENDING) };
}

/**
 * Parsea la salida de `git status --porcelain`.
 *
 * El estado ocupa las dos primeras columnas y la primera suele ser un espacio, asi que la salida NO se
 * puede recortar antes de partirla: recortarla se come ese espacio en la primera linea y desplaza su
 * ruta un caracter. Con `openspec/...` como primer archivo modificado, se leeria `penspec/...`, no
 * empezaria por `openspec/` y el comando abortaria declarando trabajo ajeno donde no lo hay.
 */
export function parseStatusEntries(raw) {
  return String(raw ?? "")
    .split("\n")
    .filter((line) => line.length > 3)
    .map((line) => ({ status: line.slice(0, 2), file: line.slice(3).replace(/\r$/, "").trim().replaceAll("\\", "/") }));
}

/** Clasifica que encontro el comando en el repositorio antes de actuar. */
export function classifyRepositoryState({ changeDirExists, archiveDirExists, archiveCommitted } = {}) {
  if (changeDirExists && archiveDirExists) return REPO_UNCLASSIFIABLE;
  if (changeDirExists) return REPO_READY;
  if (!archiveDirExists) return REPO_UNCLASSIFIABLE;
  return archiveCommitted ? REPO_ARCHIVED_COMMITTED : REPO_ARCHIVED_UNCOMMITTED;
}
