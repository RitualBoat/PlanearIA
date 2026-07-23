#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runCli(script, args = [], timeout = 30000) {
  const execution = spawnSync(process.execPath, [path.join(ROOT, script), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, CI: "true", NO_COLOR: "1" },
    timeout,
  });
  if (execution.error) throw execution.error;
  return {
    status: execution.status ?? 1,
    stdout: execution.stdout ?? "",
    stderr: execution.stderr ?? "",
    output: `${execution.stdout ?? ""}${execution.stderr ?? ""}`,
  };
}

function assertExecuted(name, execution, { status, output }) {
  assert.equal(execution.status, status, `${name} devolvió ${execution.status}: ${execution.output}`);
  assert.match(execution.output, output, `${name} no produjo su marcador de ejecución: ${execution.output}`);
}

// Caso negativo del propio arnés: un guard que no ejecuta main retorna 0 y no imprime nada. Esta
// aserción evita que la prueba pase si alguno de los entrypoints vuelve a ese falso verde.
assert.throws(
  () => assertExecuted("entrypoint ausente", { status: 0, output: "" }, { status: 2, output: /Uso:/ }),
  /entrypoint ausente/,
);

assertExecuted(
  "checkOpenSpecReadiness",
  runCli("scripts/checkOpenSpecReadiness.mjs", ["--phase", "invalida"]),
  { status: 2, output: /OpenSpec readiness: FAIL - Uso:/ },
);
assertExecuted(
  "checkOpenSpecTldr",
  runCli("scripts/checkOpenSpecTldr.mjs"),
  { status: 0, output: /openspec-tldr: OK/ },
);
assertExecuted(
  "gitNexusFts",
  runCli("scripts/gitNexusFts.mjs", ["modo-invalido"]),
  { status: 1, output: /Usage: node scripts\/gitNexusFts\.mjs/ },
);

const doctor = runCli("scripts/harnessDoctor.mjs", ["--json", "--entrypoint-test"]);
assertExecuted(
  "harnessDoctor",
  doctor,
  { status: doctor.status, output: /^\s*\{/ },
);
assert.equal(doctor.stderr, "", `harnessDoctor emitió stderr inesperado: ${doctor.stderr}`);
assert.doesNotThrow(() => JSON.parse(doctor.stdout), `harnessDoctor no emitió JSON válido: ${doctor.output}`);
const doctorReport = JSON.parse(doctor.stdout);
assert.equal(doctor.status, doctorReport.ok ? 0 : 1, `harnessDoctor devolvió código incoherente: ${doctor.output}`);
assert.equal(Array.isArray(doctorReport.checks), true, "harnessDoctor no emitió checks.");
assert.equal(doctorReport.checks.length > 0, true, "harnessDoctor emitió un conjunto de checks vacío.");
assert.equal(doctorReport.checks.some((check) => check.id === "gitnexus"), true, "harnessDoctor omitió el check gitnexus.");
for (const check of doctorReport.checks) {
  const expectedStatus = check.id === "graphify" ? "SKIP" : "FAIL";
  assert.equal(check.status, expectedStatus, `--entrypoint-test dejó ${check.id} en ${check.status}.`);
}
assert.doesNotMatch(doctor.output, /(?:ExperimentalWarning|DEP0190)/, `harnessDoctor emitió warning de runtime: ${doctor.output}`);

const doctorHelp = runCli("scripts/harnessDoctor.mjs", ["--help"]);
assertExecuted(
  "harnessDoctor --help",
  doctorHelp,
  { status: 0, output: /Usage: node scripts\/harnessDoctor\.mjs \[--json\]/ },
);

process.stdout.write("Harness CLI entrypoint tests passed.\n");
