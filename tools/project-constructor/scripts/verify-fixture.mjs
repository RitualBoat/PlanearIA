import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyCommandOutput,
  classifyOpenSpecInitOutput,
  opsxAdaptInvariantFailures,
} from "../src/fixture-output.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}

const options = {
  json: args.includes("--json"),
  keep: args.includes("--keep"),
  skipInstall: args.includes("--skip-install"),
  evidence: valueAfter("--evidence"),
};

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function commandLine(command, commandArgs) {
  return [path.basename(command), ...commandArgs].join(" ");
}

function run(command, commandArgs, { cwd, timeoutMs = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(command, commandArgs, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Timeout: ${commandLine(command, commandArgs)}`));
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
      resolve({ exitCode, stdout, stderr });
    });
  });
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(
      path.dirname(path.dirname(process.execPath)),
      "lib",
      "node_modules",
      "npm",
      "bin",
      "npm-cli.js",
    ),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  throw new Error("No se pudo resolver npm-cli.js sin invocar un shell.");
}

async function snapshot(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const output = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (relative === "" && entry.name === ".git") continue;
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      Object.assign(output, await snapshot(root, child));
    } else {
      const normalized = child.split(path.sep).join("/");
      output[normalized] = sha256(await readFile(path.join(root, child)));
    }
  }
  return output;
}

async function parseJsonOutput(response, label) {
  if (response.exitCode !== 0) {
    throw new Error(`${label} terminó con ${response.exitCode}: ${response.stderr || response.stdout}`);
  }
  if (response.stderr !== "") {
    throw new Error(`${label} escribió stderr inesperado: ${response.stderr}`);
  }
  try {
    return JSON.parse(response.stdout);
  } catch {
    throw new Error(`${label} no produjo JSON válido: ${response.stdout}`);
  }
}

function compactCommandPayload(payload, { includeOperationTargets = false } = {}) {
  if (!payload?.plan || typeof payload.plan !== "object") return payload;
  const { operations = [], ...plan } = payload.plan;
  return {
    ...payload,
    plan: {
      ...plan,
      operationCount: operations.length,
      ...(includeOperationTargets
        ? {
            operations: operations.map((operation) => ({
              operation: operation.operation,
              owner: operation.owner,
              target: operation.target,
            })),
          }
        : {}),
    },
  };
}

async function assertHarnessFiles(target) {
  const expected = [
    "AGENTS.md",
    "CLAUDE.md",
    ".cursor/rules/project-os.mdc",
    ".codex/config.toml",
    ".github/copilot-instructions.md",
    "OPENCODE.md",
  ];
  const missing = [];
  for (const relative of expected) {
    if (!(await exists(path.join(target, relative)))) missing.push(relative);
  }
  if (missing.length > 0) {
    throw new Error(`Faltan espejos de harness: ${missing.join(", ")}`);
  }
  return expected;
}

async function assertDiscoveryPackage(target) {
  const relative = ".project-os/github/discovery-issues.json";
  const payload = JSON.parse(await readFile(path.join(target, relative), "utf8"));
  const issues = Array.isArray(payload) ? payload : payload.issues;
  if (!Array.isArray(issues) || issues.length !== 10) {
    throw new Error(`El paquete discovery debe contener 10 issues; contiene ${issues?.length ?? 0}.`);
  }
  const required = [
    "title",
    "story",
    "observableCriteria",
    "dependencies",
    "owner",
    "evidence",
    "state",
  ];
  for (const [index, issue] of issues.entries()) {
    const missing = required.filter((field) => !(field in issue));
    if (missing.length > 0) {
      throw new Error(`Discovery issue ${index + 1} omite: ${missing.join(", ")}`);
    }
  }
  return { relative, count: issues.length };
}

async function assertNeutrality(target) {
  const forbidden = [
    /\bPlanearIA\b/i,
    /\bdocente(?:s)?\b/i,
    /\buserId\b/,
    /\bsrc\/sync\b/i,
    /@planearia:/i,
  ];
  const files = await snapshot(target);
  const violations = [];
  for (const relative of Object.keys(files)) {
    if (relative.startsWith(".git/") || relative.includes("node_modules/")) continue;
    const content = await readFile(path.join(target, relative), "utf8").catch(() => "");
    if (forbidden.some((pattern) => pattern.test(content))) {
      violations.push(relative);
    }
  }
  if (violations.length > 0) {
    throw new Error(`El núcleo contiene decisiones/nombres heredados: ${violations.sort().join(", ")}`);
  }
  const packageJson = JSON.parse(await readFile(path.join(target, "package.json"), "utf8"));
  const allDependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };
  const unexpected = Object.keys(allDependencies).filter(
    (name) => name !== "@fission-ai/openspec",
  );
  if (unexpected.length > 0) {
    throw new Error(`Dependencias no universales instaladas: ${unexpected.join(", ")}`);
  }
  return { forbiddenPatterns: forbidden.length, productDependencies: unexpected.length };
}

function markdownLinks(content) {
  const links = [];
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of content.matchAll(pattern)) {
    const href = match[1].split("#")[0];
    if (href && !/^[a-z]+:/i.test(href) && !href.startsWith("#")) {
      links.push(href);
    }
  }
  return links;
}

async function reachableWithin(target, start, maximumHops) {
  const seen = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    const hops = seen.get(current);
    if (hops >= maximumHops) continue;
    const content = await readFile(path.join(target, current), "utf8").catch(() => "");
    for (const href of markdownLinks(content)) {
      const resolved = path
        .normalize(path.join(path.dirname(current), decodeURI(href)))
        .split(path.sep)
        .join("/");
      if (resolved.startsWith("../") || seen.has(resolved)) continue;
      if (await exists(path.join(target, resolved))) {
        seen.set(resolved, hops + 1);
        queue.push(resolved);
      }
    }
  }
  return seen;
}

async function assertFindability(target) {
  const expected = [
    "docs/engineering/RUNBOOK_BOOTSTRAP.md",
    "docs/engineering/SOURCES_OF_TRUTH.md",
    "docs/engineering/SDD_WORKFLOW.md",
    "docs/engineering/EVIDENCE_PROFILES.md",
    "docs/engineering/TOOLS_POLICY.md",
    "docs/engineering/ROLLBACK.md",
    "docs/engineering/PROMPT_00_BOOTSTRAP_ENTORNO.md",
    "docs/engineering/GUIA_MANUAL_USUARIO.md",
  ];
  const fromReadme = await reachableWithin(target, "README.md", 2);
  const fromAgents = await reachableWithin(target, "AGENTS.md", 2);
  const missing = expected.filter((relative) => !fromReadme.has(relative) && !fromAgents.has(relative));
  if (missing.length > 0) {
    throw new Error(`Documentación no encontrable en <=2 saltos: ${missing.join(", ")}`);
  }
  return { expected: expected.length, missing: 0 };
}

async function writeEvidence(evidencePath, payload) {
  if (!evidencePath) return;
  const absolute = path.resolve(evidencePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(payload, null, 2)}\n`);
}

async function main() {
  const target = await mkdtemp(path.join(tmpdir(), "project-constructor-empty-"));
  const artifactRoot = await mkdtemp(path.join(tmpdir(), "project-constructor-package-"));
  const runnerRoot = await mkdtemp(path.join(tmpdir(), "project-constructor-runner-"));
  const npmCli = await resolveNpmCli();
  const npmCommand = process.execPath;
  const npmArgs = (values) => [npmCli, ...values];
  const commands = [];
  const checks = {};
  let result = "FAIL";
  let failure = null;
  try {
    const git = await run("git", ["init", "--quiet"], { cwd: target });
    commands.push({ id: "git-init", exitCode: git.exitCode });
    if (git.exitCode !== 0) throw new Error(`git init falló: ${git.stderr}`);
    const targetEntries = (await readdir(target))
      .filter((entry) => entry !== ".git")
      .sort();
    if (targetEntries.length > 0) {
      throw new Error(`La fixture no estaba vacía antes del bootstrap: ${targetEntries.join(", ")}`);
    }
    checks.targetBeforeBootstrap = { nonGitEntries: targetEntries };

    const packed = await run(
      npmCommand,
      npmArgs(["pack", "--json", "--pack-destination", artifactRoot]),
      { cwd: packageRoot, timeoutMs: 180_000 },
    );
    commands.push({ id: "npm-pack", exitCode: packed.exitCode });
    const packPayload = await parseJsonOutput(packed, "npm pack");
    if (!Array.isArray(packPayload) || packPayload.length !== 1 || !packPayload[0]?.filename) {
      throw new Error("npm pack no devolvió un único artefacto identificable.");
    }
    const tarballPath = path.join(artifactRoot, packPayload[0].filename);
    const tarball = await readFile(tarballPath);
    checks.packageArtifact = {
      bytes: tarball.byteLength,
      filename: packPayload[0].filename,
      sha256: sha256(tarball),
    };

    const installRunner = await run(
      npmCommand,
      npmArgs([
        "install",
        "--prefix",
        runnerRoot,
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        tarballPath,
      ]),
      { cwd: runnerRoot, timeoutMs: 180_000 },
    );
    commands.push({ id: "install-packed-runner", exitCode: installRunner.exitCode });
    checks.packedRunnerInstall = classifyCommandOutput(installRunner);
    if (installRunner.exitCode !== 0) {
      throw new Error(
        `La instalación temporal del tarball falló: ${installRunner.stderr || installRunner.stdout}`,
      );
    }
    if (
      checks.packedRunnerInstall.warnings.length > 0
      || checks.packedRunnerInstall.stderrLines > 0
    ) {
      throw new Error(
        `La instalación temporal produjo salida inesperada: ${
          checks.packedRunnerInstall.warnings.join(" | ") || installRunner.stderr
        }`,
      );
    }
    const packageName = packPayload[0].name ?? "project-engineering-os-constructor";
    const runnerCliPath = path.join(
      runnerRoot,
      "node_modules",
      ...packageName.split("/"),
      "bin",
      "project-constructor.mjs",
    );
    if (!(await exists(runnerCliPath))) {
      throw new Error("El tarball instalado no expuso el binario local esperado.");
    }
    checks.firstBootstrapRunner = {
      artifactSha256: checks.packageArtifact.sha256,
      source: "temporary-runner-from-verified-tarball",
    };

    const bootstrapArgs = [
      runnerCliPath,
      "bootstrap",
      "--target",
      target,
      "--json",
    ];
    const first = await run(process.execPath, bootstrapArgs, {
      cwd: target,
      timeoutMs: 180_000,
    });
    commands.push({ id: "bootstrap-from-packed-tarball", exitCode: first.exitCode });
    checks.firstBootstrap = compactCommandPayload(
      await parseJsonOutput(first, "Primer bootstrap desde tarball"),
    );
    const installedCliPath = path.join(
      target,
      ".project-constructor",
      "runtime",
      "bin",
      "project-constructor.mjs",
    );
    if (!(await exists(installedCliPath))) {
      throw new Error("El bootstrap no instaló el runtime autocontenido.");
    }
    const installedCliRelative = path.relative(target, installedCliPath);
    if (
      path.isAbsolute(installedCliRelative)
      || installedCliRelative === ".."
      || installedCliRelative.startsWith(`..${path.sep}`)
    ) {
      throw new Error("El entrypoint autocontenido quedó fuera del repositorio target.");
    }
    checks.installedRuntime = {
      entrypoint: installedCliRelative.split(path.sep).join("/"),
      path: ".project-constructor/runtime",
      exists: true,
      executionContract: "explicit-target-local-path",
    };

    const firstSnapshot = await snapshot(target);
    const installedBootstrapArgs = [
      installedCliPath,
      "bootstrap",
      "--target",
      target,
      "--json",
    ];
    const second = await run(process.execPath, installedBootstrapArgs, { cwd: target });
    commands.push({ id: "bootstrap-second", exitCode: second.exitCode });
    checks.secondBootstrap = compactCommandPayload(
      await parseJsonOutput(second, "Segundo bootstrap"),
    );
    const secondSnapshot = await snapshot(target);
    if (JSON.stringify(firstSnapshot) !== JSON.stringify(secondSnapshot)) {
      throw new Error("El segundo bootstrap modificó la fixture.");
    }
    checks.idempotence = { changedFiles: 0 };

    const syncCheck = await run(
      process.execPath,
      [installedCliPath, "sync", "--target", target, "--check", "--json"],
      { cwd: target },
    );
    commands.push({ id: "sync-check", exitCode: syncCheck.exitCode });
    checks.sync = compactCommandPayload(
      await parseJsonOutput(syncCheck, "sync --check"),
    );

    checks.harnesses = await assertHarnessFiles(target);
    checks.discovery = await assertDiscoveryPackage(target);
    checks.neutrality = await assertNeutrality(target);
    checks.findability = await assertFindability(target);

    if (!options.skipInstall) {
      const install = await run(
        npmCommand,
        npmArgs(["ci", "--ignore-scripts", "--no-audit", "--no-fund"]),
        { cwd: target, timeoutMs: 180_000 },
      );
      commands.push({ id: "npm-ci", exitCode: install.exitCode });
      checks.npmCi = classifyCommandOutput(install);
      if (install.exitCode !== 0) {
        throw new Error(`npm ci de la fixture falló: ${install.stderr || install.stdout}`);
      }
      if (checks.npmCi.warnings.length > 0 || checks.npmCi.stderrLines > 0) {
        throw new Error(
          `npm ci produjo salida inesperada: ${checks.npmCi.warnings.join(" | ") || install.stderr}`,
        );
      }

      const openspecInit = await run(
        npmCommand,
        npmArgs([
          "exec",
          "--yes=false",
          "--",
          "openspec",
          "init",
          "--tools",
          "codex,claude,cursor,github-copilot,opencode",
        ]),
        { cwd: target, timeoutMs: 180_000 },
      );
      commands.push({ id: "openspec-init-local", exitCode: openspecInit.exitCode });
      checks.openspecInit = classifyOpenSpecInitOutput(openspecInit);
      if (openspecInit.exitCode !== 0) {
        throw new Error(
          `OpenSpec init local falló: ${openspecInit.stderr || openspecInit.stdout}`,
        );
      }
      if (
        checks.openspecInit.warnings.length > 0
        || !checks.openspecInit.expectedProgress
      ) {
        throw new Error(
          `OpenSpec init produjo salida inesperada: ${
            checks.openspecInit.warnings.join(" | ")
            || checks.openspecInit.unexpectedStderr.join(" | ")
            || checks.openspecInit.missingSignals.join(" | ")
          }`,
        );
      }

      const opsxAdapt = await run(
        process.execPath,
        [installedCliPath, "opsx-adapt", "--target", target, "--json"],
        { cwd: target },
      );
      commands.push({ id: "opsx-adapt", exitCode: opsxAdapt.exitCode });
      const opsxAdaptPayload = await parseJsonOutput(opsxAdapt, "opsx-adapt");
      checks.opsxAdapt = compactCommandPayload(opsxAdaptPayload, {
        includeOperationTargets: true,
      });
      const opsxAdaptFailures = opsxAdaptInvariantFailures(opsxAdaptPayload);
      if (opsxAdaptFailures.length > 0) {
        throw new Error(`opsx-adapt incumplió sus invariantes: ${opsxAdaptFailures.join("; ")}.`);
      }

      const beforeOpsxCheck = await snapshot(target);
      const opsxCheck = await run(
        process.execPath,
        [installedCliPath, "opsx-check", "--target", target, "--json"],
        { cwd: target },
      );
      commands.push({ id: "opsx-check", exitCode: opsxCheck.exitCode });
      checks.opsxCheck = await parseJsonOutput(opsxCheck, "opsx-check");
      if (
        checks.opsxCheck.status !== "PASS"
        || checks.opsxCheck.mutationPerformed !== false
        || checks.opsxCheck.checks?.some((entry) => entry.status === "FAIL")
      ) {
        throw new Error(`opsx-check contiene FAIL: ${opsxCheck.stdout}`);
      }
      if (JSON.stringify(await snapshot(target)) !== JSON.stringify(beforeOpsxCheck)) {
        throw new Error("opsx-check modificó la fixture.");
      }

      const doctor = await run(
        process.execPath,
        [installedCliPath, "doctor", "--target", target, "--json"],
        { cwd: target },
      );
      commands.push({ id: "doctor-json", exitCode: doctor.exitCode });
      checks.doctor = JSON.parse(doctor.stdout);
      if (checks.doctor.counts?.FAIL > 0 || doctor.exitCode !== 0) {
        throw new Error(`Doctor de fixture contiene FAIL: ${doctor.stdout}`);
      }
    } else {
      checks.doctor = { skipped: true, cause: "--skip-install" };
    }
    result = "PASS";
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }

  const evidence = {
    schemaVersion: "1.0.0",
    result,
    fixture: "empty-git-repository",
    commands,
    checks,
    failure,
  };
  await writeEvidence(options.evidence, evidence);
  if (options.json) {
    process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
  } else if (result === "PASS") {
    process.stdout.write("PASS project-constructor empty repository fixture\n");
  } else {
    process.stderr.write(`FAIL project-constructor fixture: ${failure}\n`);
  }
  if (options.keep) {
    process.stderr.write(`Fixture conservada en ${target}\n`);
  } else {
    await rm(target, { recursive: true, force: true });
  }
  await rm(artifactRoot, { recursive: true, force: true });
  await rm(runnerRoot, { recursive: true, force: true });
  process.exitCode = result === "PASS" ? 0 : 1;
}

await main();
