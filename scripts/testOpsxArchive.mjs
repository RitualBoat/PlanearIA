import assert from "node:assert/strict";
import {
  OP_APPLIED,
  OP_INDETERMINATE,
  OP_NEUTRAL,
  OP_PENDING,
  REPO_ARCHIVED_COMMITTED,
  REPO_ARCHIVED_UNCOMMITTED,
  REPO_READY,
  REPO_UNCLASSIFIABLE,
  SYNC_PARTIAL,
  SYNC_PENDING,
  SYNC_SYNCED,
  classifyRepositoryState,
  classifySyncState,
  mainRequirementNames,
  parseDeltaOperations,
  parseStatusEntries,
} from "./lib/openspecArchiveState.mjs";

// Los nombres de requirement usados aqui son los reales del cierre de #113, para que la suite falle si
// alguien cambia la forma canonica del encabezado que la CLI reconoce.
const REQ_A = "El archive de un change tiene un unico comando";
const REQ_B = "El estado de sincronizacion se clasifica en tres estados";
const REQ_C = "El archive verifica la rama antes de escribir";

function mainSpec(...names) {
  const blocks = names.map((name) => `### Requirement: ${name}\n\nEl sistema SHALL hacer algo.\n\n#### Scenario: Caso\n\n- **WHEN** pasa X\n- **THEN** pasa Y\n`);
  return `# capacidad Specification\n\n## Purpose\n\nAlgo.\n\n## Requirements\n${blocks.join("\n")}`;
}

function delta({ added = [], modified = [], removed = [], renamed = [] } = {}) {
  const parts = [];
  if (added.length) parts.push(`## ADDED Requirements\n\n${added.map((n) => `### Requirement: ${n}\n\nSHALL algo.\n\n#### Scenario: S\n\n- **WHEN** a\n- **THEN** b\n`).join("\n")}`);
  if (modified.length) parts.push(`## MODIFIED Requirements\n\n${modified.map((n) => `### Requirement: ${n}\n\nSHALL algo.\n\n#### Scenario: S\n\n- **WHEN** a\n- **THEN** b\n`).join("\n")}`);
  if (removed.length) parts.push(`## REMOVED Requirements\n\n${removed.map((n) => `### Requirement: ${n}`).join("\n")}\n`);
  if (renamed.length) parts.push(`## RENAMED Requirements\n\n${renamed.map((r) => `- FROM: \`### Requirement: ${r.from}\`\n- TO: \`### Requirement: ${r.to}\``).join("\n")}\n`);
  return parts.join("\n");
}

// --- parseDeltaOperations: las cuatro secciones y sus formas aceptadas ---

const parsed = parseDeltaOperations(
  delta({ added: [REQ_A], modified: [REQ_B], removed: [REQ_C], renamed: [{ from: "Viejo", to: "Nuevo" }] }),
);
assert.deepEqual(parsed.added, [REQ_A]);
assert.deepEqual(parsed.modified, [REQ_B]);
assert.deepEqual(parsed.removed, [REQ_C]);
assert.deepEqual(parsed.renamed, [{ from: "Viejo", to: "Nuevo" }]);

// REMOVED acepta tambien la forma de lista con backticks, igual que el lector de la CLI.
assert.deepEqual(
  parseDeltaOperations("## REMOVED Requirements\n\n- `### Requirement: Obsoleta`\n").removed,
  ["Obsoleta"],
);

// Una delta sin secciones no inventa operaciones.
const vacia = parseDeltaOperations("# Titulo\n\nTexto suelto.\n");
assert.deepEqual([vacia.added, vacia.modified, vacia.removed, vacia.renamed], [[], [], [], []]);

// El encabezado de spec principal se lee con la misma forma canonica.
assert.equal(mainRequirementNames(mainSpec(REQ_A, REQ_B)).size, 2);
assert.equal(mainRequirementNames(mainSpec(REQ_A)).has(REQ_A), true);

// --- classifySyncState: los tres estados ---

// pendiente: ninguna operacion decisiva esta aplicada.
const pendiente = classifySyncState([
  { capability: "cap", delta: delta({ added: [REQ_A, REQ_B] }), mainSpec: mainSpec(REQ_C) },
]);
assert.equal(pendiente.state, SYNC_PENDING);
assert.equal(pendiente.discrepancies.length, 0);
assert.equal(pendiente.operations.every((operation) => operation.status === OP_PENDING), true);

// sincronizada: todas las operaciones decisivas ya estan aplicadas.
const sincronizada = classifySyncState([
  { capability: "cap", delta: delta({ added: [REQ_A, REQ_B] }), mainSpec: mainSpec(REQ_A, REQ_B, REQ_C) },
]);
assert.equal(sincronizada.state, SYNC_SYNCED);
assert.equal(sincronizada.operations.every((operation) => operation.status === OP_APPLIED), true);

// parcial por mezcla: es el caso que ambas ramas corrompen, asi que debe abortar y nombrar la pendiente.
const mezcla = classifySyncState([
  { capability: "cap", delta: delta({ added: [REQ_A, REQ_B] }), mainSpec: mainSpec(REQ_A) },
]);
assert.equal(mezcla.state, SYNC_PARTIAL);
assert.deepEqual(mezcla.discrepancies.map((operation) => operation.name), [REQ_B]);

// parcial por MODIFIED ausente: la CLI abortaria en specs-apply.js:212, no hay rama segura.
const modificadaAusente = classifySyncState([
  { capability: "cap", delta: delta({ modified: [REQ_A] }), mainSpec: mainSpec(REQ_B) },
]);
assert.equal(modificadaAusente.state, SYNC_PARTIAL);
assert.deepEqual(modificadaAusente.discrepancies.map((operation) => operation.status), [OP_INDETERMINATE]);

// --- MODIFIED presente es neutra, no decisiva ---
//
// Aplicar un MODIFIED reemplaza el bloque entero (specs-apply.js:223): es idempotente, asi que su
// presencia no distingue sincronizado de pendiente. Una delta solo de MODIFIED debe archivar aplicando
// deltas, que conserva a la CLI como unico owner de la escritura.
const soloModificada = classifySyncState([
  { capability: "cap", delta: delta({ modified: [REQ_A] }), mainSpec: mainSpec(REQ_A) },
]);
assert.equal(soloModificada.state, SYNC_PENDING);
assert.deepEqual(soloModificada.operations.map((operation) => operation.status), [OP_NEUTRAL]);

// Una neutra no debe arrastrar la clasificacion de las decisivas que la acompanan.
assert.equal(
  classifySyncState([
    { capability: "cap", delta: delta({ added: [REQ_B], modified: [REQ_A] }), mainSpec: mainSpec(REQ_A, REQ_B) },
  ]).state,
  SYNC_SYNCED,
);

// --- REMOVED invierte el sentido de la presencia ---

assert.equal(
  classifySyncState([{ capability: "cap", delta: delta({ removed: [REQ_A] }), mainSpec: mainSpec(REQ_A) }]).state,
  SYNC_PENDING,
);
assert.equal(
  classifySyncState([{ capability: "cap", delta: delta({ removed: [REQ_A] }), mainSpec: mainSpec(REQ_B) }]).state,
  SYNC_SYNCED,
);

// --- RENAMED necesita las dos presencias para decidir ---

const renombrada = (mainNames) =>
  classifySyncState([
    { capability: "cap", delta: delta({ renamed: [{ from: "Viejo", to: "Nuevo" }] }), mainSpec: mainSpec(...mainNames) },
  ]);
assert.equal(renombrada(["Viejo"]).state, SYNC_PENDING);
assert.equal(renombrada(["Nuevo"]).state, SYNC_SYNCED);
// Ambos presentes o ninguno: la CLI abortaria (specs-apply.js:176, :179) y no hay rama segura.
assert.equal(renombrada(["Viejo", "Nuevo"]).state, SYNC_PARTIAL);
assert.equal(renombrada([]).state, SYNC_PARTIAL);

// --- Capacidad nueva: la spec principal aun no existe ---

// Solo ADDED es admisible para una spec nueva (specs-apply.js:148).
assert.equal(
  classifySyncState([{ capability: "nueva", delta: delta({ added: [REQ_A] }), mainSpec: null }]).state,
  SYNC_PENDING,
);
// REMOVED sobre spec inexistente la CLI lo ignora, asi que es neutra y no fuerza estado.
assert.equal(
  classifySyncState([{ capability: "nueva", delta: delta({ added: [REQ_A], removed: ["X"] }), mainSpec: null }]).state,
  SYNC_PENDING,
);
// MODIFIED sobre spec inexistente si aborta.
assert.equal(
  classifySyncState([{ capability: "nueva", delta: delta({ modified: [REQ_A] }), mainSpec: null }]).state,
  SYNC_PARTIAL,
);

// --- Varias capacidades: la clasificacion es global, porque --skip-specs tambien lo es ---

assert.equal(
  classifySyncState([
    { capability: "uno", delta: delta({ added: [REQ_A] }), mainSpec: mainSpec(REQ_A) },
    { capability: "dos", delta: delta({ added: [REQ_B] }), mainSpec: mainSpec(REQ_C) },
  ]).state,
  SYNC_PARTIAL,
);
assert.equal(
  classifySyncState([
    { capability: "uno", delta: delta({ added: [REQ_A] }), mainSpec: mainSpec(REQ_A) },
    { capability: "dos", delta: delta({ added: [REQ_B] }), mainSpec: mainSpec(REQ_B) },
  ]).state,
  SYNC_SYNCED,
);

// Un change sin deltas archiva por la ruta normal.
assert.equal(classifySyncState([]).state, SYNC_PENDING);

// --- parseStatusEntries: la columna de estado no se puede recortar ---
//
// Regresion observada durante el apply de #113: leer `git status --porcelain` con .trim() sobre la
// salida completa se come el espacio inicial de la PRIMERA linea y desplaza su ruta un caracter. Con un
// archivo de openspec/ en primera posicion, `openspec/...` se leia `penspec/...`, no empezaba por
// `openspec/` y el comando abortaba declarando trabajo ajeno donde no lo habia.
const PORCELAIN = " M openspec/changes/x/tasks.md\n M scripts/otro.mjs\n?? nuevo.txt\n";
assert.deepEqual(
  parseStatusEntries(PORCELAIN).map((entry) => entry.file),
  ["openspec/changes/x/tasks.md", "scripts/otro.mjs", "nuevo.txt"],
);
// La primera ruta debe seguir siendo reconocible como interna a openspec/.
assert.equal(parseStatusEntries(PORCELAIN)[0].file.startsWith("openspec/"), true);
// Y la version recortada, que es la que fallaba, no lo es: fija el defecto en vez de describirlo.
assert.equal(parseStatusEntries(PORCELAIN.trim())[0].file.startsWith("openspec/"), false);
assert.deepEqual(parseStatusEntries(PORCELAIN).map((entry) => entry.status), [" M", " M", "??"]);
// Rutas de Windows se normalizan a barras para comparar con el prefijo openspec/.
assert.equal(parseStatusEntries(" M openspec\\changes\\x\\tasks.md\n")[0].file, "openspec/changes/x/tasks.md");
assert.deepEqual(parseStatusEntries(""), []);

// --- classifyRepositoryState: los cuatro estados ---

assert.equal(classifyRepositoryState({ changeDirExists: true, archiveDirExists: false }), REPO_READY);
assert.equal(
  classifyRepositoryState({ changeDirExists: false, archiveDirExists: true, archiveCommitted: true }),
  REPO_ARCHIVED_COMMITTED,
);
assert.equal(
  classifyRepositoryState({ changeDirExists: false, archiveDirExists: true, archiveCommitted: false }),
  REPO_ARCHIVED_UNCOMMITTED,
);
// Activo y archivado a la vez: archive interrumpido, no hay eleccion segura.
assert.equal(classifyRepositoryState({ changeDirExists: true, archiveDirExists: true }), REPO_UNCLASSIFIABLE);
// Ninguno de los dos: el change no existe.
assert.equal(classifyRepositoryState({ changeDirExists: false, archiveDirExists: false }), REPO_UNCLASSIFIABLE);

// El estado archivado-commiteado exige las dos senales, no solo una.
assert.notEqual(
  classifyRepositoryState({ changeDirExists: false, archiveDirExists: true, archiveCommitted: false }),
  classifyRepositoryState({ changeDirExists: false, archiveDirExists: true, archiveCommitted: true }),
);

console.log("opsx-archive: OK (parseo de deltas, tres estados de sincronizacion, cuatro de repositorio)");
