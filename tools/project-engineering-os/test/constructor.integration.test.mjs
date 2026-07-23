import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test, { after, before } from "node:test";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceCli = path.join(packageRoot, "bin", "project-os.mjs");
const stateRelative = path.join(".project-constructor", "state.json");
const schemaRelative = path.join(".project-constructor", "schema");

let suiteRoot;
let baselineRoot;
let baselineBootstrap;

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

function run(command, args, { cwd, timeoutMs = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Timeout: ${path.basename(command)} ${args.join(" ")}`));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({ exitCode, stderr, stdout });
    });
  });
}

function parseJson(response, label) {
  const raw = response.stdout.trim() || response.stderr.trim();
  assert.notEqual(raw, "", `${label} no produjo salida JSON`);
  try {
    return JSON.parse(raw);
  } catch (error) {
    assert.fail(`${label} no produjo JSON válido: ${error.message}\n${raw}`);
  }
}

function assertSuccessfulConstructor(response, label) {
  assert.equal(response.exitCode, 0, `${label}: ${response.stderr || response.stdout}`);
  assert.equal(response.stderr, "", `${label} escribió stderr inesperado`);
}

async function exists(absolute) {
  try {
    await access(absolute);
    return true;
  } catch {
    return false;
  }
}

async function readJson(absolute) {
  return JSON.parse(await readFile(absolute, "utf8"));
}

async function assertConformsToSchema(root, schemaName, value, label) {
  const schema = await readJson(path.join(root, schemaRelative, schemaName));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  assert.equal(
    validate(value),
    true,
    `${label}: ${ajv.errorsText(validate.errors, { separator: "; " })}`,
  );
}

async function initializeEmptyRepository(root) {
  await mkdir(root, { recursive: true });
  const response = await run("git", ["init", "--quiet"], { cwd: root });
  assert.equal(response.exitCode, 0, response.stderr);
}

async function makeEmptyRepository(name) {
  const root = path.join(suiteRoot, name);
  await initializeEmptyRepository(root);
  return root;
}

async function cloneBaseline(name) {
  const root = path.join(suiteRoot, name);
  await cp(baselineRoot, root, { recursive: true });
  return root;
}

async function runConstructor(cli, command, target, extra = []) {
  return run(
    process.execPath,
    [cli, command, "--target", target, ...extra, "--json"],
    { cwd: target },
  );
}

async function runInstalled(target, command, extra = []) {
  return runConstructor(sourceCli, command, target, extra);
}

async function snapshot(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const output = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (relative === "" && entry.name === ".git") {
      continue;
    }
    const child = path.join(relative, entry.name);
    const normalized = child.split(path.sep).join("/");
    if (normalized.startsWith(".project-constructor/transactions/")) {
      continue;
    }
    if (entry.isDirectory()) {
      Object.assign(output, await snapshot(root, child));
    } else if (entry.isFile()) {
      output[normalized] = hash(await readFile(path.join(root, child)));
    }
  }
  return output;
}

async function exactSnapshot(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const output = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (relative === "" && entry.name === ".git") {
      continue;
    }
    const child = path.join(relative, entry.name);
    const normalized = child.split(path.sep).join("/");
    if (entry.isDirectory()) {
      Object.assign(output, await exactSnapshot(root, child));
    } else if (entry.isFile()) {
      output[normalized] = hash(await readFile(path.join(root, child)));
    }
  }
  return output;
}

async function convergedModel(root) {
  const files = await snapshot(root);
  delete files[".project-constructor/state.json"];
  const state = JSON.parse(await readFile(path.join(root, stateRelative), "utf8"));
  delete state.lastTransaction;
  return { files, state };
}

async function append(root, relative, content) {
  const absolute = path.join(root, relative);
  const current = await readFile(absolute, "utf8");
  await writeFile(absolute, `${current}${content}`);
}

async function writeRelative(root, relative, content) {
  const absolute = path.join(root, ...relative.split("/"));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
}

async function prepareOpsxFixture(name) {
  const target = await cloneBaseline(name);
  const contract = JSON.parse(await readFile(
    path.join(target, ".project-os", "openspec-ownership.json"),
    "utf8",
  ));
  assert.equal(contract.managedBlocks.length, 3);
  assert.equal(contract.managedBlocks.every((block) => block.targets.length === 5), true);
  const codexSkillByWorkflow = {
    apply: "openspec-apply-change",
    archive: "openspec-archive-change",
    explore: "openspec-explore",
    propose: "openspec-propose",
    sync: "openspec-sync-specs",
  };
  const generatedTargets = [
    "apply",
    "archive",
    "explore",
    "propose",
    "sync",
  ].flatMap((workflow) => [
    `.claude/commands/opsx/${workflow}.md`,
    `.codex/skills/${codexSkillByWorkflow[workflow]}/SKILL.md`,
    `.cursor/commands/opsx-${workflow}.md`,
    `.github/prompts/opsx-${workflow}.prompt.md`,
    `.opencode/commands/opsx-${workflow}.md`,
  ]);
  assert.equal(new Set(generatedTargets).size, 25);

  await writeRelative(
    target,
    "node_modules/@fission-ai/openspec/package.json",
    `${JSON.stringify({
      name: "@fission-ai/openspec",
      version: "1.6.0",
    }, null, 2)}\n`,
  );
  const localBin = process.platform === "win32"
    ? "node_modules/.bin/openspec.cmd"
    : "node_modules/.bin/openspec";
  await writeRelative(target, localBin, "local OpenSpec fixture\n");

  for (const relative of generatedTargets) {
    const workflow = Object.entries(codexSkillByWorkflow)
      .find(([, skill]) => relative.includes(skill))?.[0]
      ?? relative.match(/opsx[/-](apply|archive|explore|propose|sync)/)?.[1];
    await writeRelative(
      target,
      relative,
      [
        "---",
        `description: Official OpenSpec ${workflow} fixture`,
        "---",
        "",
        `# OpenSpec ${workflow}`,
        "",
        "Inspect with `openspec status` before continuing.",
        "",
      ].join("\n"),
    );
  }
  return { contract, generatedTargets, target };
}

async function targetHashes(root, targets) {
  return Object.fromEntries(await Promise.all(targets.map(async (relative) => [
    relative,
    hash(await readFile(path.join(root, ...relative.split("/")))),
  ])));
}

async function setInstalledRelease(target, version) {
  const packagePath = path.join(target, "package.json");
  const manifest = await readJson(packagePath);
  manifest.devDependencies["create-project-engineering-os"] = version;
  await writeFile(packagePath, `${JSON.stringify(manifest, null, 2)}\n`);

  const lockPath = path.join(target, "package-lock.json");
  const lock = await readJson(lockPath);
  lock.packages[""].devDependencies["create-project-engineering-os"] = version;
  lock.packages["node_modules/create-project-engineering-os"].version = version;
  lock.packages["node_modules/create-project-engineering-os"].resolved =
    `https://registry.npmjs.org/create-project-engineering-os/-/create-project-engineering-os-${version}.tgz`;
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const statePath = path.join(target, stateRelative);
  const state = await readJson(statePath);
  state.packageVersion = version;
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

before(async () => {
  suiteRoot = await mkdtemp(path.join(tmpdir(), "project-constructor-integration-"));
  baselineRoot = path.join(suiteRoot, "baseline-empty-git");
  await initializeEmptyRepository(baselineRoot);
  const response = await runConstructor(sourceCli, "bootstrap", baselineRoot);
  baselineBootstrap = parseJson(response, "bootstrap inicial");
  assertSuccessfulConstructor(response, "bootstrap inicial");
}, { timeout: 120_000 });

after(async () => {
  if (suiteRoot) {
    await rm(suiteRoot, { force: true, recursive: true });
  }
});

test("bootstrap prepara un repositorio Git vacío sin copiar un runtime editable", async () => {
  assert.equal(baselineBootstrap.command, "bootstrap");
  assert.equal(baselineBootstrap.status, "APPLIED");
  assert.equal(baselineBootstrap.mutationPerformed, true);
  assert.ok(baselineBootstrap.transaction.transactionId);
  assert.equal(
    await exists(path.join(baselineRoot, ".project-constructor", "runtime")),
    false,
  );
  const consumerPackage = await readJson(path.join(baselineRoot, "package.json"));
  assert.equal(consumerPackage.devDependencies["create-project-engineering-os"], "0.1.0");
  assert.equal(await exists(path.join(baselineRoot, "AGENTS.md")), true);
  assert.equal(await exists(path.join(baselineRoot, "openspec", "config.yaml")), true);
  assert.equal(baselineBootstrap.plan.externalOwnership.owner, "external-openspec");
  assert.equal(
    baselineBootstrap.plan.externalOwnership.generatedGlobs.includes(
      ".codex/skills/openspec-*/SKILL.md",
    ),
    true,
  );
  assert.match(
    baselineBootstrap.plan.externalOwnership.commands.init,
    /^npm exec --yes=false -- openspec init /,
  );
  assert.equal(
    baselineBootstrap.plan.operations.some(
      (operation) => operation.owner === "external-openspec",
    ),
    false,
  );
});

test("bootstrap inicializa deuda vacía y el namespace debt usa la misma release", async () => {
  const registry = await readJson(path.join(
    baselineRoot,
    ".project-os",
    "debt",
    "registry.json",
  ));
  assert.deepEqual(registry, { schemaVersion: 1, items: [] });
  const response = await run(
    process.execPath,
    [sourceCli, "debt", "check", "--root", baselineRoot, "--json"],
    { cwd: baselineRoot },
  );
  assert.equal(response.exitCode, 0, response.stderr || response.stdout);
  const report = parseJson(response, "project-os debt check");
  assert.equal(report.verdict, "PASS");
  assert.equal(report.evaluation.openDebtCount, 0);

  const version = await run(process.execPath, [sourceCli, "--version"], { cwd: baselineRoot });
  const debtVersion = await run(
    process.execPath,
    [sourceCli, "debt", "--version"],
    { cwd: baselineRoot },
  );
  assert.equal(version.stdout, debtVersion.stdout);
});

test("bootstrap conserva la licencia del consumidor y no inventa una", async () => {
  const licensed = await makeEmptyRepository("consumer-license");
  const original = "Consumer license selected by its owner.\n";
  await writeFile(path.join(licensed, "LICENSE"), original);
  const first = await runConstructor(sourceCli, "bootstrap", licensed);
  assertSuccessfulConstructor(first, "bootstrap con licencia de consumidor");
  assert.equal(await readFile(path.join(licensed, "LICENSE"), "utf8"), original);

  const unlicensed = await makeEmptyRepository("consumer-without-license");
  const second = await runConstructor(sourceCli, "bootstrap", unlicensed);
  assertSuccessfulConstructor(second, "bootstrap sin licencia de producto");
  assert.equal(await exists(path.join(unlicensed, "LICENSE")), false);
  assert.equal(
    await exists(path.join(unlicensed, "docs", "engineering", "MANAGED_FILES_NOTICE.md")),
    true,
  );
});

test("la política de deuda seed-once se conserva y el segundo sync queda sin drift", async () => {
  const target = await cloneBaseline("debt-policy-seed-once");
  const policyPath = path.join(target, ".project-os", "debt", "config.json");
  const policy = await readJson(policyPath);
  policy.budget.threshold = 7;
  await writeFile(policyPath, `${JSON.stringify(policy, null, 2)}\n`);

  const first = await runInstalled(target, "sync");
  assertSuccessfulConstructor(first, "sync tras personalizar policy");
  assert.equal((await readJson(policyPath)).budget.threshold, 7);
  const second = await runInstalled(target, "sync", ["--check"]);
  assertSuccessfulConstructor(second, "check tras estabilizar policy");
  assert.equal(parseJson(second, "policy seed-once").plan.hasDrift, false);
});

test("schemas JSON 2020-12 compilan en strict y validan artefactos reales", async () => {
  const installedSchemaRoot = path.join(baselineRoot, schemaRelative);
  const schemaFiles = (await readdir(installedSchemaRoot))
    .filter((file) => file.endsWith(".schema.json"))
    .sort();
  assert.equal(schemaFiles.length, 10);

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  for (const schemaFile of schemaFiles) {
    ajv.compile(await readJson(path.join(installedSchemaRoot, schemaFile)));
  }

  const state = await readJson(path.join(baselineRoot, stateRelative));
  assert.ok(state.lastTransaction);
  const journal = await readJson(path.join(
    baselineRoot,
    ".project-constructor",
    "transactions",
    state.lastTransaction,
    "journal.json",
  ));
  const cases = [
    ["config.schema.json", ".project-constructor/config.json"],
    ["harness-capabilities.schema.json", ".project-os/harness-capabilities.json"],
    [
      "pre-propose-readiness.schema.json",
      "docs/engineering/templates/pre-propose-readiness.example.json",
    ],
    ["profiles.schema.json", ".project-os/profiles.json"],
    ["readiness-policy.schema.json", ".project-os/readiness-policy.json"],
    [
      "readiness.schema.json",
      "docs/engineering/templates/readiness.example.json",
    ],
  ];
  for (const [schemaName, relative] of cases) {
    await assertConformsToSchema(
      baselineRoot,
      schemaName,
      await readJson(path.join(baselineRoot, ...relative.split("/"))),
      `${relative} contra ${schemaName}`,
    );
  }
  await assertConformsToSchema(
    baselineRoot,
    "manifest.schema.json",
    await readJson(path.join(packageRoot, "blueprint", "manifest.json")),
    "manifest de la release",
  );
  await assertConformsToSchema(
    baselineRoot,
    "state.schema.json",
    state,
    "state real",
  );
  await assertConformsToSchema(
    baselineRoot,
    "transaction.schema.json",
    journal,
    "journal real",
  );

  const invalidState = { ...state };
  delete invalidState.schemaVersion;
  const stateValidator = ajv.getSchema("https://project-os.local/schema/state.schema.json");
  assert.ok(stateValidator);
  assert.equal(stateValidator(invalidState), false);
});

test("segundo bootstrap, sync --check y doctor reutilizan la release exacta sin source embebido", { timeout: 120_000 }, async () => {
  const beforeSecondRun = await exactSnapshot(baselineRoot);
  const second = await runInstalled(baselineRoot, "bootstrap");
  const secondPayload = parseJson(second, "segundo bootstrap instalado");
  const afterSecondRun = await exactSnapshot(baselineRoot);

  assertSuccessfulConstructor(second, "segundo bootstrap instalado");
  assert.equal(secondPayload.mutationPerformed, false);
  assert.equal(secondPayload.transaction.transactionId, null);
  assert.equal(secondPayload.plan.hasDrift, false);
  assert.deepEqual(afterSecondRun, beforeSecondRun);

  const syncBefore = await exactSnapshot(baselineRoot);
  const sync = await runInstalled(baselineRoot, "sync", ["--check"]);
  const syncPayload = parseJson(sync, "sync --check instalado");
  assertSuccessfulConstructor(sync, "sync --check instalado");
  assert.equal(syncPayload.status, "IN_SYNC");
  assert.equal(syncPayload.mutationPerformed, false);
  assert.deepEqual(await exactSnapshot(baselineRoot), syncBefore);

  const doctorBefore = await exactSnapshot(baselineRoot);
  const doctor = await runInstalled(baselineRoot, "doctor");
  const doctorPayload = parseJson(doctor, "doctor instalado");
  await assertConformsToSchema(
    baselineRoot,
    "doctor-result.schema.json",
    doctorPayload,
    "salida real de doctor",
  );
  assert.equal(doctorPayload.results.some((result) => result.id === "sdd.openspec-local"), true);
  assert.equal(
    doctorPayload.results.find((result) => result.id === "sdd.openspec-local").status,
    "FAIL",
    "sin npm ci, el doctor debe reportar la dependencia local ausente en vez de repararla",
  );
  assert.equal(doctorPayload.results.find((result) => result.id === "harness.parity").status, "PASS");
  assert.deepEqual(await exactSnapshot(baselineRoot), doctorBefore);
});

test("github-plan produce un plan remoto neutral y permanece estrictamente read-only", { timeout: 120_000 }, async () => {
  const target = await cloneBaseline("github-plan");
  const beforePlan = await exactSnapshot(target);
  const response = await runInstalled(target, "github-plan");
  const payload = parseJson(response, "github-plan instalado");

  assertSuccessfulConstructor(response, "github-plan instalado");
  assert.equal(payload.command, "github-plan");
  assert.equal(payload.mutationPerformed, false);
  assert.equal(payload.plan.mode, "dry-run");
  assert.equal(payload.plan.mutationPerformed, false);
  assert.equal(payload.plan.remote.status, "not-verified");
  assert.equal(payload.plan.resources.discoveryIssues.length, 10);
  for (const resource of ["labels", "statuses", "fields", "templates"]) {
    assert.ok(payload.plan.resources[resource].length > 0, resource);
  }
  assert.ok(payload.plan.manualGates.length > 0);
  for (const gate of payload.plan.manualGates) {
    assert.equal(typeof gate.description, "string");
    assert.notEqual(gate.description, "");
    assert.equal(gate.status, "pending-manual");
    assert.equal(Object.keys(gate).some((key) => /^\d+$/.test(key)), false);
  }
  assert.deepEqual(await exactSnapshot(target), beforePlan);
});

test("una colisión preexistente aborta antes de cualquier escritura parcial", { timeout: 120_000 }, async () => {
  const target = await makeEmptyRepository("collision");
  await writeFile(path.join(target, "README.md"), "# Trabajo humano preexistente\n");
  const beforeCollision = await exactSnapshot(target);

  const response = await runConstructor(sourceCli, "bootstrap", target);
  const payload = parseJson(response, "bootstrap con colisión");

  assert.equal(response.exitCode, 2);
  assert.equal(payload.code, "PLAN_CONFLICT");
  assert.match(payload.cause, /colisiones/i);
  assert.deepEqual(await exactSnapshot(target), beforeCollision);
  assert.equal(await exists(path.join(target, stateRelative)), false);
});

test("un fallo inyectado deja journal y la reanudación converge al estado limpio", { timeout: 120_000 }, async () => {
  const target = await makeEmptyRepository("resume");
  const interrupted = await runConstructor(
    sourceCli,
    "bootstrap",
    target,
    ["--inject-failure-after", "3"],
  );
  const interruptedPayload = parseJson(interrupted, "bootstrap interrumpido");

  assert.equal(interrupted.exitCode, 3);
  assert.equal(interruptedPayload.code, "INJECTED_FAILURE");
  const transactionDetail = interruptedPayload.details.find((detail) => /^transaction=/.test(detail));
  assert.ok(transactionDetail);
  const transactionId = transactionDetail.slice("transaction=".length);
  const journalPath = path.join(
    target,
    ".project-constructor",
    "transactions",
    transactionId,
    "journal.json",
  );
  assert.equal(JSON.parse(await readFile(journalPath, "utf8")).status, "failed");

  const resumed = await runConstructor(sourceCli, "bootstrap", target);
  const resumedPayload = parseJson(resumed, "bootstrap reanudado");
  assertSuccessfulConstructor(resumed, "bootstrap reanudado");
  assert.equal(resumedPayload.transaction.resumed, true);
  assert.equal(resumedPayload.transaction.transactionId, transactionId);
  assert.equal(JSON.parse(await readFile(journalPath, "utf8")).status, "completed");

  const parity = await runInstalled(target, "sync", ["--check"]);
  assertSuccessfulConstructor(parity, "paridad tras reanudación");
  assert.equal(parseJson(parity, "paridad tras reanudación").plan.hasDrift, false);
  assert.deepEqual(await convergedModel(target), await convergedModel(baselineRoot));
});

test("rollback normal restaura el repositorio previo y conserva evidencia del journal", { timeout: 120_000 }, async () => {
  const target = await cloneBaseline("rollback-normal");
  const state = JSON.parse(await readFile(path.join(target, stateRelative), "utf8"));
  const transactionId = state.lastTransaction;
  const journalPath = path.join(
    target,
    ".project-constructor",
    "transactions",
    transactionId,
    "journal.json",
  );
  const journalBefore = JSON.parse(await readFile(journalPath, "utf8"));

  const response = await runInstalled(target, "rollback", ["--transaction", transactionId]);
  const payload = parseJson(response, "rollback normal");

  assertSuccessfulConstructor(response, "rollback normal");
  assert.equal(payload.status, "ROLLED_BACK");
  assert.equal(payload.transactionId, transactionId);
  assert.equal(await exists(path.join(target, stateRelative)), false);
  for (const operation of journalBefore.operations.filter((item) => item.status === "applied")) {
    assert.equal(
      await exists(path.join(target, ...operation.target.split("/"))),
      false,
      `${operation.target} debía desaparecer al restaurar la fixture vacía`,
    );
  }
  const journalAfter = JSON.parse(await readFile(journalPath, "utf8"));
  assert.equal(journalAfter.status, "rolled-back");
  assert.equal(
    journalAfter.operations.every((operation) => operation.status === "rolled-back"),
    true,
  );
  assert.equal(journalAfter.state.status, "rolled-back");
});

test("rollback rechaza una edición humana sin aplicar una restauración parcial", { timeout: 120_000 }, async () => {
  const target = await cloneBaseline("rollback-human-edit");
  const state = JSON.parse(await readFile(path.join(target, stateRelative), "utf8"));
  const transactionId = state.lastTransaction;
  await append(target, "AGENTS.md", "\nEdición humana posterior.\n");
  const beforeRollback = await exactSnapshot(target);

  const response = await runInstalled(target, "rollback", ["--transaction", transactionId]);
  const payload = parseJson(response, "rollback con edición humana");

  assert.equal(response.exitCode, 2);
  assert.equal(payload.code, "ROLLBACK_CONFLICT");
  assert.match(payload.cause, /antes de modificar archivos/i);
  assert.deepEqual(await exactSnapshot(target), beforeRollback);
  assert.equal(await exists(path.join(target, "CLAUDE.md")), true);
  assert.equal(await exists(path.join(target, stateRelative)), true);
  const journal = JSON.parse(await readFile(
    path.join(
      target,
      ".project-constructor",
      "transactions",
      transactionId,
      "journal.json",
    ),
    "utf8",
  ));
  assert.equal(journal.status, "completed");
});

test("editar la fuente canónica actualiza determinísticamente todos sus espejos", { timeout: 120_000 }, async () => {
  const target = await cloneBaseline("canonical-sync");
  const marker = "PROJECT_OS_CANONICAL_MARKER_2026";
  await append(target, ".project-os/instructions.md", `\n${marker}\n`);

  const response = await runInstalled(target, "sync");
  const payload = parseJson(response, "sync de fuente canónica");
  assertSuccessfulConstructor(response, "sync de fuente canónica");
  assert.equal(payload.status, "APPLIED");
  assert.ok(payload.plan.summary.updates >= 6);

  const mirrors = [
    "AGENTS.md",
    "CLAUDE.md",
    "OPENCODE.md",
    ".cursor/rules/project-os.mdc",
    ".github/copilot-instructions.md",
    ".opencode/project-os.md",
  ];
  for (const mirror of mirrors) {
    assert.match(await readFile(path.join(target, mirror), "utf8"), new RegExp(marker), mirror);
  }
  const opencodeConfig = JSON.parse(await readFile(path.join(target, "opencode.json"), "utf8"));
  assert.equal(opencodeConfig.instructions.includes(".opencode/project-os.md"), true);
  const check = await runInstalled(target, "sync", ["--check"]);
  assertSuccessfulConstructor(check, "check posterior al render");
  assert.equal(parseJson(check, "check posterior al render").plan.hasDrift, false);
});

test("human-overlay actualiza solo el bloque administrado y preserva contenido local", { timeout: 120_000 }, async () => {
  const target = await makeEmptyRepository("human-overlay");
  const blueprintRoot = path.join(suiteRoot, "human-overlay-blueprint");
  await cp(path.join(packageRoot, "blueprint"), blueprintRoot, { recursive: true });
  const manifestPath = path.join(blueprintRoot, "manifest.json");
  const manifest = await readJson(manifestPath);
  manifest.files.push({
    id: "human-overlay-fixture",
    source: "core/human-overlay-fixture.md",
    target: "LOCAL_INSTRUCTIONS.md",
    owner: "human-overlay",
    mode: "text",
    lineEndings: "lf",
    managedSection: {
      start: "<!-- PROJECT_OS_CORE:START -->",
      end: "<!-- PROJECT_OS_CORE:END -->",
    },
    required: true,
  });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const sourceRelative = "core/human-overlay-fixture.md";
  await writeRelative(
    blueprintRoot,
    sourceRelative,
    [
      "# Instrucciones locales",
      "",
      "<!-- PROJECT_OS_CORE:START -->",
      "Núcleo canónico v1.",
      "<!-- PROJECT_OS_CORE:END -->",
      "",
    ].join("\n"),
  );

  const bootstrap = await runConstructor(
    sourceCli,
    "bootstrap",
    target,
    ["--blueprint", blueprintRoot],
  );
  assertSuccessfulConstructor(bootstrap, "bootstrap human-overlay");
  await append(
    target,
    "LOCAL_INSTRUCTIONS.md",
    "\nContenido humano fuera del bloque.\n",
  );
  await writeRelative(
    blueprintRoot,
    sourceRelative,
    [
      "# Instrucciones locales",
      "",
      "<!-- PROJECT_OS_CORE:START -->",
      "Núcleo canónico v2.",
      "<!-- PROJECT_OS_CORE:END -->",
      "",
    ].join("\n"),
  );

  const sync = await runConstructor(
    sourceCli,
    "sync",
    target,
    ["--blueprint", blueprintRoot],
  );
  assertSuccessfulConstructor(sync, "sync human-overlay");
  const synced = await readFile(path.join(target, "LOCAL_INSTRUCTIONS.md"), "utf8");
  assert.match(synced, /Núcleo canónico v2\./);
  assert.match(synced, /Contenido humano fuera del bloque\./);
  const state = await readJson(path.join(target, stateRelative));
  assert.equal(state.files["LOCAL_INSTRUCTIONS.md"].owner, "human-overlay");

  await writeFile(
    path.join(target, "LOCAL_INSTRUCTIONS.md"),
    synced.replace("Núcleo canónico v2.", "Edición humana dentro del bloque."),
  );
  const beforeConflict = await exactSnapshot(target);
  const conflict = await runConstructor(
    sourceCli,
    "sync",
    target,
    ["--blueprint", blueprintRoot, "--check"],
  );
  const conflictPayload = parseJson(conflict, "conflicto human-overlay");
  assert.equal(conflict.exitCode, 1);
  assert.equal(
    conflictPayload.plan.operations.some((operation) => (
      operation.target === "LOCAL_INSTRUCTIONS.md"
      && operation.operation === "conflict"
    )),
    true,
  );
  assert.deepEqual(await exactSnapshot(target), beforeConflict);
});

test("drift en cada harness hace fallar --check sin mutar la fixture", { timeout: 120_000 }, async () => {
  const harnesses = [
    ["claude-code", "CLAUDE.md"],
    ["codex", "AGENTS.md"],
    ["cursor", ".cursor/rules/project-os.mdc"],
    ["github-copilot", ".github/copilot-instructions.md"],
    ["opencode", "OPENCODE.md"],
  ];

  await Promise.all(harnesses.map(async ([harness, relative]) => {
    const target = await cloneBaseline(`drift-${harness}`);
    await append(target, relative, `\nDrift de fixture ${harness}.\n`);
    const beforeCheck = await exactSnapshot(target);
    const response = await runInstalled(target, "sync", ["--check"]);
    const payload = parseJson(response, `drift ${harness}`);

    assert.equal(response.exitCode, 1, harness);
    assert.equal(payload.status, "DRIFT", harness);
    assert.equal(payload.mutationPerformed, false, harness);
    assert.equal(payload.plan.hasDrift, true, harness);
    assert.equal(
      payload.plan.operations.some((operation) => (
        operation.target === relative.split(path.sep).join("/")
        && operation.operation === "conflict"
      )),
      true,
      harness,
    );
    assert.deepEqual(await exactSnapshot(target), beforeCheck, harness);
  }));
});

test("las subtables TOML de un MCP no se cuentan como servidores adicionales", async () => {
  const harnessModule = await import(pathToFileURL(path.join(packageRoot, "src", "harness.mjs")).href);
  const toml = [
    "[mcp_servers.documentation]",
    'command = "node"',
    "",
    "[mcp_servers.documentation.env]",
    'DOCUMENTATION_TOKEN = "${DOCUMENTATION_TOKEN}"',
    "",
    "[mcp_servers.documentation.metadata]",
    'owner = "project"',
    "",
  ].join("\n");

  assert.deepEqual(harnessModule.parseCodexMcpServerIds(toml), ["documentation"]);
});

test("OpenCode recibe MCP local y remoto en su schema real", async () => {
  const harnessModule = await import(pathToFileURL(path.join(
    packageRoot,
    "src",
    "harness.mjs",
  )).href);
  const servers = [
    {
      id: "docs-local",
      enabled: true,
      command: "npx",
      args: ["-y", "docs-mcp"],
      env: { DOCS_TOKEN: "${DOCS_TOKEN}" },
      headers: {},
      url: null,
    },
    {
      id: "github-remote",
      enabled: true,
      command: null,
      args: [],
      env: {},
      headers: { Authorization: "${GITHUB_TOKEN}" },
      url: "https://mcp.example.test",
    },
  ];

  assert.deepEqual(harnessModule.jsonMcpServers(servers, "opencode.json"), {
    "docs-local": {
      command: ["npx", "-y", "docs-mcp"],
      enabled: true,
      environment: { DOCS_TOKEN: "${DOCS_TOKEN}" },
      type: "local",
    },
    "github-remote": {
      enabled: true,
      headers: { Authorization: "${GITHUB_TOKEN}" },
      type: "remote",
      url: "https://mcp.example.test",
    },
  });
  assert.deepEqual(harnessModule.jsonMcpServers(servers, ".cursor/mcp.json"), {
    "docs-local": {
      args: ["-y", "docs-mcp"],
      command: "npx",
      env: { DOCS_TOKEN: "${DOCS_TOKEN}" },
    },
    "github-remote": {
      headers: { Authorization: "${GITHUB_TOKEN}" },
      url: "https://mcp.example.test",
    },
  });
});

test("sync renderiza MCP local y remoto con shapes exactos en los cinco harnesses", { timeout: 120_000 }, async () => {
  const target = await cloneBaseline("mcp-non-empty");
  const canonicalPath = path.join(target, ".project-os", "mcp.json");
  const canonical = JSON.parse(await readFile(canonicalPath, "utf8"));
  canonical.servers = [
    {
      id: "docs-local",
      enabled: true,
      command: "node",
      args: ["./tools/docs-server.mjs", "--stdio"],
      env: {
        DOCS_TOKEN: "${DOCS_TOKEN}",
      },
    },
    {
      id: "reference-remote",
      enabled: true,
      url: "https://mcp.example.test",
    },
  ];
  await writeFile(canonicalPath, `${JSON.stringify(canonical, null, 2)}\n`);

  const response = await runInstalled(target, "sync");
  const payload = parseJson(response, "sync MCP no vacío");
  assertSuccessfulConstructor(response, "sync MCP no vacío");
  assert.equal(payload.status, "APPLIED");
  const expectedIds = ["docs-local", "reference-remote"];

  const claude = JSON.parse(await readFile(path.join(target, ".mcp.json"), "utf8"));
  const cursor = JSON.parse(await readFile(path.join(target, ".cursor", "mcp.json"), "utf8"));
  const opencode = JSON.parse(await readFile(path.join(target, "opencode.json"), "utf8"));
  for (const adapter of [claude.mcpServers, cursor.mcpServers, opencode.mcp]) {
    assert.deepEqual(Object.keys(adapter).sort(), expectedIds);
  }
  assert.deepEqual(claude.mcpServers["docs-local"], {
    args: ["./tools/docs-server.mjs", "--stdio"],
    command: "node",
    env: { DOCS_TOKEN: "${DOCS_TOKEN}" },
  });
  assert.deepEqual(cursor.mcpServers, claude.mcpServers);
  assert.deepEqual(opencode.mcp["docs-local"], {
    command: ["node", "./tools/docs-server.mjs", "--stdio"],
    enabled: true,
    environment: { DOCS_TOKEN: "${DOCS_TOKEN}" },
    type: "local",
  });
  assert.deepEqual(opencode.mcp["reference-remote"], {
    enabled: true,
    type: "remote",
    url: "https://mcp.example.test",
  });

  const codexText = await readFile(path.join(target, ".codex", "config.toml"), "utf8");
  const installedHarness = await import(pathToFileURL(path.join(packageRoot, "src", "harness.mjs")).href);
  assert.deepEqual(installedHarness.parseCodexMcpServerIds(codexText), expectedIds);
  assert.match(codexText, /command = "node"/);
  assert.match(codexText, /args = \["\.\/tools\/docs-server\.mjs", "--stdio"\]/);
  assert.match(codexText, /DOCS_TOKEN = "\$\{DOCS_TOKEN\}"/);
  assert.match(codexText, /url = "https:\/\/mcp\.example\.test"/);

  const rendered = [
    await readFile(path.join(target, ".mcp.json"), "utf8"),
    await readFile(path.join(target, ".cursor", "mcp.json"), "utf8"),
    codexText,
    await readFile(path.join(target, "opencode.json"), "utf8"),
  ].join("\n");
  assert.doesNotMatch(rendered, /super-secret-value/);
  const check = await runInstalled(target, "sync", ["--check"]);
  assertSuccessfulConstructor(check, "sync --check MCP no vacío");
  assert.equal(parseJson(check, "sync --check MCP no vacío").plan.hasDrift, false);
});

test("opsx-adapt estabiliza 25 archivos externos y opsx-check detecta shape drift sin repararlo", { timeout: 120_000 }, async () => {
  const { contract, generatedTargets, target } = await prepareOpsxFixture("opsx-cycle");
  const statePath = path.join(target, stateRelative);
  const stateBefore = await readFile(statePath);

  const adapted = await runInstalled(target, "opsx-adapt");
  const adaptedPayload = parseJson(adapted, "opsx-adapt inicial");
  assertSuccessfulConstructor(adapted, "opsx-adapt inicial");
  assert.equal(adaptedPayload.status, "APPLIED");
  assert.equal(adaptedPayload.plan.generatedFileCount, 25);
  assert.equal(adaptedPayload.plan.summary.updates, 25);
  assert.equal(adaptedPayload.plan.operations.every((operation) => (
    operation.owner === "external-openspec"
  )), true);
  assert.deepEqual(await readFile(statePath), stateBefore);

  for (const block of contract.managedBlocks) {
    for (const relative of block.targets) {
      const content = await readFile(path.join(target, ...relative.split("/")), "utf8");
      assert.equal(content.split(block.start).length - 1, 1, relative);
      assert.equal(content.split(block.end).length - 1, 1, relative);
      assert.match(content, /npm exec --yes=false -- openspec status/, relative);
      assert.match(content, new RegExp(block.content.split("\n")[0]), relative);
    }
  }

  const beforeCheck = await exactSnapshot(target);
  const checked = await runInstalled(target, "opsx-check");
  const checkedPayload = parseJson(checked, "opsx-check sano");
  assertSuccessfulConstructor(checked, "opsx-check sano");
  assert.equal(checkedPayload.status, "PASS");
  assert.equal(checkedPayload.mutationPerformed, false);
  assert.equal(checkedPayload.checks.some((item) => item.status === "FAIL"), false);
  assert.deepEqual(await exactSnapshot(target), beforeCheck);

  const beforeSecondAdapt = await exactSnapshot(target);
  const secondAdapt = await runInstalled(target, "opsx-adapt");
  const secondPayload = parseJson(secondAdapt, "segundo opsx-adapt");
  assertSuccessfulConstructor(secondAdapt, "segundo opsx-adapt");
  assert.equal(secondPayload.status, "IN_SYNC");
  assert.equal(secondPayload.mutationPerformed, false);
  assert.equal(secondPayload.transaction, null);
  assert.deepEqual(await exactSnapshot(target), beforeSecondAdapt);

  const beforeGeneralSync = await exactSnapshot(target);
  const generalSync = await runInstalled(target, "sync");
  const generalPayload = parseJson(generalSync, "sync general con OPSX");
  assertSuccessfulConstructor(generalSync, "sync general con OPSX");
  assert.equal(generalPayload.mutationPerformed, false);
  assert.deepEqual(await exactSnapshot(target), beforeGeneralSync);

  const driftBlock = contract.managedBlocks[0];
  const driftTarget = driftBlock.targets[0];
  await append(target, driftTarget, `\n${driftBlock.start}\n`);
  const beforeDriftAdapt = await exactSnapshot(target);
  const driftAdapt = await runInstalled(target, "opsx-adapt");
  const driftAdaptPayload = parseJson(driftAdapt, "opsx-adapt con shape drift");
  assert.equal(driftAdapt.exitCode, 2);
  assert.equal(driftAdaptPayload.code, "OPSX_BLOCK_SHAPE_DRIFT");
  assert.deepEqual(await exactSnapshot(target), beforeDriftAdapt);

  const beforeDriftCheck = await exactSnapshot(target);
  const driftCheck = await runInstalled(target, "opsx-check");
  const driftCheckPayload = parseJson(driftCheck, "opsx-check con shape drift");
  assert.equal(driftCheck.exitCode, 1);
  assert.equal(driftCheckPayload.status, "FAIL");
  assert.equal(driftCheckPayload.mutationPerformed, false);
  assert.equal(driftCheckPayload.checks.some((item) => (
    item.id.includes(driftBlock.id) && item.status === "FAIL"
  )), true);
  assert.deepEqual(await exactSnapshot(target), beforeDriftCheck);

  const state = JSON.parse(await readFile(statePath, "utf8"));
  assert.equal(generatedTargets.some((relative) => Object.hasOwn(state.files, relative)), false);
});

test("opsx-adapt revierte automáticamente un fallo inyectado y deja journal terminal", { timeout: 120_000 }, async () => {
  const { generatedTargets, target } = await prepareOpsxFixture("opsx-injected-rollback");
  const beforeTargets = await targetHashes(target, generatedTargets);
  const stateBefore = await readFile(path.join(target, stateRelative));

  const interrupted = await runInstalled(
    target,
    "opsx-adapt",
    ["--inject-failure-after", "2"],
  );
  const interruptedPayload = parseJson(interrupted, "opsx-adapt interrumpido");
  assert.equal(interrupted.exitCode, 2);
  assert.equal(interruptedPayload.code, "OPSX_INJECTED_FAILURE");
  assert.deepEqual(await targetHashes(target, generatedTargets), beforeTargets);
  assert.deepEqual(await readFile(path.join(target, stateRelative)), stateBefore);

  const transactionRoot = path.join(target, ".project-constructor", "opsx-transactions");
  const transactionIds = await readdir(transactionRoot);
  assert.equal(transactionIds.length, 1);
  const journal = JSON.parse(await readFile(
    path.join(transactionRoot, transactionIds[0], "journal.json"),
    "utf8",
  ));
  assert.equal(journal.status, "rolled-back");
  assert.equal(journal.operations.some((operation) => operation.status === "applied"), false);

  const retry = await runInstalled(target, "opsx-adapt");
  const retryPayload = parseJson(retry, "opsx-adapt tras rollback automático");
  assertSuccessfulConstructor(retry, "opsx-adapt tras rollback automático");
  assert.equal(retryPayload.status, "APPLIED");
  const check = await runInstalled(target, "opsx-check");
  assertSuccessfulConstructor(check, "opsx-check tras recuperación");
  assert.equal(parseJson(check, "opsx-check tras recuperación").status, "PASS");
});

test("upgrade es determinista, preserva deuda y admite rollback explícito", { timeout: 120_000 }, async () => {
  const target = await cloneBaseline("upgrade-deterministic");
  const previousVersion = "0.0.9";
  await setInstalledRelease(target, previousVersion);
  await writeRelative(
    target,
    ".project-os/debt/assessments/existing.json",
    '{"fixture":"must-remain-byte-identical"}\n',
  );
  const debtTargets = [
    ".project-os/debt/assessments/existing.json",
    ".project-os/debt/config.json",
    ".project-os/debt/registry.json",
  ];
  const debtBefore = await targetHashes(target, debtTargets);
  const beforeCheck = await exactSnapshot(target);

  const firstCheck = await runInstalled(target, "upgrade", ["--check"]);
  const firstPayload = parseJson(firstCheck, "upgrade --check inicial");
  assert.equal(firstCheck.exitCode, 1);
  assert.equal(firstPayload.status, "DRIFT");
  assert.equal(firstPayload.targetVersion, "0.1.0");
  assert.equal(firstPayload.mutationPerformed, false);
  assert.deepEqual(await exactSnapshot(target), beforeCheck);

  const secondCheck = await runInstalled(target, "upgrade", ["--check"]);
  const secondPayload = parseJson(secondCheck, "segundo upgrade --check");
  assert.equal(secondCheck.exitCode, 1);
  assert.deepEqual(secondPayload.plan, firstPayload.plan);
  assert.deepEqual(await exactSnapshot(target), beforeCheck);

  const applied = await runInstalled(target, "upgrade", ["--apply"]);
  const appliedPayload = parseJson(applied, "upgrade --apply");
  assertSuccessfulConstructor(applied, "upgrade --apply");
  assert.equal(appliedPayload.status, "APPLIED");
  assert.ok(appliedPayload.transaction.transactionId);
  assert.match(appliedPayload.rollback, /project-os rollback/);
  assert.equal(
    (await readJson(path.join(target, "package.json")))
      .devDependencies["create-project-engineering-os"],
    "0.1.0",
  );
  assert.equal(
    (await readJson(path.join(target, "package-lock.json")))
      .packages["node_modules/create-project-engineering-os"].version,
    "0.1.0",
  );
  assert.equal((await readJson(path.join(target, stateRelative))).packageVersion, "0.1.0");
  assert.deepEqual(await targetHashes(target, debtTargets), debtBefore);

  const converged = await runInstalled(target, "upgrade", ["--check"]);
  assertSuccessfulConstructor(converged, "upgrade --check convergente");
  assert.equal(parseJson(converged, "upgrade convergente").status, "IN_SYNC");

  const rolledBack = await runInstalled(
    target,
    "rollback",
    ["--transaction", appliedPayload.transaction.transactionId],
  );
  assertSuccessfulConstructor(rolledBack, "rollback de upgrade");
  assert.equal(
    (await readJson(path.join(target, "package.json")))
      .devDependencies["create-project-engineering-os"],
    previousVersion,
  );
  assert.equal((await readJson(path.join(target, stateRelative))).packageVersion, previousVersion);
  assert.deepEqual(await targetHashes(target, debtTargets), debtBefore);
});

test("upgrade reanuda un fallo parcial sin tocar deuda", { timeout: 120_000 }, async () => {
  const target = await cloneBaseline("upgrade-resume");
  await setInstalledRelease(target, "0.0.9");
  const debtTargets = [
    ".project-os/debt/config.json",
    ".project-os/debt/registry.json",
  ];
  const debtBefore = await targetHashes(target, debtTargets);

  const interrupted = await runInstalled(
    target,
    "upgrade",
    ["--apply", "--inject-failure-after", "1"],
  );
  const interruptedPayload = parseJson(interrupted, "upgrade interrumpido");
  assert.equal(interrupted.exitCode, 3);
  assert.equal(interruptedPayload.code, "INJECTED_FAILURE");

  const resumed = await runInstalled(target, "upgrade", ["--apply"]);
  const resumedPayload = parseJson(resumed, "upgrade reanudado");
  assertSuccessfulConstructor(resumed, "upgrade reanudado");
  assert.equal(resumedPayload.status, "APPLIED");
  assert.equal(resumedPayload.transaction.resumed, true);
  assert.deepEqual(await targetHashes(target, debtTargets), debtBefore);

  const check = await runInstalled(target, "upgrade", ["--check"]);
  assertSuccessfulConstructor(check, "upgrade tras reanudación");
  assert.equal(parseJson(check, "upgrade tras reanudación").status, "IN_SYNC");
});

test("upgrade rechaza colisiones y estados futuros antes de escribir", { timeout: 120_000 }, async () => {
  const collisionTarget = await cloneBaseline("upgrade-collision");
  await setInstalledRelease(collisionTarget, "0.0.9");
  const packagePath = path.join(collisionTarget, "package.json");
  const manifest = await readJson(packagePath);
  manifest.devDependencies["create-project-engineering-os"] = "9.9.9";
  await writeFile(packagePath, `${JSON.stringify(manifest, null, 2)}\n`);
  const beforeCollision = await exactSnapshot(collisionTarget);

  const collision = await runInstalled(collisionTarget, "upgrade", ["--apply"]);
  const collisionPayload = parseJson(collision, "upgrade con colisión");
  assert.equal(collision.exitCode, 2);
  assert.equal(collisionPayload.code, "UPGRADE_DEPENDENCY_COLLISION");
  assert.deepEqual(await exactSnapshot(collisionTarget), beforeCollision);

  const futureTarget = await cloneBaseline("upgrade-future");
  const futureStatePath = path.join(futureTarget, stateRelative);
  const futureState = await readJson(futureStatePath);
  futureState.stateFormatVersion = 999;
  await writeFile(futureStatePath, `${JSON.stringify(futureState, null, 2)}\n`);
  const beforeFuture = await exactSnapshot(futureTarget);

  const future = await runInstalled(futureTarget, "upgrade", ["--check"]);
  const futurePayload = parseJson(future, "upgrade con estado futuro");
  assert.equal(future.exitCode, 2);
  assert.equal(futurePayload.code, "STATE_FROM_FUTURE");
  assert.deepEqual(await exactSnapshot(futureTarget), beforeFuture);
});

test("el bootstrap normaliza a LF todos los artefactos de texto instalados", async () => {
  const textExtensions = new Set([
    "",
    ".cjs",
    ".css",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mdc",
    ".mjs",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
  ]);
  const violations = [];

  async function inspect(relative = "") {
    const absolute = path.join(baselineRoot, relative);
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries) {
      if (relative === "" && entry.name === ".git") {
        continue;
      }
      const child = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        await inspect(child);
      } else if (entry.isFile()) {
        const extension = path.extname(entry.name).toLowerCase();
        if (textExtensions.has(extension) && (await readFile(path.join(baselineRoot, child))).includes(13)) {
          violations.push(child.split(path.sep).join("/"));
        }
      }
    }
  }

  await inspect();
  assert.deepEqual(violations, []);
});

test("estado futuro se rechaza sin mutación y estado antiguo compatible migra a la versión vigente", { timeout: 120_000 }, async () => {
  const futureTarget = await cloneBaseline("state-future");
  const futureStatePath = path.join(futureTarget, stateRelative);
  const futureState = JSON.parse(await readFile(futureStatePath, "utf8"));
  futureState.stateFormatVersion = 999;
  await writeFile(futureStatePath, `${JSON.stringify(futureState, null, 2)}\n`);
  const beforeFutureCheck = await exactSnapshot(futureTarget);

  const futureResponse = await runInstalled(futureTarget, "sync", ["--check"]);
  const futurePayload = parseJson(futureResponse, "estado futuro");
  assert.equal(futureResponse.exitCode, 2);
  assert.equal(futurePayload.code, "STATE_FROM_FUTURE");
  assert.deepEqual(await exactSnapshot(futureTarget), beforeFutureCheck);

  const legacyTarget = await cloneBaseline("state-compatible-legacy");
  const legacyStatePath = path.join(legacyTarget, stateRelative);
  const legacyState = JSON.parse(await readFile(legacyStatePath, "utf8"));
  legacyState.stateFormatVersion = 0;
  await writeFile(legacyStatePath, `${JSON.stringify(legacyState, null, 2)}\n`);

  const migration = await runInstalled(legacyTarget, "sync");
  const migrationPayload = parseJson(migration, "migración compatible");
  assertSuccessfulConstructor(migration, "migración compatible");
  assert.equal(migrationPayload.status, "APPLIED");
  assert.equal(JSON.parse(await readFile(legacyStatePath, "utf8")).stateFormatVersion, 2);
  const check = await runInstalled(legacyTarget, "sync", ["--check"]);
  assertSuccessfulConstructor(check, "check tras migración");
  assert.equal(parseJson(check, "check tras migración").plan.hasDrift, false);
});
