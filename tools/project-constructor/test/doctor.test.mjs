import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { collectDoctorReport, doctorInternals, runDoctor } from "../src/doctor.mjs";
import { createReport, formatHuman, formatJson, result } from "../src/report.mjs";

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function write(root, relative, content) {
  const absolute = path.join(root, relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
}

async function json(root, relative, value) {
  await write(root, relative, `${JSON.stringify(value, null, 2)}\n`);
}

async function snapshot(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const output = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      Object.assign(output, await snapshot(root, child));
    } else {
      output[child.split(path.sep).join("/")] = hash(await readFile(path.join(root, child)));
    }
  }
  return output;
}

function healthyRunner(calls = []) {
  return async (_spec, { id }) => {
    calls.push(id);
    const outputs = {
      nodeVersion: "v22.22.0\n",
      npmVersion: "10.9.2\n",
      gitRoot: "true\n",
      gitStatus: "",
      ghVersion: "gh version 2.75.0\n",
      gitVersion: "git version 2.50.0\n",
    };
    return { ok: true, exitCode: 0, stdout: outputs[id] ?? "", stderr: "", timedOut: false };
  };
}

async function healthyParity() {
  return {
    exitCode: 0,
    plan: {
      hasDrift: false,
      summary: {
        conflicts: 0,
        creates: 0,
        deletes: 0,
        preserves: 1,
        stateUpdate: false,
        updates: 0,
      },
    },
  };
}

async function createHealthyFixture(t, { graphify = false, literalSecret = false } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "project-constructor-doctor-"));
  t.after(async () => {
    await rm(root, { force: true, recursive: true });
  });
  await mkdir(path.join(root, ".git"), { recursive: true });
  await json(root, "package.json", {
    name: "fixture-project",
    private: true,
    devDependencies: { "@fission-ai/openspec": "1.6.0" },
  });
  await json(root, "package-lock.json", {
    name: "fixture-project",
    lockfileVersion: 3,
    packages: {
      "": { name: "fixture-project", devDependencies: { "@fission-ai/openspec": "1.6.0" } },
      "node_modules/@fission-ai/openspec": { version: "1.6.0" },
    },
  });
  await json(root, "node_modules/@fission-ai/openspec/package.json", {
    name: "@fission-ai/openspec",
    version: "1.6.0",
  });
  const agents = "# Universal agent guide\n";
  await write(root, "AGENTS.md", agents);
  await json(root, ".project-constructor/state.json", {
    schemaVersion: "1.0.0",
    files: [{ target: "AGENTS.md", owner: "constructor", hash: hash(agents) }],
  });
  await json(root, ".project-constructor/config.json", {
    activeProfiles: ["documentation", "harness-tooling"],
    codeIndexable: false,
    requiredEnvironmentVariables: [],
  });
  await json(root, ".project-os/profiles.json", {
    active: ["documentation", "harness-tooling"],
    profiles: [],
  });
  await json(root, ".project-os/mcp.json", {
    servers: [
      {
        id: graphify ? "graphify" : "context-docs",
        active: true,
        command: "connector",
        token: literalSecret ? "ghp_1234567890abcdefghijklmnop" : "${CONTEXT_DOCS_TOKEN}",
      },
    ],
  });
  await json(root, ".project-os/github/product-os.json", {
    labels: [],
    fields: [],
    statuses: [],
  });
  await write(root, ".github/workflows/project-constructor.yml", "name: Project Constructor\n");
  return root;
}

test("doctor sano no produce FAIL y conserva señales no demostradas como SKIP/WARN", async (t) => {
  const root = await createHealthyFixture(t);
  const calls = [];
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(calls),
    parityChecker: healthyParity,
    env: {},
  });

  assert.equal(report.verdict, "PASS");
  assert.equal(report.counts.FAIL, 0);
  assert.equal(report.results.find((entry) => entry.id === "mcp.configuration").status, "PASS");
  assert.equal(report.results.find((entry) => entry.id === "mcp.startup").status, "SKIP");
  assert.equal(report.results.find((entry) => entry.id === "github.project").status, "WARN");
  assert.equal(report.results.find((entry) => entry.id === "code-intelligence.graphify").status, "SKIP");
  assert.deepEqual(calls, ["nodeVersion", "npmVersion", "gitRoot", "gitStatus", "ghVersion"]);
});

test("salida humana y JSON derivan del mismo reporte", async (t) => {
  const root = await createHealthyFixture(t);
  const runner = healthyRunner();
  const human = await runDoctor({
    target: root,
    runner,
    parityChecker: healthyParity,
    json: false,
    env: {},
  });
  const machine = await runDoctor({
    target: root,
    runner,
    parityChecker: healthyParity,
    json: true,
    env: {},
  });
  const parsed = JSON.parse(machine.output);

  assert.equal(human.exitCode, machine.exitCode);
  assert.deepEqual(
    human.report.results.map(({ id, status, cause, remediation }) => ({ id, status, cause, remediation })),
    parsed.results.map(({ id, status, cause, remediation }) => ({ id, status, cause, remediation })),
  );
  assert.match(human.output, /Veredicto: PASS/);
});

test("doctor es read-only sobre la fixture", async (t) => {
  const root = await createHealthyFixture(t);
  const before = await snapshot(root);
  await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const after = await snapshot(root);
  assert.deepEqual(after, before);
});

test("Graphify activo falla MCP pero su check retirado permanece SKIP", async (t) => {
  const root = await createHealthyFixture(t, { graphify: true });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  assert.equal(report.verdict, "FAIL");
  assert.equal(report.results.find((entry) => entry.id === "mcp.configuration").status, "FAIL");
  assert.equal(report.results.find((entry) => entry.id === "code-intelligence.graphify").status, "SKIP");
});

test("un MCP opcional con enabled=false no se cuenta como activo", async (t) => {
  const root = await createHealthyFixture(t);
  await json(root, ".project-os/mcp.json", {
    servers: [
      {
        id: "graphify",
        enabled: false,
        command: "graphify",
      },
    ],
  });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const mcp = report.results.find((entry) => entry.id === "mcp.configuration");
  assert.equal(mcp.status, "PASS");
  assert.deepEqual(mcp.evidence.servers, []);
});

test("credenciales literales fallan sin aparecer en salidas", async (t) => {
  const root = await createHealthyFixture(t, { literalSecret: true });
  const machine = await runDoctor({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    json: true,
    env: {},
  });
  const human = await runDoctor({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    json: false,
    env: {},
  });
  assert.equal(machine.report.results.find((entry) => entry.id === "mcp.configuration").status, "FAIL");
  assert.doesNotMatch(machine.output, /ghp_1234567890abcdefghijklmnop/);
  assert.doesNotMatch(human.output, /ghp_1234567890abcdefghijklmnop/);
});

test("doctor detecta journals incompletos leyendo el journal, no state.activeTransaction", async (t) => {
  const root = await createHealthyFixture(t);
  await json(root, ".project-constructor/transactions/tx-incomplete/journal.json", {
    id: "tx-incomplete",
    status: "applying",
  });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const transactions = report.results.find((entry) => entry.id === "constructor.transactions");
  assert.equal(transactions.status, "FAIL");
  assert.deepEqual(transactions.evidence.incompleteTransactionIds, ["tx-incomplete"]);
});

test("recibos GitHub/CI con hash distinto o expirados no producen falsos PASS", async (t) => {
  const root = await createHealthyFixture(t);
  const workflow = await readFile(
    path.join(root, ".github/workflows/project-constructor.yml"),
    "utf8",
  );
  await json(root, ".project-constructor/evidence/github-project.json", {
    schemaVersion: "1.0.0",
    status: "PASS",
    configHash: "0".repeat(64),
  });
  await json(root, ".project-constructor/evidence/ci-local.json", {
    schemaVersion: "1.0.0",
    status: "PASS",
    configHash: hash(workflow.replace(/\r\n?/g, "\n")),
    expiresAt: "2000-01-01T00:00:00.000Z",
  });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  assert.equal(report.results.find((entry) => entry.id === "github.project").status, "FAIL");
  assert.equal(report.results.find((entry) => entry.id === "ci.execution").status, "FAIL");
});

test("nombres de variables en secretEnvRefs no se clasifican como secretos literales", () => {
  assert.equal(
    doctorInternals.containsLiteralSecret({ secretEnvRefs: ["GITHUB_TOKEN", "OPTIONAL_API_KEY"] }),
    false,
  );
});

test("la política canónica de secretos no se confunde con una credencial", () => {
  assert.equal(
    doctorInternals.containsLiteralSecret({
      policy: { secrets: "environment-references-only" },
    }),
    false,
  );
});

test("una asignación sensible se detecta aunque aparezca en un campo descriptivo", () => {
  assert.equal(
    doctorInternals.containsLiteralSecret({
      notes: "diagnóstico accidental token=super-secreto",
    }),
    true,
  );
  assert.equal(
    doctorInternals.containsLiteralSecret({
      notes: "referencia permitida token=${SERVICE_TOKEN}",
    }),
    false,
  );
});

test("engine efectivo acepta 20.20/22.22 y rechaza 20.19/21/22.21", () => {
  assert.equal(doctorInternals.isSupportedNode("v20.20.0"), true);
  assert.equal(doctorInternals.isSupportedNode("20.19.9"), false);
  assert.equal(doctorInternals.isSupportedNode("21.9.0"), false);
  assert.equal(doctorInternals.isSupportedNode("22.21.0"), false);
  assert.equal(doctorInternals.isSupportedNode("22.22.0"), true);
  assert.equal(doctorInternals.isSupportedNode("26.4.0"), true);
});

test("estado desconocido se convierte en fallo interno, no WARN", () => {
  const report = createReport([
    {
      id: "probe.invalid",
      profile: "universal",
      status: "MAYBE",
      summary: "Resultado inválido",
      cause: "Probe defectuoso",
      remediation: "Corregir probe",
      evidence: {},
    },
  ]);
  assert.equal(report.verdict, "FAIL");
  assert.equal(report.results[0].status, "FAIL");
  assert.match(report.results[0].id, /^doctor\.internal\./);
});

test("reportes redactan secretos en evidencia humana y JSON", () => {
  const report = createReport([
    result({
      id: "probe.secret",
      status: "FAIL",
      summary: "Probe imprimió una credencial",
      cause: "Salida sensible",
      remediation: "Rota la credencial fuera del doctor.",
      evidence: { stdout: "Authorization: Bearer abc.def.ghi token=super-secreto" },
    }),
  ]);
  assert.doesNotMatch(formatHuman(report), /abc\.def\.ghi|super-secreto/);
  assert.doesNotMatch(formatJson(report), /abc\.def\.ghi|super-secreto/);
  assert.match(formatJson(report), /\[REDACTED\]/);
});

test("runner read-only aborta un proceso que excede timeout", { timeout: 3_000 }, async () => {
  const response = await doctorInternals.spawnReadOnly(
    {
      command: process.execPath,
      args: ["-e", "setTimeout(() => {}, 5000)"],
      timeoutMs: 30,
    },
    { cwd: process.cwd(), env: process.env },
  );
  assert.equal(response.ok, false);
  assert.equal(response.timedOut, true);
});
