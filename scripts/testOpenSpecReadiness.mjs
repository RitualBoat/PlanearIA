import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { report, summaryFor, validateArchive, validateIssue } from "./checkOpenSpecReadiness.mjs";

const now = new Date("2026-07-15T12:00:00Z");
const issueBody = `## Contexto\n\n## Historia Original\n\n## Enriquecida\n\n**No objetivos.**\n\n**Rollback.**\n\n<!-- openspec-readiness:pre-propose\n{"schemaVersion":1,"change":"sample-change","execution":"versioned","dependencies":[49],"currentState":"CodeGraph","surfaces":["docs","harness"],"manualIntervention":"none","exceptions":[]}\nopenspec-readiness:pre-propose -->`;
const issue = { state: "OPEN", body: issueBody, projectItems: [{ title: "PlanearIA Product OS" }], dependencyStates: [{ number: 49, state: "CLOSED" }] };
assert.equal(report(validateIssue(issue, { now })).ok, true);
assert.equal(report(validateIssue({ ...issue, body: issueBody.replace("**Rollback.**", "") }, { now })).ok, false);
assert.equal(report(validateIssue({ ...issue, projectItems: [] }, { now })).ok, false);
assert.equal(report(validateIssue({ ...issue, dependencyStates: [{ number: 49, state: "OPEN" }] }, { now })).ok, false);

// --- El resumen de cada linea debe describir el estado que reporta ---
//
// Regresion de #113: addRequired reutilizaba el texto de fallo tambien en PASS, asi que el gate
// imprimia "PASS tldr: Falta TLDR.md en la raiz del change". Un informe que se contradice a si mismo
// no sirve como evidencia, que es exactamente para lo que existe este gate.
assert.equal(summaryFor({ pass: "Verificado.", fail: "Falta X." }, "PASS"), "Verificado.");
assert.equal(summaryFor({ pass: "Verificado.", fail: "Falta X." }, "FAIL"), "Falta X.");
// La forma legacy de un solo texto se marca en PASS en vez de afirmar el fallo como si fuera exito.
assert.match(summaryFor("Falta X.", "PASS"), /Resumen sin variante PASS declarada/);
assert.equal(summaryFor("Falta X.", "FAIL"), "Falta X.");

// Sobre el gate real: ninguna linea PASS puede contener el vocabulario de fallo de su propia
// verificacion. Fija el defecto sobre el informe completo, no solo sobre el helper.
const NEGACIONES = /(Falta|Faltan|no cumple|no coincide|no enlaza|no reconocidas|sin cerrar|pendientes|debe permanecer|debe pertenecer|desconocidos|no permitidos)/;
const informeIssue = validateIssue(issue, { now }).results;
assert.equal(informeIssue.length > 0, true);
for (const linea of informeIssue.filter((item) => item.status === "PASS")) {
  assert.equal(NEGACIONES.test(linea.summary), false, `La linea PASS ${linea.id} describe un fallo: ${linea.summary}`);
}
// Y las lineas FAIL si deben describirlo, para que la prueba no pase por vacuidad.
const informeRoto = validateIssue({ ...issue, state: "CLOSED", projectItems: [] }, { now }).results;
const fallos = informeRoto.filter((item) => item.status === "FAIL");
assert.equal(fallos.length >= 2, true);
assert.equal(fallos.every((linea) => NEGACIONES.test(linea.summary)), true);

const root = mkdtempSync(path.join(tmpdir(), "planearia-readiness-"));
const changeRoot = path.join(root, "openspec", "changes", "sample-change");
mkdirSync(changeRoot, { recursive: true });
writeFileSync(path.join(changeRoot, "proposal.md"), "- Issue: #62\n");
writeFileSync(path.join(changeRoot, "tasks.md"), "- [x] done\n");
writeFileSync(path.join(changeRoot, "TLDR.md"), "resumen\n");
const baselinePath = path.join(changeRoot, "brownfield-baseline.md");
const validBaseline = `# Baseline brownfield: sample-change

## Superficies tocadas

- scripts/checkOpenSpecReadiness.mjs

## Fuentes de verdad actuales

- openspec/specs/openspec-readiness-gates/spec.md

## Comportamiento vigente

- El gate valida artefactos de archive.

## Comportamiento objetivo

- El gate también valida el baseline brownfield.

## Compatibilidad legacy

- Se conserva readiness.json sin campos nuevos.

## Owner de spec y contexto

- Harness operativo; no mueve entidades docentes.

## Evidencia actual

- Fixture local del checker.

## Fuera de alcance

- No modifica UI ni datos de producto.
`;
writeFileSync(baselinePath, validBaseline);
const manifest = {
  schemaVersion: 1,
  issue: 62,
  change: "sample-change",
  surfaces: ["docs", "harness"],
  validations: ["openspec-strict", "harness-parity", "opsx-patch"],
  evidence: [
    { id: "issue-link", ref: "https://example.test/issues/62" },
    { id: "pr-link", ref: "https://example.test/pr/1" },
    { id: "adversarial-review", ref: "PASS" },
    { id: "docs-verification", ref: "docs check" },
    { id: "fixtures", ref: "fixtures pass" },
  ],
  rollback: { strategy: "Revertir el commit del checker y regenerar mirrors." },
  adversarialReview: { ref: "PASS" },
  exceptions: [],
};
writeFileSync(path.join(changeRoot, "readiness.json"), JSON.stringify(manifest));
const healthyRun = () => ({ status: 0, stdout: "ok", stderr: "" });
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun, runLocal: true })).ok, true);
rmSync(baselinePath, { force: true });
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun })).ok, false);
mkdirSync(baselinePath);
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun })).ok, false);
rmSync(baselinePath, { recursive: true, force: true });
writeFileSync(baselinePath, "# Baseline brownfield: sample-change\n\n## Superficies tocadas\n\n- scripts/checkOpenSpecReadiness.mjs\n");
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun })).ok, false);
writeFileSync(baselinePath, validBaseline);
writeFileSync(path.join(changeRoot, "tasks.md"), "- [ ] pending\n");
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun })).ok, false);
writeFileSync(path.join(changeRoot, "tasks.md"), "- [x] done\n");
manifest.exceptions = [{ field: "manual-evidence", reason: "Pendiente temporal", owner: "RitualBoat", approvedBy: "RitualBoat", expiresOn: "2026-07-20", recovery: "Adjuntar evidencia antes de archive." }];
manifest.evidence = manifest.evidence.filter((item) => item.id !== "fixtures");
writeFileSync(path.join(changeRoot, "readiness.json"), JSON.stringify(manifest));
const exceptionReport = report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun }));
assert.equal(exceptionReport.ok, true);
assert.ok(exceptionReport.results.some((item) => item.status === "EXCEPTION"));
manifest.exceptions[0].expiresOn = "2026-07-01";
writeFileSync(path.join(changeRoot, "readiness.json"), JSON.stringify(manifest));
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun })).ok, false);
manifest.exceptions = [{ field: "tasks-complete", reason: "No permitido", owner: "RitualBoat", approvedBy: "RitualBoat", expiresOn: "2026-07-20", recovery: "Completar tarea." }];
writeFileSync(path.join(changeRoot, "readiness.json"), JSON.stringify(manifest));
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun })).ok, false);
assert.equal(report(validateArchive({ root, change: "../escape", now, runCommand: healthyRun })).ok, false);
manifest.commands = ["dangerous command"];
writeFileSync(path.join(changeRoot, "readiness.json"), JSON.stringify(manifest));
assert.equal(report(validateArchive({ root, change: "sample-change", now, runCommand: healthyRun })).ok, false);
rmSync(root, { recursive: true, force: true });
process.stdout.write("OpenSpec readiness tests passed.\n");
