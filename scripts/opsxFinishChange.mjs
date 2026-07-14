// Cierre de un change OpenSpec: mergea la rama del change en development, hace
// push y borra la rama (local y remota). Se ejecuta DESPUES de /opsx:archive,
// cuando el change ya quedo archivado y commiteado, para que las ramas de
// trabajo no se acumulen (una rama por change).
//
// Uso:
//   node scripts/opsxFinishChange.mjs [--target development] [--dry-run] [--keep-remote]
//
// Guardas (por que): un merge+borrado equivocado es dificil de revertir, asi que
// el script se niega a correr desde una rama protegida o con cambios sin commitear,
// y solo borra la rama si git confirma que quedo 100% mergeada (`branch -d`).

import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => (has(f) ? args[args.indexOf(f) + 1] : d);

const DRY = has("--dry-run");
const KEEP_REMOTE = has("--keep-remote");
const TARGET = val("--target", "development");
const PROTECTED = ["main", "master", "development"];

function git(cmd) {
  return execSync(`git ${cmd}`, { encoding: "utf8" }).trim();
}
function run(cmd) {
  if (DRY) {
    console.log(`  [dry-run] git ${cmd}`);
    return "";
  }
  return execSync(`git ${cmd}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();
}
function die(msg) {
  console.error(`\n[opsx:finish] ABORTADO: ${msg}\n`);
  process.exit(1);
}
function ok(msg) {
  console.log(`[opsx:finish] ${msg}`);
}

// 1) Rama actual: debe ser la rama del change, no una protegida.
const branch = git("rev-parse --abbrev-ref HEAD");
if (branch === "HEAD") die("Estas en detached HEAD. Cambia a la rama del change.");
if (PROTECTED.includes(branch)) {
  die(`Estas en '${branch}' (rama protegida). Ejecuta esto desde la rama del change, no desde ${PROTECTED.join("/")}.`);
}
if (branch === TARGET) die(`La rama actual es el target '${TARGET}'. Nada que cerrar.`);

// 2) Arbol limpio: el archive ya debio commitearse.
if (git("status --porcelain")) {
  die("Hay cambios sin commitear. Corre /opsx:archive y commitea antes de cerrar la rama (git status).");
}

console.log(`\n[opsx:finish] Cerrando change '${branch}' -> '${TARGET}'${DRY ? "  (DRY-RUN)" : ""}\n`);

// 3) Sincronizar refs y validar que target no diverja del remoto.
run("fetch origin --prune");
const remoteTargetExists = (() => {
  try {
    git(`rev-parse --verify --quiet refs/remotes/origin/${TARGET}`);
    return true;
  } catch {
    return false;
  }
})();

// 4) Pasar a target y ponerlo al dia (solo fast-forward; si diverge, el usuario decide).
run(`checkout ${TARGET}`);
if (remoteTargetExists && !DRY) {
  try {
    git(`merge --ff-only origin/${TARGET}`);
  } catch {
    run(`checkout ${branch}`);
    die(`'${TARGET}' local diverge de origin/${TARGET}. Reconcilialo a mano (git pull) y reintenta.`);
  }
} else if (remoteTargetExists) {
  console.log(`  [dry-run] git merge --ff-only origin/${TARGET}`);
}

// 5) Merge de la rama del change (merge commit explicito: deja rastro del change en la historia).
const mergeMsg = `Merge ${branch} into ${TARGET} (opsx finish)`;
try {
  run(`merge --no-ff ${branch} -m "${mergeMsg}"`);
} catch {
  run("merge --abort");
  run(`checkout ${branch}`);
  die(`Conflicto al mergear '${branch}' en '${TARGET}'. Resuelvelo a mano y reintenta.`);
}
ok(`merge OK (${branch} -> ${TARGET})`);

// 6) Push del target.
run(`push origin ${TARGET}`);
ok(`push OK (origin/${TARGET})`);

// 7) Borrar la rama del change: local (solo si quedo mergeada) y remota.
try {
  run(`branch -d ${branch}`);
  ok(`rama local '${branch}' borrada`);
} catch {
  run(`checkout ${branch}`);
  die(`No pude borrar '${branch}' con -d (git la ve como no-mergeada). Revisa antes de forzar.`);
}

const remoteBranchExists = (() => {
  try {
    git(`rev-parse --verify --quiet refs/remotes/origin/${branch}`);
    return true;
  } catch {
    return false;
  }
})();
if (remoteBranchExists && !KEEP_REMOTE) {
  run(`push origin --delete ${branch}`);
  ok(`rama remota 'origin/${branch}' borrada`);
} else if (remoteBranchExists) {
  ok(`rama remota 'origin/${branch}' conservada (--keep-remote)`);
}

console.log(`\n[opsx:finish] Listo. '${branch}' cerrada y mergeada en '${TARGET}'.${DRY ? "  (no se ejecuto nada: DRY-RUN)" : ""}\n`);
