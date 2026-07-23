#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { preArchiveGate, preProposeGate } from "../tools/debt-control/src/index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// SKIP existe para verificaciones opcionales declaradas como omitidas (p.ej. motor de deuda sin
// configurar). Nunca se usa para convertir un fallo en silencio: solo la ausencia de configuracion
// completa produce SKIP, y el texto siempre nombra la causa.
const STATUS = new Set(["PASS", "FAIL", "EXCEPTION", "SKIP"]);
const ISSUE_MARKER_START = "<!-- openspec-readiness:pre-propose";
const ISSUE_MARKER_END = "openspec-readiness:pre-propose -->";
const EXCEPTION_FIELDS = new Set(["project-membership", "manual-evidence"]);
const REQUIRED_ISSUE_LABELS = ["## Contexto", "## Historia Original", "## Enriquecida", "**No objetivos.**", "**Rollback.**"];
const BROWNFIELD_BASELINE_FILE = "brownfield-baseline.md";
const REQUIRED_BROWNFIELD_SECTIONS = [
  "Superficies tocadas",
  "Fuentes de verdad actuales",
  "Comportamiento vigente",
  "Comportamiento objetivo",
  "Compatibilidad legacy",
  "Owner de spec y contexto",
  "Evidencia actual",
  "Fuera de alcance",
];

export const VALIDATION_PROFILES = {
  docs: { validations: ["openspec-strict", "harness-parity"], evidence: ["docs-verification"] },
  harness: { validations: ["harness-parity", "opsx-patch"], evidence: ["fixtures"] },
  ui: { validations: [], evidence: ["web-http-200", "playwright-breakpoints", "nielsen"] },
  sync: { validations: ["sync-tests"], evidence: ["offline-reconnect", "cross-device", "no-local-loss"] },
  ia: { validations: [], evidence: ["provider-unconfigured", "temporary-error", "usage-limit", "reviewable-result"] },
  backend: { validations: ["backend-check"], evidence: ["jwt-userid", "indexes-rate-limit", "no-secrets"] },
};

const LOCAL_VALIDATIONS = {
  "openspec-strict": ["npm", ["exec", "--yes=false", "--", "openspec", "validate", "--all", "--strict", "--no-interactive"]],
  "harness-parity": ["npm", ["run", "agent:harness:check"]],
  "opsx-patch": ["npm", ["run", "agent:opsx:patch:check"]],
  "sync-tests": ["npm", ["run", "test:sync", "--", "--runInBand"]],
  "backend-check": ["npm", ["run", "backend:check"]],
};

function sanitize(value = "") {
  return String(value)
    .replace(/(Bearer|token|secret|password|passwd|pwd|key)=?[A-Za-z0-9._~+/=-]+/gi, "$1=[redacted]")
    .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb$1://[redacted]@");
}

function result(id, status, summary, remediation = null) {
  if (!STATUS.has(status)) throw new Error(`Unsupported readiness status: ${status}`);
  return { id, status, summary, remediation };
}

function parseJson(raw, label) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${label} no contiene JSON válido.`);
  }
}

function issueManifest(body) {
  const start = body.indexOf(ISSUE_MARKER_START);
  const end = body.indexOf(ISSUE_MARKER_END);
  if (start < 0 || end < 0 || end <= start) throw new Error("Falta el bloque openspec-readiness:pre-propose en el issue.");
  const raw = body.slice(start + ISSUE_MARKER_START.length, end).trim();
  return parseJson(raw, "El bloque de readiness del issue");
}

function validateException(exception, now) {
  const required = ["field", "reason", "owner", "approvedBy", "expiresOn", "recovery"];
  const missing = required.filter((field) => !exception?.[field]);
  if (missing.length) return `La excepción omite: ${missing.join(", ")}.`;
  if (!EXCEPTION_FIELDS.has(exception.field)) return `El campo ${exception.field} no admite excepción.`;
  const expiry = new Date(`${exception.expiresOn}T23:59:59.999Z`);
  if (Number.isNaN(expiry.getTime())) return "La fecha de expiración no usa ISO YYYY-MM-DD.";
  if (expiry.getTime() < now.getTime()) return `La excepción venció el ${exception.expiresOn}.`;
  return null;
}

function exceptionFor(exceptions, field, now) {
  for (const exception of exceptions ?? []) {
    if (exception.field !== field) continue;
    const failure = validateException(exception, now);
    if (failure) return { invalid: failure };
    return { exception };
  }
  return null;
}

// El resumen se declara por estado. Antes se reutilizaba el texto de fallo tambien en PASS, asi que el
// gate imprimia lineas como "PASS tldr: Falta TLDR.md en la raíz del change": afirmaban lo contrario de
// lo que acababan de verificar. Un informe que se contradice a si mismo no sirve como evidencia, que es
// justo para lo que existe este gate.
export function summaryFor(summary, status) {
  if (summary && typeof summary === "object") return status === "PASS" ? summary.pass : summary.fail;
  // Forma legacy de un solo texto: solo es correcta describiendo el fallo, asi que en PASS se marca en
  // vez de mentir. Convertir la llamada a { pass, fail } es la correccion.
  return status === "PASS" ? `Verificado. (Resumen sin variante PASS declarada: "${summary}")` : summary;
}

function addRequired(results, id, ok, summary, remediation, { exceptions = [], exceptionField = null, now = new Date() } = {}) {
  if (ok) return results.push(result(id, "PASS", summaryFor(summary, "PASS")));
  const failure = summaryFor(summary, "FAIL");
  const match = exceptionField ? exceptionFor(exceptions, exceptionField, now) : null;
  if (match?.exception) return results.push(result(id, "EXCEPTION", `${failure} Excepción vigente hasta ${match.exception.expiresOn}.`, match.exception.recovery));
  if (match?.invalid) return results.push(result(id, "FAIL", `${failure} ${match.invalid}`, remediation));
  return results.push(result(id, "FAIL", failure, remediation));
}

function validateManifestShape(manifest, fields) {
  const missing = fields.filter((field) => manifest?.[field] === undefined || manifest?.[field] === null || manifest?.[field] === "");
  return missing;
}

export function validateIssue(issue, { now = new Date() } = {}) {
  const results = [];
  addRequired(results, "issue-open", issue?.state === "OPEN", { pass: "El issue permanece abierto.", fail: "El issue debe permanecer abierto antes de propose." }, "Reabre o selecciona un issue abierto.", { now });
  const body = issue?.body ?? "";
  for (const label of REQUIRED_ISSUE_LABELS) {
    const present = body.includes(label);
    addRequired(results, `issue-${label.replace(/[^a-z]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`, present, { pass: `${label} está presente en el issue enriquecido.`, fail: `Falta ${label} en el issue enriquecido.` }, "Conserva la historia original y agrega la sección enriquecida requerida.", { now });
  }

  let manifest;
  try {
    manifest = issueManifest(body);
    const missing = validateManifestShape(manifest, ["schemaVersion", "change", "execution", "dependencies", "currentState", "surfaces", "manualIntervention", "exceptions"]);
    addRequired(results, "issue-manifest", missing.length === 0 && manifest.schemaVersion === 1 && manifest.execution === "versioned" && Array.isArray(manifest.surfaces) && Array.isArray(manifest.exceptions), { pass: "El manifest de readiness del issue cumple schemaVersion 1 y execution versioned.", fail: missing.length ? `El manifest del issue omite: ${missing.join(", ")}.` : "El manifest de readiness del issue no cumple schemaVersion 1/execution versioned." }, "Corrige el bloque JSON openspec-readiness:pre-propose del issue.", { now });
    addRequired(results, "project-membership", issue?.projectItems?.some((item) => item.title === "PlanearIA Product OS"), { pass: "El issue pertenece a PlanearIA Product OS.", fail: "El issue debe pertenecer a PlanearIA Product OS." }, "Agrega el issue al Project o registra una excepción temporal aprobada.", { exceptions: manifest.exceptions, exceptionField: "project-membership", now });
    const dependencies = issue.dependencyStates ?? [];
    addRequired(results, "dependencies", dependencies.length === manifest.dependencies.length && dependencies.every((dependency) => dependency.state === "CLOSED"), { pass: "Todas las dependencias declaradas están cerradas.", fail: "Hay dependencias sin cerrar o no verificables." }, "Cierra las dependencias declaradas o registra una excepción temporal aprobada.", { exceptions: manifest.exceptions, exceptionField: "manual-evidence", now });
    for (const exception of manifest.exceptions ?? []) {
      const failure = validateException(exception, now);
      addRequired(results, `issue-exception-${exception.field ?? "unknown"}`, !failure, { pass: `Excepción válida para ${exception.field}.`, fail: failure ?? `Excepción inválida para ${exception.field}.` }, "Corrige o elimina la excepción inválida.", { now });
    }
  } catch (error) {
    addRequired(results, "issue-manifest", false, error.message, "Agrega un bloque JSON openspec-readiness:pre-propose válido al issue.", { now });
  }
  return { results, manifest };
}

export function resolveExecution(command, args, { platform = process.platform, comspec = process.env.ComSpec ?? "cmd.exe" } = {}) {
  if (platform !== "win32" || command !== "npm") return { command, args };

  // npm es un .cmd en Windows. Node ya no permite ejecutarlo sin shell y `shell: true` concatena
  // argumentos de forma insegura (DEP0190). El gate solo ejecuta la allowlist LOCAL_VALIDATIONS:
  // rechazamos cualquier argumento con metacaracteres y llamamos cmd.exe de forma explícita.
  const safe = ["npm", ...args].map((value) => {
    const text = String(value);
    if (!/^[A-Za-z0-9@_./:=,+-]+$/.test(text)) {
      throw new Error(`Argumento no seguro en validación local: ${text}`);
    }
    return text;
  });
  return { command: comspec, args: ["/d", "/s", "/c", safe.join(" ")] };
}

function run(command, args, { cwd = ROOT } = {}) {
  const resolved = resolveExecution(command, args);
  const execution = spawnSync(resolved.command, resolved.args, { cwd, encoding: "utf8" });
  return { status: execution.status ?? 1, stdout: execution.stdout ?? "", stderr: execution.stderr ?? "", error: execution.error?.message ?? "" };
}

function safeChangeRoot(root, change) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(change ?? "")) throw new Error("El change debe usar kebab-case y no puede contener rutas.");
  const changesDir = path.join(root, "openspec", "changes");
  const candidate = path.join(changesDir, change);
  if (!existsSync(candidate)) throw new Error(`No existe el change ${change}.`);
  const resolvedChanges = realpathSync(changesDir);
  const resolvedCandidate = realpathSync(candidate);
  if (!resolvedCandidate.startsWith(`${resolvedChanges}${path.sep}`)) throw new Error("El change resuelve fuera de openspec/changes.");
  return resolvedCandidate;
}

function loadReadiness(changeRoot) {
  const file = path.join(changeRoot, "readiness.json");
  if (!existsSync(file)) throw new Error("Falta readiness.json en la raíz del change.");
  return parseJson(readFileSync(file, "utf8"), "readiness.json");
}

function brownfieldBaselineFailure(changeRoot) {
  const file = path.join(changeRoot, BROWNFIELD_BASELINE_FILE);
  if (!existsSync(file)) return `Falta ${BROWNFIELD_BASELINE_FILE} en la raíz del change.`;

  try {
    if (!lstatSync(file).isFile()) return `${BROWNFIELD_BASELINE_FILE} debe ser un archivo regular en la raíz del change.`;
  } catch {
    return `No se pudo inspeccionar ${BROWNFIELD_BASELINE_FILE} de forma segura.`;
  }

  const sections = new Map();
  let activeSection = null;
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return `No se pudo leer ${BROWNFIELD_BASELINE_FILE} de forma segura.`;
  }
  for (const line of raw.split(/\r?\n/)) {
    const header = line.match(/^## (.+)$/);
    if (header) {
      activeSection = header[1].trim();
      sections.set(activeSection, []);
    } else if (activeSection) {
      sections.get(activeSection).push(line);
    }
  }

  const missing = REQUIRED_BROWNFIELD_SECTIONS.filter((section) => !sections.get(section)?.join("\n").trim());
  return missing.length ? `${BROWNFIELD_BASELINE_FILE} omite o deja vacías: ${missing.join(", ")}.` : null;
}

function requiredForSurfaces(surfaces) {
  const validations = new Set(["openspec-strict"]);
  const evidence = new Set(["issue-link", "pr-link", "adversarial-review"]);
  for (const surface of surfaces ?? []) {
    const profile = VALIDATION_PROFILES[surface];
    if (!profile) continue;
    for (const id of profile.validations) validations.add(id);
    for (const id of profile.evidence) evidence.add(id);
  }
  return { validations, evidence };
}

// Adapta los checks del motor de deuda (PASS/FAIL/WARN/SKIP) al vocabulario del gate. Los gates de
// deuda no emiten WARN; cualquier estado no reconocido degrada a FAIL para no fabricar verdes.
export function mapDebtCheck(entry) {
  const status = entry.status === "PASS" || entry.status === "SKIP" ? entry.status : "FAIL";
  return result(entry.id, status, entry.summary, entry.recovery ?? null);
}

export function debtProposeCheck({ root = ROOT, labels = [], now = new Date() } = {}) {
  try {
    return mapDebtCheck(preProposeGate({ root, labels, now }));
  } catch (error) {
    return result("debt-pre-propose", "FAIL", `El gate de deuda no pudo evaluarse: ${sanitize(error.message)}`, "Revisa .project-os/debt/ y corrige la configuracion o el registro.");
  }
}

export function debtArchiveChecks({ root = ROOT, change, now = new Date() } = {}) {
  try {
    return preArchiveGate({ root, change, now }).map(mapDebtCheck);
  } catch (error) {
    return [result("debt-gate", "FAIL", `El gate de deuda no pudo evaluarse: ${sanitize(error.message)}`, "Revisa .project-os/debt/ y corrige la configuracion o el registro.")];
  }
}

export function validateArchive({ root = ROOT, change, now = new Date(), runCommand = run, runLocal = false } = {}) {
  const results = [];
  let changeRoot;
  try {
    changeRoot = safeChangeRoot(root, change);
    results.push(result("change-root", "PASS", `Change confinado a ${path.relative(root, changeRoot)}.`));
  } catch (error) {
    return { results: [result("change-root", "FAIL", error.message, "Usa un nombre de change activo en openspec/changes.")], manifest: null };
  }
  const tasksPath = path.join(changeRoot, "tasks.md");
  const proposalPath = path.join(changeRoot, "proposal.md");
  const tldrPath = path.join(changeRoot, "TLDR.md");
  const tasks = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "";
  addRequired(results, "tasks-complete", existsSync(tasksPath) && !/- \[ \]/.test(tasks), { pass: "Todas las tareas de tasks.md están completas.", fail: "Hay tareas pendientes o falta tasks.md." }, "Completa las tareas pendientes antes de archive.", { now });
  addRequired(results, "tldr", existsSync(tldrPath), { pass: "TLDR.md está en la raíz del change.", fail: "Falta TLDR.md en la raíz del change." }, "Crea o mueve TLDR.md a la raíz del change.", { now });
  const baselineFailure = brownfieldBaselineFailure(changeRoot);
  addRequired(
    results,
    "brownfield-baseline",
    !baselineFailure,
    {
      pass: `${BROWNFIELD_BASELINE_FILE} registra la superficie tocada y el delta brownfield requerido.`,
      fail: baselineFailure ?? `${BROWNFIELD_BASELINE_FILE} no cumple el contrato de baseline brownfield.`,
    },
    `Crea ${BROWNFIELD_BASELINE_FILE} en la raíz con las ocho secciones requeridas y contenido verificable.`,
    { now },
  );

  let manifest;
  try {
    manifest = loadReadiness(changeRoot);
    const missing = validateManifestShape(manifest, ["schemaVersion", "issue", "change", "surfaces", "validations", "evidence", "rollback", "adversarialReview", "exceptions"]);
    addRequired(results, "archive-manifest", missing.length === 0 && manifest.schemaVersion === 1 && manifest.change === change && Array.isArray(manifest.surfaces) && Array.isArray(manifest.validations) && Array.isArray(manifest.evidence) && Array.isArray(manifest.exceptions), { pass: "readiness.json cumple el contrato del change.", fail: missing.length ? `readiness.json omite: ${missing.join(", ")}.` : "readiness.json no coincide con el contrato del change." }, "Corrige readiness.json con schemaVersion 1 y los campos requeridos.", { now });
  } catch (error) {
    addRequired(results, "archive-manifest", false, error.message, "Crea un readiness.json válido en la raíz del change.", { now });
    return { results, manifest: null };
  }

  addRequired(results, "proposal-traceability", existsSync(proposalPath) && readFileSync(proposalPath, "utf8").includes(`#${manifest.issue}`), { pass: `proposal.md enlaza al issue #${manifest.issue} declarado por readiness.json.`, fail: "proposal.md no enlaza al issue declarado por readiness.json." }, "Agrega la referencia del issue a proposal.md o corrige readiness.json.", { now });
  const unknownSurfaces = manifest.surfaces.filter((surface) => !VALIDATION_PROFILES[surface]);
  addRequired(results, "surface-profile", unknownSurfaces.length === 0, { pass: `Superficies declaradas reconocidas: ${manifest.surfaces.join(", ")}.`, fail: `Hay superficies no reconocidas: ${unknownSurfaces.join(", ")}.` }, "Usa únicamente docs, harness, ui, sync, ia o backend.", { now });
  const required = requiredForSurfaces(manifest.surfaces);
  const unknownValidations = manifest.validations.filter((id) => typeof id !== "string" || !Object.hasOwn(LOCAL_VALIDATIONS, id));
  const injectedCommands = ["command", "commands", "executable", "path"].filter((field) => Object.hasOwn(manifest, field));
  addRequired(results, "validation-ids", injectedCommands.length === 0 && unknownValidations.length === 0 && [...required.validations].every((id) => manifest.validations.includes(id)), { pass: "Los IDs de validación declarados cubren las superficies del change.", fail: injectedCommands.length ? `readiness.json declara campos no permitidos: ${injectedCommands.join(", ")}.` : unknownValidations.length ? `readiness.json incluye IDs desconocidos: ${unknownValidations.join(", ")}.` : "Faltan IDs de validación requeridos por las superficies declaradas." }, "Usa los IDs del perfil estático; no declares comandos o IDs propios.", { now });
  const evidenceIds = new Set(manifest.evidence.filter((item) => item?.id && item?.ref).map((item) => item.id));
  const missingEvidence = [...required.evidence].filter((id) => !evidenceIds.has(id));
  addRequired(results, "evidence", missingEvidence.length === 0, { pass: "La evidencia requerida por las superficies está registrada.", fail: `Falta evidencia: ${missingEvidence.join(", ")}.` }, "Registra enlaces o referencias de evidencia en readiness.json, o una excepción temporal válida.", { exceptions: manifest.exceptions, exceptionField: "manual-evidence", now });
  addRequired(results, "rollback", typeof manifest.rollback?.strategy === "string" && manifest.rollback.strategy.trim().length > 0, { pass: "readiness.json declara una estrategia de rollback.", fail: "Falta una estrategia de rollback en readiness.json." }, "Declara cómo revertir el change sin borrar changes ni evidencia.", { now });
  addRequired(results, "adversarial-review", typeof manifest.adversarialReview?.ref === "string" && manifest.adversarialReview.ref.trim().length > 0, { pass: "readiness.json registra la referencia de revisión adversarial.", fail: "Falta la referencia de revisión adversarial." }, "Ejecuta la revisión adversarial y registra su evidencia.", { exceptions: manifest.exceptions, exceptionField: "manual-evidence", now });
  for (const exception of manifest.exceptions) {
    const failure = validateException(exception, now);
    addRequired(results, `archive-exception-${exception.field ?? "unknown"}`, !failure, { pass: `Excepción válida para ${exception.field}.`, fail: failure ?? `Excepción inválida para ${exception.field}.` }, "Corrige o elimina la excepción inválida.", { now });
  }

  if (runLocal) {
    for (const id of required.validations) {
      const [command, args] = LOCAL_VALIDATIONS[id];
      const execution = runCommand(command, args, { cwd: root });
      const detail = sanitize(`${execution.stdout}${execution.stderr}${execution.error}`).trim().slice(-240);
      addRequired(results, `local-${id}`, execution.status === 0, { pass: `${id} terminó correctamente.`, fail: `${id} falló${detail ? `: ${detail}` : "."}` }, `Ejecuta y corrige ${command} ${args.join(" ")}.`, { now });
    }
  }

  for (const debtResult of debtArchiveChecks({ root, change, now })) {
    results.push(debtResult);
  }
  return { results, manifest };
}

function fetchIssue(issueNumber, runCommand = run) {
  const execution = runCommand("gh", ["issue", "view", String(issueNumber), "--json", "number,state,body,projectItems,labels"]);
  if (execution.status !== 0) throw new Error(`No se pudo consultar el issue: ${sanitize(`${execution.stderr}${execution.error}`).slice(-240)}`);
  const issue = parseJson(execution.stdout, "gh issue view");
  const manifest = issueManifest(issue.body ?? "");
  issue.dependencyStates = manifest.dependencies.map((number) => {
    const dependency = runCommand("gh", ["issue", "view", String(number), "--json", "state"]);
    if (dependency.status !== 0) return { number, state: "UNKNOWN" };
    try { return { number, state: parseJson(dependency.stdout, "gh dependency").state }; } catch { return { number, state: "UNKNOWN" }; }
  });
  return issue;
}

export function report(value) {
  const results = Array.isArray(value) ? value : value.results;
  const counts = Object.fromEntries([...STATUS].map((status) => [status, results.filter((item) => item.status === status).length]));
  return { ok: counts.FAIL === 0, counts, results };
}

export function formatReport(value) {
  const lines = [`OpenSpec readiness: ${value.ok ? "PASS" : "FAIL"}`];
  for (const item of value.results) {
    lines.push(`${item.status.padEnd(9)} ${item.id}: ${item.summary}`);
    if (item.remediation) lines.push(`          Recuperación: ${item.remediation}`);
  }
  return lines.join("\n");
}

function parseArgs(argv) {
  const valueAfter = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : null;
  };
  return { phase: valueAfter("--phase"), issue: valueAfter("--issue"), change: valueAfter("--change"), json: argv.includes("--json"), runLocal: argv.includes("--run-local") };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  let output;
  try {
    if (args.phase === "propose" && /^\d+$/.test(args.issue ?? "")) {
      const issue = fetchIssue(args.issue);
      const validation = validateIssue(issue);
      validation.results.push(debtProposeCheck({ labels: issue.labels ?? [] }));
      output = report(validation);
    }
    else if (args.phase === "archive" && args.change) output = report(validateArchive({ change: args.change, runLocal: args.runLocal }));
    else throw new Error("Uso: node scripts/checkOpenSpecReadiness.mjs --phase propose --issue <n> | --phase archive --change <kebab-case> [--run-local] [--json]");
    process.stdout.write(`${args.json ? JSON.stringify(output, null, 2) : formatReport(output)}\n`);
    process.exitCode = output.ok ? 0 : 1;
  } catch (error) {
    process.stderr.write(`OpenSpec readiness: FAIL - ${sanitize(error.message)}\n`);
    process.exitCode = 2;
  }
}
