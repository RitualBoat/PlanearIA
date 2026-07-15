#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export function findMissingTldrs(changesDir) {
  if (!existsSync(changesDir)) return [];

  return readdirSync(changesDir)
    .filter((entry) => entry !== "archive")
    .filter((entry) => statSync(path.join(changesDir, entry)).isDirectory())
    .map((changeName) => ({
      changeName,
      expectedPath: path.join(changesDir, changeName, "TLDR.md"),
    }))
    .filter(({ expectedPath }) => !existsSync(expectedPath));
}

export function formatFailure(missing) {
  const lines = ["openspec-tldr: FAIL - falta TLDR.md en changes activos:"];
  for (const { changeName, expectedPath } of missing) {
    lines.push(`  - ${changeName}: crea o mueve TLDR.md a ${expectedPath}`);
  }
  lines.push("openspec-tldr: el checker solo revisa presencia y ubicacion; no evalua contenido, estructura ni palabras.");
  return lines.join("\n");
}

export function run({ root = process.cwd() } = {}) {
  const changesDir = path.join(root, "openspec", "changes");
  const missing = findMissingTldrs(changesDir);
  return { changesDir, missing, ok: missing.length === 0 };
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/")}`) {
  const report = run();
  if (!report.ok) {
    console.error(formatFailure(report.missing));
    process.exitCode = 1;
  } else {
    console.log("openspec-tldr: OK (todos los changes activos tienen TLDR.md en su raiz)");
  }
}
