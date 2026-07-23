import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import {
  createReport,
  formatHuman,
  formatJson,
  reportExitCode,
  result,
} from "./report.mjs";
import { CONSTRUCTOR_VERSION, PACKAGE_NAME } from "./constants.mjs";
import { checkState as checkDebtState } from "./debt/gates.mjs";

const SUPPORTED_NODE_RANGE = "^20.20.0 || >=22.22.0";
const OPEN_SPEC_VERSION = "1.6.0";
const EVIDENCE_SCHEMA_VERSION = "1.0.0";
const TECHNICAL_PROFILES = [
  "ui",
  "backend-api",
  "auth-security",
  "data-migration-sync",
  "ai",
  "infra-deploy",
  "library-cli",
];

const SAFE_COMMANDS = Object.freeze({
  nodeVersion: { command: process.execPath, args: ["--version"], timeoutMs: 5_000 },
  npmVersion: {
    command:
      process.platform === "win32"
        ? process.env.ComSpec ?? "C:\\Windows\\System32\\cmd.exe"
        : "npm",
    args:
      process.platform === "win32"
        ? ["/d", "/s", "/c", "npm --version"]
        : ["--version"],
    timeoutMs: 5_000,
  },
  gitVersion: { command: "git", args: ["--version"], timeoutMs: 5_000 },
  gitRoot: {
    command: "git",
    args: ["rev-parse", "--is-inside-work-tree"],
    timeoutMs: 5_000,
  },
  gitStatus: {
    command: "git",
    args: ["status", "--porcelain=v1", "--untracked-files=normal"],
    timeoutMs: 8_000,
  },
  ghVersion: { command: "gh", args: ["--version"], timeoutMs: 5_000 },
});

function isSupportedNode(actual) {
  const parts = String(actual)
    .replace(/^v/, "")
    .split(".")
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10));
  if (parts.some(Number.isNaN) || parts.length < 2) {
    return false;
  }
  const [major, minor] = parts;
  if (major === 20) return minor >= 20;
  if (major === 21) return false;
  if (major === 22) return minor >= 22;
  return major > 22;
}

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizedRelative(target, absolutePath) {
  return path.relative(target, absolutePath).split(path.sep).join("/");
}

function spawnReadOnly(spec, { cwd, env = process.env } = {}) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timer;
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(payload);
    };
    let child;
    try {
      child = spawn(spec.command, spec.args, {
        cwd,
        env,
        shell: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
        signal: controller.signal,
      });
    } catch (error) {
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr,
        error: error.code ?? error.name,
        timedOut: false,
      });
      return;
    }
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr,
        error: error.code ?? error.name,
        timedOut: error.name === "AbortError",
      });
    });
    child.on("close", (exitCode) => {
      finish({ ok: exitCode === 0, exitCode, stdout, stderr, timedOut: false });
    });
    timer = setTimeout(() => {
      controller.abort();
    }, spec.timeoutMs);
  });
}

async function command(runner, id, cwd) {
  const spec = SAFE_COMMANDS[id];
  if (!spec) {
    throw new Error(`Probe fuera de allowlist: ${id}`);
  }
  return runner(spec, { cwd, id });
}

function installedStateEntries(state) {
  if (Array.isArray(state?.files)) return state.files;
  if (Array.isArray(state?.entries)) return state.entries;
  if (state?.files && typeof state.files === "object") {
    return Object.entries(state.files).map(([target, metadata]) => ({ target, ...metadata }));
  }
  return [];
}

async function checkInstalledHashes(target, state) {
  const mismatches = [];
  const checked = [];
  for (const entry of installedStateEntries(state)) {
    const relative = entry.target ?? entry.path;
    const expected = entry.hash ?? entry.sha256 ?? entry.renderedHash;
    if (!relative || !expected || entry.owner !== "constructor") {
      continue;
    }
    const absolute = path.resolve(target, relative);
    try {
      const content = await readFile(absolute);
      checked.push(relative.split("\\").join("/"));
      if (sha256(content) !== expected) {
        mismatches.push(relative.split("\\").join("/"));
      }
    } catch {
      mismatches.push(relative.split("\\").join("/"));
    }
  }
  return { checked: checked.sort(), mismatches: mismatches.sort() };
}

async function checkHarnessPlan(target) {
  const { runBootstrapOrSync } = await import("./commands.mjs");
  return runBootstrapOrSync({
    targetRoot: target,
    command: "sync",
    check: true,
  });
}

function mcpServers(config) {
  if (Array.isArray(config?.servers)) return config.servers;
  if (config?.servers && typeof config.servers === "object") {
    return Object.entries(config.servers).map(([id, server]) => ({ id, ...server }));
  }
  return [];
}

function containsLiteralSecret(value, key = "") {
  if (Array.isArray(value)) return value.some((entry) => containsLiteralSecret(entry, key));
  if (value && typeof value === "object") {
    return Object.entries(value).some(([childKey, child]) => containsLiteralSecret(child, childKey));
  }
  if (typeof value !== "string") return false;
  if (/\b(?:Bearer\s+[A-Za-z0-9._~+/=-]+|gh[pousr]_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9_-]{12,})\b/i.test(value)) {
    return true;
  }
  const assignment = value.match(
    /\b(?:api[_-]?key|password|secret|token|credential)\s*[=:]\s*([^\s,;]+)/i,
  );
  if (
    assignment
    && !/^(\$\{?[A-Z][A-Z0-9_]*\}?|env:[A-Z][A-Z0-9_]*)$/.test(assignment[1])
  ) {
    return true;
  }
  if (!/(?:token|password|secret|api.?key)/i.test(key)) return false;
  if (/envRefs?$/i.test(key) && /^[A-Z][A-Z0-9_]*$/.test(value)) return false;
  if (key === "secrets" && value === "environment-references-only") return false;
  return !/^(\$\{?[A-Z][A-Z0-9_]*\}?|env:[A-Z][A-Z0-9_]*)$/.test(value);
}

async function readFirstJson(target, candidates) {
  for (const relative of candidates) {
    const value = await readJson(path.join(target, relative));
    if (value) return { value, relative };
  }
  return { value: null, relative: candidates[0] };
}

function activeProfiles(config, profileCatalog) {
  const active =
    config?.activeProfiles ??
    profileCatalog?.active ??
    profileCatalog?.profiles?.filter((profile) => profile.active).map((profile) => profile.id) ??
    [];
  return new Set(active);
}

async function evidenceReceipt(target, name, expectedConfigHash) {
  const relative = `.project-constructor/evidence/${name}.json`;
  const receipt = await readJson(path.join(target, relative));
  if (!receipt) {
    return { state: "missing", relative };
  }
  if (receipt.schemaVersion !== EVIDENCE_SCHEMA_VERSION) {
    return {
      state: "invalid",
      relative,
      cause: `schemaVersion debe ser ${EVIDENCE_SCHEMA_VERSION}.`,
    };
  }
  if (receipt.configHash !== expectedConfigHash) {
    return { state: "invalid", relative, cause: "El hash de configuración no coincide." };
  }
  if (receipt.expiresAt) {
    const expiresAt = Date.parse(receipt.expiresAt);
    if (!Number.isFinite(expiresAt)) {
      return { state: "invalid", relative, cause: "expiresAt no contiene una fecha válida." };
    }
    if (expiresAt <= Date.now()) {
      return { state: "invalid", relative, cause: "La evidencia está vencida." };
    }
  }
  if (receipt.status !== "PASS") {
    return { state: "invalid", relative, cause: "La evidencia no contiene un PASS explícito." };
  }
  return { state: "valid", relative };
}

function receiptResult({
  id,
  profile,
  label,
  receipt,
  missingStatus = "SKIP",
}) {
  if (receipt.state === "valid") {
    return result({
      id,
      profile,
      status: "PASS",
      summary: `${label} demostrado por evidencia vigente`,
      cause: "El recibo coincide con la configuración actual y declara PASS.",
      remediation: "Renueva el smoke opt-in cuando cambie la configuración o venza la evidencia.",
      evidence: { receipt: receipt.relative },
    });
  }
  if (receipt.state === "invalid") {
    return result({
      id,
      profile,
      status: "FAIL",
      summary: `${label} tiene evidencia inválida`,
      cause: receipt.cause,
      remediation: "Ejecuta manualmente el smoke read-only separado y aporta un recibo vigente y redactado.",
      evidence: { receipt: receipt.relative },
    });
  }
  return result({
    id,
    profile,
    status: missingStatus,
    summary: `${label} no ejecutado por el doctor`,
    cause: "No existe evidencia opt-in vigente; la configuración por sí sola no prueba operación.",
    remediation: "Usa el runbook para ejecutar el smoke read-only separado y guardar su recibo redactado.",
    evidence: { expectedReceipt: receipt.relative },
  });
}

async function inspectTransactionJournals(target) {
  const relativeRoot = ".project-constructor/transactions";
  const absoluteRoot = path.join(target, relativeRoot);
  let entries;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { corrupt: [], incomplete: [], journalCount: 0 };
    }
    return {
      corrupt: [`${relativeRoot}: unreadable`],
      incomplete: [],
      journalCount: 0,
    };
  }

  const corrupt = [];
  const incomplete = [];
  let journalCount = 0;
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isDirectory()) continue;
    const relative = `${relativeRoot}/${entry.name}/journal.json`;
    const journal = await readJson(path.join(target, relative));
    journalCount += 1;
    if (
      !journal
      || journal.id !== entry.name
      || typeof journal.status !== "string"
    ) {
      corrupt.push(relative);
      continue;
    }
    if (["applying", "failed", "rolling-back"].includes(journal.status)) {
      incomplete.push(journal.id);
      continue;
    }
    if (!["completed", "rolled-back"].includes(journal.status)) {
      corrupt.push(relative);
    }
  }
  return {
    corrupt: corrupt.sort(),
    incomplete: incomplete.sort(),
    journalCount,
  };
}

export async function collectDoctorReport({
  target,
  env = process.env,
  runner = spawnReadOnly,
  parityChecker = checkHarnessPlan,
} = {}) {
  if (!target) throw new TypeError("doctor requiere target");
  const root = path.resolve(target);
  const results = [];

  const nodeResponse = await command(runner, "nodeVersion", root);
  const nodeVersion = nodeResponse.stdout.trim();
  results.push(
    result({
      id: "runtime.node",
      status: nodeResponse.ok && isSupportedNode(nodeVersion) ? "PASS" : "FAIL",
      summary: "Runtime Node compatible con el núcleo",
      cause:
        nodeResponse.ok && isSupportedNode(nodeVersion)
          ? `Node ${nodeVersion} satisface ${SUPPORTED_NODE_RANGE}.`
          : `Node no está disponible o no satisface ${SUPPORTED_NODE_RANGE}.`,
      remediation: `Instala una versión mantenida de Node compatible con ${SUPPORTED_NODE_RANGE} y vuelve a ejecutar el doctor.`,
      evidence: { version: nodeVersion || "no disponible" },
    }),
  );

  const npmResponse = await command(runner, "npmVersion", root);
  results.push(
    result({
      id: "runtime.package-manager",
      status: npmResponse.ok ? "PASS" : "FAIL",
      summary: "Package manager npm disponible",
      cause: npmResponse.ok ? "npm respondió al probe de versión." : "npm no respondió al probe read-only.",
      remediation: "Restaura npm desde la misma distribución de Node; no uses el doctor para instalarlo.",
      evidence: { version: npmResponse.stdout.trim() || "no disponible" },
    }),
  );

  const packageJson = await readJson(path.join(root, "package.json"));
  const packageLock = await readJson(path.join(root, "package-lock.json"));
  const lockMatchesPackage =
    packageJson &&
    packageLock &&
    packageJson.name === packageLock.name &&
    Number.isInteger(packageLock.lockfileVersion);
  results.push(
    result({
      id: "dependencies.lockfile",
      status: lockMatchesPackage ? "PASS" : "FAIL",
      summary: "Lockfile reproducible presente",
      cause: lockMatchesPackage
        ? `package-lock.json lockfileVersion ${packageLock.lockfileVersion} corresponde al paquete.`
        : "Falta package.json/package-lock.json coherente.",
      remediation: "Restaura el lockfile versionado y ejecuta npm ci fuera del doctor.",
      evidence: { lockfileVersion: packageLock?.lockfileVersion ?? "ausente" },
    }),
  );

  const gitRoot = await command(runner, "gitRoot", root);
  results.push(
    result({
      id: "git.repository",
      status: gitRoot.ok && gitRoot.stdout.trim() === "true" ? "PASS" : "FAIL",
      summary: "Destino bajo control de Git",
      cause:
        gitRoot.ok && gitRoot.stdout.trim() === "true"
          ? "git rev-parse confirmó el repositorio."
          : "El destino no es un repositorio Git válido.",
      remediation: "Inicializa o restaura Git manualmente antes del bootstrap.",
      evidence: { isWorkTree: gitRoot.stdout.trim() === "true" },
    }),
  );
  const gitStatus = await command(runner, "gitStatus", root);
  const changedPaths = gitStatus.ok
    ? gitStatus.stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => line.slice(3).split("\\").join("/"))
        .sort()
    : [];
  results.push(
    result({
      id: "git.working-tree",
      status: !gitStatus.ok ? "FAIL" : changedPaths.length === 0 ? "PASS" : "WARN",
      summary: changedPaths.length === 0 ? "Working tree clasificado y limpio" : "Working tree contiene cambios",
      cause: !gitStatus.ok
        ? "Git no pudo clasificar el working tree."
        : changedPaths.length === 0
          ? "No hay cambios reportados por Git."
          : "Los cambios deben clasificarse antes de iniciar un change que se superponga.",
      remediation: "Conserva, aísla o registra los cambios manualmente; el doctor no limpia ni revierte archivos.",
      evidence: { paths: changedPaths },
    }),
  );

  const expectedOpenSpec =
    packageJson?.devDependencies?.["@fission-ai/openspec"] ??
    packageJson?.dependencies?.["@fission-ai/openspec"];
  const lockedOpenSpec =
    packageLock?.packages?.["node_modules/@fission-ai/openspec"]?.version ??
    packageLock?.dependencies?.["@fission-ai/openspec"]?.version;
  const installedOpenSpec = await readJson(
    path.join(root, "node_modules", "@fission-ai", "openspec", "package.json"),
  );
  const openSpecHealthy =
    expectedOpenSpec === OPEN_SPEC_VERSION &&
    lockedOpenSpec === OPEN_SPEC_VERSION &&
    installedOpenSpec?.version === OPEN_SPEC_VERSION;
  results.push(
    result({
      id: "sdd.openspec-local",
      status: openSpecHealthy ? "PASS" : "FAIL",
      summary: "OpenSpec local fijado y resuelto",
      cause: openSpecHealthy
        ? `Manifiesto, lockfile e instalación resuelven OpenSpec ${OPEN_SPEC_VERSION}.`
        : "OpenSpec local exacto no está demostrado en manifiesto, lockfile e instalación.",
      remediation: `Restaura @fission-ai/openspec ${OPEN_SPEC_VERSION} y package-lock.json; ejecuta npm ci, nunca un fallback global o @latest.`,
      evidence: {
        manifest: expectedOpenSpec ?? "ausente",
        lockfile: lockedOpenSpec ?? "ausente",
        installed: installedOpenSpec?.version ?? "ausente",
      },
    }),
  );

  const state = await readJson(path.join(root, ".project-constructor", "state.json"));
  const declaredPackage =
    packageJson?.devDependencies?.[PACKAGE_NAME]
    ?? packageJson?.dependencies?.[PACKAGE_NAME];
  const lockedPackage = packageLock?.packages?.[`node_modules/${PACKAGE_NAME}`];
  const installedPackage = await readJson(
    path.join(root, "node_modules", PACKAGE_NAME, "package.json"),
  );
  const duplicateSources = [];
  for (const relative of [
    ".project-constructor/runtime",
    "tools/project-constructor",
    "tools/debt-control",
  ]) {
    if (await exists(path.join(root, relative))) duplicateSources.push(relative);
  }
  const releaseHealthy =
    state?.packageName === PACKAGE_NAME
    && state?.packageVersion === CONSTRUCTOR_VERSION
    && declaredPackage === CONSTRUCTOR_VERSION
    && lockedPackage?.version === CONSTRUCTOR_VERSION
    && installedPackage?.name === PACKAGE_NAME
    && installedPackage?.version === CONSTRUCTOR_VERSION
    && duplicateSources.length === 0;
  results.push(
    result({
      id: "release.identity",
      profile: "harness-tooling",
      status: releaseHealthy ? "PASS" : "FAIL",
      summary: releaseHealthy
        ? "Release exacta instalada sin source duplicado"
        : "La identidad del paquete no coincide o existe un runtime duplicado",
      cause: releaseHealthy
        ? `${PACKAGE_NAME}@${CONSTRUCTOR_VERSION} coincide en state, manifest, lockfile e instalación.`
        : "State, manifest, lockfile e instalación deben fijar la misma release; una copia editable no es fallback.",
      remediation:
        `Fija ${PACKAGE_NAME}@${CONSTRUCTOR_VERSION}, ejecuta npm install fuera del doctor y retira copias solo mediante un upgrade/PR reversible.`,
      evidence: {
        declared: declaredPackage ?? "ausente",
        installed: installedPackage?.version ?? "ausente",
        locked: lockedPackage?.version ?? "ausente",
        stateName: state?.packageName ?? "ausente",
        stateVersion: state?.packageVersion ?? "ausente",
        duplicateSources,
      },
    }),
  );

  let debtState;
  try {
    debtState = checkDebtState({ root });
  } catch (error) {
    debtState = { internalError: error instanceof Error ? error.message : String(error) };
  }
  const debtFailures = debtState?.checks?.filter(
    (entry) => entry.status === "FAIL" && !entry.id.startsWith("plan-"),
  ) ?? [];
  const pausedPlans = debtState?.evaluation?.pausedPlans ?? [];
  const debtHealthy = !debtState?.internalError && debtFailures.length === 0;
  results.push(
    result({
      id: "debt.health",
      profile: "harness-tooling",
      status: !debtHealthy ? "FAIL" : pausedPlans.length > 0 ? "WARN" : "PASS",
      summary: !debtHealthy
        ? "El estado local de deuda es inválido o incompleto"
        : pausedPlans.length > 0
          ? "El registro es válido y contiene planes pausados"
          : "El registro de deuda es válido",
      cause: debtState?.internalError
        ?? (debtFailures.length > 0
          ? debtFailures.map((entry) => entry.summary).join("; ")
          : pausedPlans.length > 0
            ? `Pausas gobernadas: ${pausedPlans.join(", ")}.`
            : "Policy, registry y assessments son coherentes; el check fue read-only."),
      remediation: !debtHealthy
        ? "Ejecuta project-os debt check --json y corrige o restaura el estado; el doctor no captura ni repara."
        : pausedPlans.length > 0
          ? "Usa project-os debt handoff para ejecutar el saneamiento trazable."
          : "Ninguna.",
      evidence: {
        failedChecks: debtFailures.map((entry) => entry.id),
        pausedPlans,
      },
    }),
  );
  const debtGithubMode = debtState?.config?.github?.mode ?? "unconfigured";
  results.push(
    result({
      id: "debt.github",
      profile: "harness-tooling",
      status: debtGithubMode === "off" ? "SKIP" : debtHealthy ? "WARN" : "FAIL",
      summary: debtGithubMode === "off"
        ? "Sincronización GitHub de deuda desactivada"
        : "El doctor no ejecuta sincronización GitHub",
      cause: debtGithubMode === "off"
        ? "La política local declara github.mode=off."
        : `Modo configurado: ${debtGithubMode}; configuración no demuestra autenticación ni sync.`,
      remediation: debtGithubMode === "off"
        ? "Ninguna; cambia la política mediante una decisión del consumidor si necesita integración."
        : "Ejecuta project-os debt sync de forma explícita y aporta evidencia; el doctor no autentica ni crea issues.",
      evidence: { mode: debtGithubMode },
    }),
  );
  const stateHashes = state ? await checkInstalledHashes(root, state) : { checked: [], mismatches: ["state.json"] };
  let parity;
  let parityError = null;
  try {
    parity = await parityChecker(root);
  } catch (error) {
    parityError = error instanceof Error ? error.message : String(error);
  }
  const parityHealthy =
    parityError === null &&
    parity?.exitCode === 0 &&
    parity?.plan?.hasDrift === false &&
    stateHashes.checked.length > 0 &&
    stateHashes.mismatches.length === 0;
  results.push(
    result({
      id: "harness.parity",
      profile: "harness-tooling",
      status: parityHealthy ? "PASS" : "FAIL",
      summary: "Fuente canónica y espejos administrados están en paridad",
      cause: parityHealthy
        ? "El plan read-only produjo cero drift y los hashes constructor-owned coinciden."
        : parityError ?? "Falta estado comprobable, el plan detectó drift o un hash administrado no coincide.",
      remediation: "Ejecuta project-constructor sync --check para obtener el diff; resuelve fuentes o colisiones y después ejecuta sync explícitamente.",
      evidence: {
        checked: stateHashes.checked,
        mismatches: stateHashes.mismatches,
        planSummary: parity?.plan?.summary ?? "no disponible",
      },
    }),
  );

  const profileData = await readFirstJson(root, [
    ".project-os/profiles.json",
    ".project-os/profiles/catalog.json",
  ]);
  const config = await readJson(path.join(root, ".project-constructor", "config.json"));
  const active = activeProfiles(config, profileData.value);
  for (const profile of TECHNICAL_PROFILES) {
    results.push(
      result({
        id: `profile.${profile}`,
        profile,
        status: active.has(profile) ? "FAIL" : "SKIP",
        summary: active.has(profile)
          ? `Perfil ${profile} activo sin probe de Ola 0`
          : `Perfil ${profile} inactivo antes del discovery`,
        cause: active.has(profile)
          ? "La Ola 0 no implementa validaciones técnicas para este perfil."
          : "El perfil requiere una decisión posterior al discovery.",
        remediation: active.has(profile)
          ? "Desactiva el perfil o implementa su contrato completo mediante un change aprobado."
          : "No actives el perfil hasta aprobar discovery, ADR, validaciones, casos negativos y rollback.",
        evidence: { active: active.has(profile), catalog: profileData.relative },
      }),
    );
  }

  const mcpData = await readFirstJson(root, [".project-os/mcp.json", ".project-os/mcp/servers.json"]);
  const servers = mcpServers(mcpData.value);
  const activeMcp = servers.filter(
    (server) => server.enabled !== false && server.active !== false,
  );
  const graphifyConfigured = activeMcp.some((server) => /graphify/i.test(server.id ?? server.name ?? ""));
  const literalSecret = containsLiteralSecret(mcpData.value);
  const mcpConfigHash = mcpData.value ? sha256(`${stableJson(mcpData.value)}\n`) : "missing";
  results.push(
    result({
      id: "mcp.configuration",
      profile: "harness-tooling",
      status: !mcpData.value || graphifyConfigured || literalSecret ? "FAIL" : "PASS",
      summary: "Configuración MCP estructurada",
      cause: !mcpData.value
        ? "No existe configuración MCP canónica."
        : graphifyConfigured
          ? "Graphify aparece como MCP activo aunque está retirado del runtime."
          : literalSecret
            ? "La configuración contiene una credencial literal."
            : "Los servidores se obtuvieron del schema canónico sin secretos literales.",
      remediation: "Corrige .project-os/mcp.json; usa referencias de entorno y mantén Graphify fuera del MCP activo.",
      evidence: { source: mcpData.relative, servers: activeMcp.map((server) => server.id ?? server.name).sort() },
    }),
  );
  for (const signal of [
    ["mcp.startup", "mcp-startup", "Startup/handshake MCP"],
    ["mcp.tools-list", "mcp-tools", "Listado de herramientas MCP"],
    ["mcp.auth-smoke", "mcp-smoke", "Smoke autenticado MCP"],
  ]) {
    results.push(
      receiptResult({
        id: signal[0],
        profile: "harness-tooling",
        label: signal[2],
        receipt: await evidenceReceipt(root, signal[1], mcpConfigHash),
      }),
    );
  }

  const codeIndexable = config?.codeIndexable === true;
  for (const tool of ["gitnexus", "codegraph"]) {
    results.push(
      result({
        id: `code-intelligence.${tool}`,
        profile: "harness-tooling",
        status: codeIndexable ? "FAIL" : "SKIP",
        summary: codeIndexable
          ? `${tool} requerido pero no demostrado por Ola 0`
          : `${tool} no aplica antes de existir código indexable`,
        cause: codeIndexable
          ? "El perfil declara código indexable y no existe evidencia estructural vigente."
          : "El repositorio todavía contiene solo gobernanza/tooling.",
        remediation: codeIndexable
          ? `Ejecuta el smoke read-only separado de ${tool}; no reindexes ni repares desde el doctor.`
          : "Activa el check solo cuando exista código y una política de indexación aprobada.",
        evidence: { codeIndexable },
      }),
    );
  }
  results.push(
    result({
      id: "code-intelligence.graphify",
      profile: "harness-tooling",
      status: "SKIP",
      summary: "Graphify retirado del runtime activo",
      cause: "retirado/manual",
      remediation: "Ninguna; auditoría opcional fuera del bootstrap con instalación y rebuild explícitos.",
      evidence: { active: false },
    }),
  );

  const ghVersion = await command(runner, "ghVersion", root);
  results.push(
    result({
      id: "github.cli",
      status: ghVersion.ok ? "PASS" : "WARN",
      summary: ghVersion.ok ? "GitHub CLI disponible" : "GitHub CLI no disponible",
      cause: ghVersion.ok
        ? "gh respondió al probe local de versión."
        : "El bootstrap local funciona, pero la preparación remota requerirá instalación manual.",
      remediation: "Instala y autentica GitHub CLI manualmente antes de aplicar el plan Product OS.",
      evidence: { version: ghVersion.stdout.split(/\r?\n/)[0] || "no disponible" },
    }),
  );
  const productOs = await readJson(path.join(root, ".project-os", "github", "product-os.json"));
  const productOsHash = productOs
    ? sha256(`${stableJson(productOs)}\n`)
    : "missing";
  const projectReceipt = await evidenceReceipt(root, "github-project", productOsHash);
  results.push(productOs
    ? receiptResult({
      id: "github.project",
      label: "GitHub Project",
      missingStatus: "WARN",
      receipt: projectReceipt,
    })
    : result({
      id: "github.project",
      status: "FAIL",
      summary: "Falta el manifiesto Product OS",
      cause: "No existe .project-os/github/product-os.json.",
      remediation: "Restaura el manifiesto canónico antes de preparar o verificar GitHub Project.",
      evidence: { manifest: "ausente" },
    }));

  const ciCandidates = [
    ".github/workflows/project-constructor.yml",
    ".github/workflows/project-constructor.yaml",
  ];
  const ciPath = (
    await Promise.all(ciCandidates.map(async (relative) => ((await exists(path.join(root, relative))) ? relative : null)))
  ).find(Boolean);
  const ciContent = ciPath
    ? await readFile(path.join(root, ciPath), "utf8")
    : null;
  const ciHash = ciContent === null
    ? "missing"
    : sha256(ciContent.replace(/\r\n?/g, "\n"));
  const ciReceipt = await evidenceReceipt(root, "ci-local", ciHash);
  results.push(
    result({
      id: "ci.configuration",
      profile: "harness-tooling",
      status: ciPath ? "PASS" : "FAIL",
      summary: ciPath ? "CI advisory declarada" : "Falta CI del constructor",
      cause: ciPath ? "Existe un workflow versionado del núcleo." : "No se encontró el workflow esperado.",
      remediation: "Restaura el workflow advisory; no lo conviertas en blocking sin baseline y política explícita.",
      evidence: { workflow: ciPath ?? "ausente" },
    }),
  );
  results.push(receiptResult({
    id: "ci.execution",
    profile: "harness-tooling",
    label: "Ejecución CI local",
    missingStatus: "WARN",
    receipt: ciReceipt,
  }));

  const requiredVariables = Array.isArray(config?.requiredEnvironmentVariables)
    ? config.requiredEnvironmentVariables
    : [];
  for (const variable of requiredVariables.sort()) {
    const name = typeof variable === "string" ? variable : variable.name;
    const required = typeof variable === "string" ? true : variable.required !== false;
    const present = Boolean(env[name]);
    results.push(
      result({
        id: `environment.${name}`,
        status: present ? "PASS" : required ? "FAIL" : "WARN",
        summary: present ? `${name} está presente` : `${name} está ausente`,
        cause: present
          ? "La variable requerida existe; su valor no fue leído ni mostrado."
          : required
            ? "El perfil activo declara esta variable como obligatoria."
            : "La variable es opcional para el perfil activo.",
        remediation: `Configura ${name} manualmente en el entorno correspondiente; no publiques su valor.`,
        evidence: { name, present },
      }),
    );
  }

  const transactions = await inspectTransactionJournals(root);
  const transactionFailure = transactions.incomplete.length > 0
    || transactions.corrupt.length > 0;
  results.push(
    result({
      id: "constructor.transactions",
      profile: "harness-tooling",
      status: transactionFailure ? "FAIL" : "PASS",
      summary: transactionFailure
        ? "Hay journals incompletos o corruptos"
        : "Los journals de transacción están en estado terminal",
      cause: transactions.corrupt.length > 0
        ? "Uno o más journals faltan, son ilegibles o declaran un estado desconocido."
        : transactions.incomplete.length > 1
          ? "Hay múltiples transacciones incompletas; no es seguro elegir una automáticamente."
          : transactions.incomplete.length === 1
            ? "Existe una ejecución parcial que requiere una decisión explícita."
            : "No se encontraron transacciones incompletas.",
      remediation: "Ejecuta rollback o reanuda el comando mutante de forma explícita; el doctor no repara.",
      evidence: {
        corruptJournals: transactions.corrupt,
        incompleteTransactionIds: transactions.incomplete,
        journalCount: transactions.journalCount,
      },
    }),
  );

  return createReport(results);
}

export async function runDoctor({
  target,
  targetRoot,
  json = false,
  env,
  runner,
  parityChecker,
} = {}) {
  const report = await collectDoctorReport({
    target: target ?? targetRoot,
    env,
    runner,
    parityChecker,
  });
  return {
    report,
    output: json ? formatJson(report) : formatHuman(report),
    exitCode: reportExitCode(report),
  };
}

export const doctorInternals = Object.freeze({
  SAFE_COMMANDS,
  isSupportedNode,
  containsLiteralSecret,
  mcpServers,
  sha256,
  spawnReadOnly,
  normalizedRelative,
});
