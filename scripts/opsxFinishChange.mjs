// Cierre de un change OpenSpec mediante PR. development es protegida: este
// script nunca hace checkout, merge ni push directo sobre el target.
//
// Uso:
//   node scripts/opsxFinishChange.mjs [--target development] [--dry-run] [--keep-remote]
//                                     [--checks-deadline <segundos>] [--checks-interval <segundos>]

import { execFileSync, spawnSync } from 'node:child_process';
import {
  CHECKS_FAILED,
  CHECKS_NOT_REGISTERED,
  waitForChecks,
} from './lib/prChecksWait.mjs';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => (has(flag) ? args[args.indexOf(flag) + 1] : fallback);
const DRY = has('--dry-run');
const KEEP_REMOTE = has('--keep-remote');
const TARGET = value('--target', 'development');
const PROTECTED = ['main', 'master', 'development'];

function seconds(flag, fallback) {
  const raw = value(flag, String(fallback));
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) abort(`${flag} espera segundos no negativos; recibio '${raw}'.`);
  return parsed * 1000;
}

// GitHub tarda segundos en registrar los checks del commit recien empujado. El deadline cubre esa ventana y
// sigue siendo corto frente a la duracion de CI. --checks-deadline 0 fuerza una sola consulta: el
// comportamiento previo al sondeo, documentado como via de desactivacion.
const CHECKS_DEADLINE_MS = seconds('--checks-deadline', 120);
const CHECKS_INTERVAL_MS = seconds('--checks-interval', 5);

function execute(command, commandArgs, { capture = true } = {}) {
  if (DRY) {
    console.log(`  [dry-run] ${command} ${commandArgs.join(' ')}`);
    return '';
  }

  const output = execFileSync(command, commandArgs, {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  return (output ?? '').trim();
}

function git(...commandArgs) {
  return execute('git', commandArgs);
}

function readGit(...commandArgs) {
  return execFileSync('git', commandArgs, { encoding: 'utf8' }).trim();
}

function gh(...commandArgs) {
  const options = typeof commandArgs.at(-1) === 'object' ? commandArgs.pop() : undefined;
  return execute('gh', commandArgs, options);
}

function abort(message) {
  console.error(`\n[opsx:finish] ABORTADO: ${message}\n`);
  process.exit(1);
}

function ok(message) {
  console.log(`[opsx:finish] ${message}`);
}

const branch = readGit('rev-parse', '--abbrev-ref', 'HEAD');
if (branch === 'HEAD') abort('Estas en detached HEAD. Cambia a la rama del change.');
if (PROTECTED.includes(branch)) abort(`Estas en '${branch}', una rama protegida.`);
if (branch === TARGET) abort(`La rama actual es el target '${TARGET}'. Nada que cerrar.`);
if (readGit('status', '--porcelain')) abort('Hay cambios sin commitear. Archiva y commitea antes de cerrar.');

console.log(`\n[opsx:finish] Cerrando '${branch}' -> '${TARGET}' mediante PR${DRY ? ' (DRY-RUN)' : ''}\n`);

gh('auth', 'status');
git('fetch', 'origin', '--prune');
git('push', '-u', 'origin', branch);

let pullRequest;
try {
  pullRequest = JSON.parse(gh('pr', 'view', branch, '--json', 'number,state,url,headRefOid'));
} catch {
  const title = `Cierra ${branch} en ${TARGET}`;
  const body = `Cierre automatizado del change OpenSpec desde \`${branch}\`.\n\n- Merge mediante PR protegido\n- CI requerida antes de merge\n- Limpieza de rama solo tras merge remoto`;
  const created = gh('pr', 'create', '--base', TARGET, '--head', branch, '--title', title, '--body', body);
  if (DRY) {
    ok('PR seria creado; dry-run termina antes de esperar CI.');
    process.exit(0);
  }
  pullRequest = JSON.parse(gh('pr', 'view', branch, '--json', 'number,state,url,headRefOid'));
  ok(`PR creado: ${created || pullRequest.url}`);
}

if (pullRequest.state !== 'OPEN') abort(`El PR #${pullRequest.number} no esta abierto (${pullRequest.state}).`);

// Fase 1: sondear hasta que GitHub registre los checks. gh --watch no cubre esta ventana porque falla antes
// de su bucle cuando el rollup del commit sigue vacio, y su codigo de salida no la distingue de una CI en
// rojo. Se clasifica por evidencia; solo el rollup vacio reintenta.
ok(`esperando el registro de checks del PR #${pullRequest.number} (hasta ${CHECKS_DEADLINE_MS / 1000}s)`);
const probe = await waitForChecks({
  runChecks: async () => {
    const result = spawnSync('gh', ['pr', 'checks', String(pullRequest.number)], { encoding: 'utf8' });
    return { exitCode: result.status, stderr: result.stderr ?? '' };
  },
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now: () => Date.now(),
  deadlineMs: CHECKS_DEADLINE_MS,
  intervalMs: CHECKS_INTERVAL_MS,
});

if (probe.outcome === CHECKS_NOT_REGISTERED) {
  abort(
    `El PR #${pullRequest.number} no reporto checks tras ${Math.round(probe.waitedMs / 1000)}s (${probe.attempts} consultas).\n` +
      `  Commit evaluado: ${pullRequest.headRefOid}\n` +
      `  Revisa: ${pullRequest.url}/checks y que los workflows apliquen a '${TARGET}'.\n` +
      '  El PR queda sin mergear. Sube el limite con --checks-deadline <segundos> si CI tarda mas en arrancar.',
  );
}

if (probe.outcome === CHECKS_FAILED) {
  abort(
    `Los checks del PR #${pullRequest.number} fallaron o no se pudieron consultar.\n` +
      `  Revisa: ${pullRequest.url}/checks\n` +
      '  El PR queda sin mergear.',
  );
}

// Fase 2: los checks ya existen; esperar a que terminen conserva la exigencia vigente sobre todos ellos.
ok(`esperando checks requeridos del PR #${pullRequest.number}`);
try {
  gh('pr', 'checks', String(pullRequest.number), '--watch', '--fail-fast', { capture: false });
} catch {
  // gh ya imprimio la tabla de checks; un stack trace de execFileSync solo taparia el diagnostico util.
  abort(`Los checks del PR #${pullRequest.number} no terminaron en verde. Revisa: ${pullRequest.url}/checks`);
}

if (DRY) {
  ok('dry-run termina antes de merge y limpieza.');
  process.exit(0);
}

gh('pr', 'merge', String(pullRequest.number), '--merge', '--delete-branch', '--match-head-commit', pullRequest.headRefOid);
ok(`PR #${pullRequest.number} mergeado por GitHub`);

git('fetch', 'origin', '--prune');
git('checkout', TARGET);
git('merge', '--ff-only', `origin/${TARGET}`);
try {
  git('rev-parse', '--verify', '--quiet', `refs/heads/${branch}`);
  git('branch', '-d', branch);
  ok(`rama local '${branch}' borrada`);
} catch {
  ok(`rama local '${branch}' ya fue borrada por GitHub CLI`);
}

if (KEEP_REMOTE) {
  ok(`rama remota conservada (--keep-remote): origin/${branch}`);
}

console.log(`\n[opsx:finish] Listo. '${branch}' se cerro mediante PR en '${TARGET}'.\n`);
