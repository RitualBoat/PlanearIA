#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const CHECK_SCRIPT = path.join(ROOT, "scripts", "checkOpenSpecCli.mjs");
const fixture = mkdtempSync(path.join(tmpdir(), "planearia-openspec-check-"));

function run(cwd) {
  return spawnSync(process.execPath, [CHECK_SCRIPT], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CI: "true", NO_COLOR: "1" },
  });
}

try {
  const success = run(ROOT);
  assert.equal(success.status, 0, success.stderr || success.stdout);
  assert.match(success.stdout, /openspec-check: OK \(CLI 1\.6\.0,/);

  const installedDir = path.join(fixture, "node_modules", "@fission-ai", "openspec");
  mkdirSync(installedDir, { recursive: true });
  writeFileSync(
    path.join(fixture, "package.json"),
    JSON.stringify({ devDependencies: { "@fission-ai/openspec": "1.6.0" } }),
  );
  writeFileSync(
    path.join(installedDir, "package.json"),
    JSON.stringify({ name: "@fission-ai/openspec", version: "1.5.0", engines: { node: ">=20.19.0" } }),
  );

  const mismatch = run(fixture);
  assert.equal(mismatch.status, 1, mismatch.stderr || mismatch.stdout);
  assert.match(mismatch.stderr, /version declarada 1\.6\.0 != instalada 1\.5\.0/);
  assert.match(mismatch.stderr, /recovery - Ejecuta npm ci/);

  console.log("openspec-check-tests: PASS (success + version mismatch recovery)");
} finally {
  const resolvedFixture = path.resolve(fixture);
  const resolvedTemp = path.resolve(tmpdir());
  if (!resolvedFixture.startsWith(`${resolvedTemp}${path.sep}`)) {
    throw new Error(`Refusing to remove unexpected fixture path: ${resolvedFixture}`);
  }
  rmSync(resolvedFixture, { recursive: true, force: true });
}
