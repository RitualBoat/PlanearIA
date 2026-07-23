#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jestBin = path.join(ROOT, "node_modules", "jest", "bin", "jest.js");

// Node expone Web Storage como API experimental en algunos runtimes. `docx` la consulta al cargar
// dentro de Jest y activa un warning aunque la suite no usa ese storage. Desactivar solo esa API
// experimental conserva todos los warnings reales; Node antiguos siguen por la ruta normal.
const nodeArgs = process.allowedNodeEnvironmentFlags?.has("--no-experimental-webstorage")
  ? ["--no-experimental-webstorage"]
  : [];
const execution = spawnSync(process.execPath, [...nodeArgs, jestBin, ...process.argv.slice(2)], {
  cwd: ROOT,
  env: process.env,
  stdio: "inherit",
});

if (execution.error) {
  throw execution.error;
}

process.exitCode = execution.status ?? 1;
