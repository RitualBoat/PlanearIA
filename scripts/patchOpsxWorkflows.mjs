#!/usr/bin/env node

// Normalizacion post-`openspec update`: las plantillas upstream todavia asumen un binario global
// y sugieren un comando continue inexistente cuando apply queda bloqueado. Este parche mantiene
// todos los workflows sobre la CLI local fijada por package-lock.json y elimina la ruta zombi.
// Es idempotente y debe ejecutarse despues de cada update del generador.
//
// Usage: node scripts/patchOpsxWorkflows.mjs [--check]
//   (default)  normaliza las referencias en su lugar
//   --check    exit 1 si queda una referencia global o zombi (no modifica archivos)

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");

const DIRS = [
  ".agents/skills",
  ".claude/commands/opsx",
  ".claude/skills",
  ".codex/skills",
  ".cursor/commands",
  ".opencode/commands",
  ".github/prompts",
];

const CANONICAL_BLOCKED =
  "show the list of missing artifacts, open a follow-up issue to track them, and pause the apply";
const LOCAL_CLI = "npm exec --yes=false -- openspec";
const ZOMBIE = /show message, suggest using (?:`\/opsx[:-]continue`|openspec-continue-change)/g;
const UNGUARDED_LOCAL_CLI = /npm exec -- openspec /g;
const BARE_CLI =
  /(?<!npm exec --yes=false -- )\bopenspec (?=(?:--version|archive|config|context|doctor|instructions|list|new|show|status|store|update|validate)\b)/g;
const GLOBAL_ALLOWED_TOOLS = /allowed-tools: Bash\(openspec:\*\)/g;
const UNGUARDED_ALLOWED_TOOLS = /allowed-tools: Bash\(npm exec -- openspec:\*\)/g;

function walk(dir) {
  const absoluteDir = path.join(ROOT, dir);
  if (!existsSync(absoluteDir)) return [];

  const output = [];
  for (const entry of readdirSync(absoluteDir)) {
    const relativePath = path.join(dir, entry);
    const stat = statSync(path.join(ROOT, relativePath));
    if (stat.isDirectory()) output.push(...walk(relativePath));
    else if (entry.endsWith(".md")) output.push(relativePath);
  }
  return output;
}

function hasMatch(pattern, value) {
  pattern.lastIndex = 0;
  const found = pattern.test(value);
  pattern.lastIndex = 0;
  return found;
}

function normalize(value) {
  return value
    .replace(ZOMBIE, CANONICAL_BLOCKED)
    .replace(UNGUARDED_ALLOWED_TOOLS, `allowed-tools: Bash(${LOCAL_CLI}:*)`)
    .replace(GLOBAL_ALLOWED_TOOLS, `allowed-tools: Bash(${LOCAL_CLI}:*)`)
    .replace(UNGUARDED_LOCAL_CLI, `${LOCAL_CLI} `)
    .replace(BARE_CLI, `${LOCAL_CLI} `);
}

const files = DIRS.flatMap(walk);
const violations = [];
const patched = [];

for (const relativePath of files) {
  const absolutePath = path.join(ROOT, relativePath);
  const raw = readFileSync(absolutePath, "utf8");
  const reasons = [];
  if (hasMatch(ZOMBIE, raw)) reasons.push("comando continue inexistente");
  if (hasMatch(UNGUARDED_LOCAL_CLI, raw)) reasons.push("npm exec permite fallback externo");
  if (hasMatch(BARE_CLI, raw)) reasons.push("CLI global no reproducible");
  if (hasMatch(GLOBAL_ALLOWED_TOOLS, raw)) reasons.push("permiso ligado a CLI global");
  if (hasMatch(UNGUARDED_ALLOWED_TOOLS, raw)) reasons.push("permiso permite fallback externo");
  if (reasons.length === 0) continue;

  violations.push({ relativePath, reasons });
  if (!CHECK) {
    writeFileSync(absolutePath, normalize(raw));
    patched.push(relativePath);
  }
}

if (CHECK) {
  if (violations.length > 0) {
    console.error(`patchOpsxWorkflows: ${violations.length} file(s) requieren normalizacion:`);
    for (const item of violations) console.error(`  - ${item.relativePath}: ${item.reasons.join(", ")}`);
    process.exit(1);
  }
  console.log("patchOpsxWorkflows: OK (CLI local y sin comandos zombi)");
  process.exit(0);
}

console.log(
  patched.length === 0
    ? "patchOpsxWorkflows: nothing to patch"
    : `patchOpsxWorkflows: patched ${patched.length} file(s)`,
);
for (const relativePath of patched) console.log(`  - ${relativePath}`);
