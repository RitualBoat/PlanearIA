// Cierre de un change OpenSpec mediante PR. development es protegida: este
// script nunca hace checkout, merge ni push directo sobre el target.
//
// Uso:
//   node scripts/opsxFinishChange.mjs [--target development] [--dry-run] [--keep-remote]

import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => (has(flag) ? args[args.indexOf(flag) + 1] : fallback);
const DRY = has('--dry-run');
const KEEP_REMOTE = has('--keep-remote');
const TARGET = value('--target', 'development');
const PROTECTED = ['main', 'master', 'development'];

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
ok(`esperando checks requeridos del PR #${pullRequest.number}`);
gh('pr', 'checks', String(pullRequest.number), '--watch', '--fail-fast', { capture: false });

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
