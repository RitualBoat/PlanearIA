#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { findMissingTldrs, formatFailure } from "./checkOpenSpecTldr.mjs";

const fixture = mkdtempSync(path.join(tmpdir(), "planearia-openspec-tldr-"));
const changesDir = path.join(fixture, "openspec", "changes");

try {
  const valid = path.join(changesDir, "valid-change");
  mkdirSync(valid, { recursive: true });
  writeFileSync(path.join(valid, "TLDR.md"), "contenido que el checker no debe interpretar");
  assert.deepEqual(findMissingTldrs(changesDir), []);

  const missing = path.join(changesDir, "missing-change");
  mkdirSync(missing, { recursive: true });
  const missingReport = findMissingTldrs(changesDir);
  assert.equal(missingReport.length, 1);
  assert.equal(missingReport[0].changeName, "missing-change");
  assert.match(formatFailure(missingReport), /crea o mueve TLDR\.md a/);

  const misplaced = path.join(changesDir, "misplaced-change");
  mkdirSync(path.join(misplaced, "notes"), { recursive: true });
  writeFileSync(path.join(misplaced, "notes", "TLDR.md"), "archivo fuera de la raiz");
  const misplacedReport = findMissingTldrs(changesDir);
  assert.equal(misplacedReport.length, 2);
  assert.ok(misplacedReport.some((item) => item.changeName === "misplaced-change"));

  mkdirSync(path.join(changesDir, "archive", "legacy-change"), { recursive: true });
  assert.equal(findMissingTldrs(changesDir).length, 2);
  console.log("openspec-tldr-tests: PASS (valid, missing, misplaced, archive ignored)");
} finally {
  const resolvedFixture = path.resolve(fixture);
  const resolvedTemp = path.resolve(tmpdir());
  if (!resolvedFixture.startsWith(`${resolvedTemp}${path.sep}`)) {
    throw new Error(`Refusing to remove unexpected fixture path: ${resolvedFixture}`);
  }
  rmSync(resolvedFixture, { recursive: true, force: true });
}
