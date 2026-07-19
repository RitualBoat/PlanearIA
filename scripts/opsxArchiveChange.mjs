// Paso de archive de un change OpenSpec. Es el unico owner de este tramo: clasifica antes de escribir,
// delega la sincronizacion de specs y el movimiento del directorio a la CLI, y consolida la salida en un
// commit de la rama del change para que `opsx:finish` encuentre el arbol limpio.
//
// La CLI de OpenSpec ya aplica las deltas a las specs principales durante el archive
// (dist/core/archive.js:375-386) y mueve el directorio degradando a copy+remove en Windows (:415). Este
// comando no reimplementa ninguna de las dos cosas: decide cual invocacion corresponde y con que
// banderas, que es justo lo que faltaba.
//
// Uso:
//   node scripts/opsxArchiveChange.mjs <change> [--dry-run] [--target development]

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  REPO_ARCHIVED_COMMITTED,
  REPO_ARCHIVED_UNCOMMITTED,
  REPO_READY,
  REPO_UNCLASSIFIABLE,
  SYNC_PARTIAL,
  SYNC_PENDING,
  SYNC_SYNCED,
  classifyRepositoryState,
  classifySyncState,
  parseStatusEntries,
} from './lib/openspecArchiveState.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => (has(flag) ? args[args.indexOf(flag) + 1] : fallback);
const DRY = has('--dry-run');
const TARGET = value('--target', 'development');
const PROTECTED = ['main', 'master', 'development'];

const CHANGES_DIR = path.join(ROOT, 'openspec', 'changes');
const ARCHIVE_DIR = path.join(CHANGES_DIR, 'archive');
const SPECS_DIR = path.join(ROOT, 'openspec', 'specs');

function abort(message) {
  console.error(`\n[opsx:archive] ABORTADO: ${message}\n`);
  process.exit(1);
}

function ok(message) {
  console.log(`[opsx:archive] ${message}`);
}

function readGit(...commandArgs) {
  return execFileSync('git', commandArgs, { encoding: 'utf8', cwd: ROOT }).trim();
}

// Deliberadamente sin trim: el parser documenta por que en openspecArchiveState.mjs.
function statusEntries(...pathspec) {
  return parseStatusEntries(execFileSync('git', ['status', '--porcelain', ...pathspec], { encoding: 'utf8', cwd: ROOT }));
}

function git(...commandArgs) {
  if (DRY) {
    console.log(`  [dry-run] git ${commandArgs.join(' ')}`);
    return '';
  }
  return readGit(...commandArgs);
}

// Ni `npm` ni `npm.cmd` sirven aqui. En Windows npm es un .cmd, y desde la correccion de CVE-2024-27980
// Node rechaza spawnear .cmd/.bat sin `shell: true` (EINVAL, status null). Activar el shell devolveria
// argumentos concatenados sin escapar (DEP0190). La salida es no pasar por npm: se ejecuta el script de
// Node directamente con el mismo interprete, sin shell, sin .cmd y sin superficie de inyeccion.
const OPENSPEC_BIN = path.join(ROOT, 'node_modules', '@fission-ai', 'openspec', 'bin', 'openspec.js');

function runNode(scriptPath, scriptArgs, { inherit = false } = {}) {
  return spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe',
  });
}

function positional() {
  const found = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--target') {
      index += 1;
      continue;
    }
    if (!args[index].startsWith('--')) found.push(args[index]);
  }
  return found;
}

const names = positional();
if (names.length > 1) abort(`Se esperaba un solo change; recibio: ${names.join(', ')}.`);
const change = names[0];
if (!change) abort('Falta el nombre del change. Uso: npm run opsx:archive -- <change>');
if (!/^[a-z0-9][a-z0-9-]*$/.test(change)) abort(`El change debe usar kebab-case y no puede contener rutas; recibio '${change}'.`);

// --- Guardia de rama: precede a toda lectura y a toda escritura ---
//
// Archivar fuera de la rama del change deja la salida sin rastrear en una rama protegida, que es la
// clase de fallo del cierre de #85. La guardia la elimina sin depender de diagnosticar la causa.
const branch = readGit('rev-parse', '--abbrev-ref', 'HEAD');
if (branch === 'HEAD') abort('Estas en detached HEAD. Cambia a la rama del change antes de archivar.');
if (PROTECTED.includes(branch)) abort(`Estas en '${branch}', una rama protegida. Cambia a la rama del change antes de archivar.`);
if (branch === TARGET) abort(`La rama actual es el target '${TARGET}'. Archiva desde la rama del change.`);

// --- Guardia de trabajo ajeno ---
//
// El comando crea un commit sobre openspec/. Cualquier cambio fuera de ahi seria arrastrado a ese
// commit sin haberlo pedido, asi que se exige resolverlo antes.
const foreign = statusEntries()
  .map((entry) => entry.file)
  .filter((file) => !file.startsWith('openspec/'));
if (foreign.length) {
  abort(
    `Hay cambios sin commitear fuera de openspec/:\n  ${foreign.join('\n  ')}\n` +
      '  Commitealos o guardalos antes de archivar; el commit del archive no debe arrastrarlos.',
  );
}

// --- Estado del repositorio ---

function findArchivedDir(name) {
  if (!existsSync(ARCHIVE_DIR)) return null;
  const pattern = new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  const match = readdirSync(ARCHIVE_DIR).find((entry) => pattern.test(entry));
  return match ? path.join(ARCHIVE_DIR, match) : null;
}

function relative(target) {
  return path.relative(ROOT, target).replaceAll('\\', '/');
}

const changeDir = path.join(CHANGES_DIR, change);
const archivedDir = findArchivedDir(change);
// La frescura del archive se mide solo sobre las rutas que el archive produce, por el mismo motivo que
// consolidate() acota su 'git add': trabajo ajeno dentro de openspec/ no debe alterar la clasificacion.
const archiveDirty = statusEntries('--', ...archivePaths(archivedDir)).length > 0;
const archiveTracked = archivedDir ? readGit('ls-files', '--', relative(archivedDir)).length > 0 : false;

const repositoryState = classifyRepositoryState({
  changeDirExists: existsSync(changeDir),
  archiveDirExists: Boolean(archivedDir),
  archiveCommitted: archiveTracked && !archiveDirty,
});

console.log(`\n[opsx:archive] Archivando '${change}' en '${branch}'${DRY ? ' (DRY-RUN)' : ''}\n`);

if (repositoryState === REPO_UNCLASSIFIABLE) {
  if (existsSync(changeDir) && archivedDir) {
    abort(
      `El change existe activo y archivado a la vez:\n  ${relative(changeDir)}\n  ${relative(archivedDir)}\n` +
        '  Probablemente un archive interrumpido. Resuelve cual de los dos es el bueno antes de reintentar.',
    );
  }
  abort(`No existe el change '${change}' ni activo en openspec/changes/ ni bajo archive/.`);
}

function issueNumber(root) {
  const file = path.join(root, 'readiness.json');
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')).issue ?? null;
  } catch {
    return null;
  }
}

// Rutas que produce el archive y solo ellas. `git add -A -- openspec/` arrastraria al commit cualquier
// otro trabajo sin commitear dentro de openspec/ (un segundo change en borrador, por ejemplo), que es
// justo lo que la guardia de trabajo ajeno quiere evitar y que esa guardia no cubre porque solo mira
// fuera de openspec/. Se enumeran: el origen borrado, el destino nuevo y las specs escritas.
// `git add -- <ruta>` es fatal si la ruta no existe en disco ni esta rastreada, que es exactamente el
// caso del directorio de origen en una reejecucion cuyo borrado ya quedo commiteado. Se filtra por eso.
function archivePaths(archiveTarget) {
  const candidates = ['openspec/specs', relative(changeDir)];
  if (archiveTarget) candidates.push(relative(archiveTarget));
  return candidates.filter(
    (candidate) => existsSync(path.join(ROOT, candidate)) || readGit('ls-files', '--', candidate).length > 0,
  );
}

function consolidate(message, archiveTarget) {
  const paths = archivePaths(archiveTarget);
  git('add', '-A', '--', ...paths);
  if (!DRY && !readGit('diff', '--cached', '--name-only', '--', ...paths)) {
    ok('no hay nada que consolidar; el archive ya estaba commiteado.');
    return false;
  }
  git('commit', '-m', message);
  ok(`commit del archive creado: ${message}`);
  return true;
}

// --- Reejecucion: no-op verificable o consolidacion, nunca un segundo archive ---

if (repositoryState === REPO_ARCHIVED_COMMITTED) {
  const commit = readGit('log', '-1', '--format=%h %s', '--', relative(archivedDir));
  ok(`'${change}' ya esta archivado y commiteado en ${relative(archivedDir)}.`);
  ok(`commit: ${commit}`);
  console.log(`\n[opsx:archive] Nada que hacer. Continua con 'npm run opsx:finish'.\n`);
  process.exit(0);
}

if (repositoryState === REPO_ARCHIVED_UNCOMMITTED) {
  const issue = issueNumber(archivedDir);
  ok(`'${change}' ya esta en ${relative(archivedDir)} pero su salida no esta commiteada.`);
  ok('se consolida sin repetir el archive.');
  consolidate(`docs(openspec): archivar ${change}${issue ? ` (#${issue})` : ''}`, archivedDir);
  console.log(`\n[opsx:archive] Listo. Continua con 'npm run opsx:finish'.\n`);
  process.exit(0);
}

// --- Ruta normal: gate, clasificacion, archive, consolidacion ---

ok('ejecutando el gate de readiness de archive');
const gate = runNode(path.join(ROOT, 'scripts', 'checkOpenSpecReadiness.mjs'), ['--phase', 'archive', '--change', change, '--run-local'], { inherit: true });
if (gate.status !== 0) {
  abort(`El gate de readiness reporto fallo para '${change}'. Resuelve cada FAIL antes de archivar.`);
}

function loadCapabilities() {
  const deltaDir = path.join(changeDir, 'specs');
  if (!existsSync(deltaDir)) return [];
  return readdirSync(deltaDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const delta = path.join(deltaDir, entry.name, 'spec.md');
      if (!existsSync(delta)) return null;
      const main = path.join(SPECS_DIR, entry.name, 'spec.md');
      return {
        capability: entry.name,
        delta: readFileSync(delta, 'utf8'),
        mainSpec: existsSync(main) ? readFileSync(main, 'utf8') : null,
      };
    })
    .filter(Boolean);
}

const capabilities = loadCapabilities();
const sync = classifySyncState(capabilities);
ok(`estado de sincronizacion: ${sync.state} (${capabilities.length} capacidad(es), ${sync.operations.length} operacion(es))`);

if (sync.state === SYNC_PARTIAL) {
  const detail = sync.discrepancies
    .map((operation) => `  ${operation.capability}: ${operation.kind.toUpperCase()} "${operation.name}" -> ${operation.status}`)
    .join('\n');
  abort(
    'Las deltas estan sincronizadas solo en parte. Aplicarlas abortaria a medias dejando specs escritas, y\n' +
      '  omitirlas archivaria declarando sincronizado algo que no lo esta. Ninguna rama es segura.\n\n' +
      `  Discrepancias:\n${detail}\n\n` +
      '  Resuelve la spec principal para que la delta quede totalmente aplicada o totalmente sin aplicar,\n' +
      '  y vuelve a ejecutar. No se escribio ninguna spec ni se movio el change.',
  );
}

const skipSpecs = sync.state === SYNC_SYNCED;
if (skipSpecs) {
  ok('las deltas ya estan aplicadas en las specs principales; se archiva con --skip-specs');
} else if (sync.state === SYNC_PENDING) {
  ok('las deltas no estan aplicadas; la CLI las aplicara durante el archive');
}

const archiveArgs = ['archive', change, '--yes'];
if (skipSpecs) archiveArgs.push('--skip-specs');

if (DRY) {
  console.log(`  [dry-run] node ${relative(OPENSPEC_BIN)} ${archiveArgs.join(' ')}`);
  const issue = issueNumber(changeDir);
  console.log(`  [dry-run] git add -A -- openspec/`);
  console.log(`  [dry-run] git commit -m "${commitMessage(issue, skipSpecs)}"`);
  console.log(`\n[opsx:archive] dry-run termina sin escribir. Estado clasificado: ${sync.state}.\n`);
  process.exit(0);
}

function commitMessage(issue, skipped) {
  const suffix = issue ? ` (#${issue})` : '';
  return skipped
    ? `docs(openspec): archivar ${change} con specs ya sincronizadas${suffix}`
    : `docs(openspec): archivar ${change} y sincronizar specs${suffix}`;
}

const issue = issueNumber(changeDir);
const archived = runNode(OPENSPEC_BIN, archiveArgs, { inherit: true });
if (archived.status !== 0) {
  abort(`La CLI de OpenSpec no pudo archivar '${change}'. El change no se movio; revisa el diagnostico anterior.`);
}

consolidate(commitMessage(issue, skipSpecs), findArchivedDir(change));

const finalDir = findArchivedDir(change);
if (!finalDir) abort('El archive termino pero no se encontro el directorio archivado. Revisa openspec/changes/archive/.');
if (statusEntries('--', ...archivePaths(finalDir)).length) {
  abort('Quedaron cambios sin commitear en openspec/ tras consolidar. Revisa git status antes de continuar.');
}

ok(`'${change}' archivado en ${relative(finalDir)} y consolidado en '${branch}'`);
console.log(`\n[opsx:archive] Listo. Continua con 'npm run opsx:finish'.\n`);
