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
const TLDR_START = "<!-- PLANEARIA_TLDR_WORKFLOW -->";
const TLDR_END = "<!-- /PLANEARIA_TLDR_WORKFLOW -->";

function tldrFlow(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/").toLowerCase();
  if (normalized.includes("source-command-opsx-")) return null;
  if (normalized.includes("openspec-propose") || normalized.includes("opsx-propose") || normalized.endsWith("/opsx/propose.md")) return "propose";
  if (normalized.includes("openspec-apply-change") || normalized.includes("opsx-apply") || normalized.endsWith("/opsx/apply.md")) return "apply";
  if (normalized.includes("openspec-archive-change") || normalized.includes("opsx-archive") || normalized.endsWith("/opsx/archive.md")) return "archive";
  return null;
}

function tldrBlock(flow) {
  const instructions = {
    propose: "Create exactly one `TLDR.md` at the root of the change after proposal, design, specs, and tasks are ready. It must contain, in order, Proposal intention, Design approach, Spec expected behavior, Tasks practical plan, and `Resumen integral del change`. Each block and the final paragraph have at most 120 words in accessible Spanish with headings that explain the artifact's real function. A person reviews those qualities; automation checks only presence and location.",
    apply: "Read `<changeRoot>/TLDR.md` as supplementary context. Update it before completing affected work when implementation changes scope, affected files, behavior, or expected result; keep its five human-facing blocks. Do not add an automated quality or word-count gate.",
    archive: "Before moving the change, confirm `TLDR.md` remains at `<changeRoot>/TLDR.md` and reflects any material apply changes. Move it with the complete change directory; do not copy it elsewhere or automatically judge its wording, structure, or word count.",
  };
  return `${TLDR_START}\n\n### PlanearIA TLDR convention\n\n${instructions[flow]}\n\n${TLDR_END}`;
}

function normalizeTldr(value, relativePath) {
  const flow = tldrFlow(relativePath);
  if (!flow) return value;
  const block = tldrBlock(flow);
  const marker = new RegExp(`${TLDR_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${TLDR_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (marker.test(value)) return value.replace(marker, block);
  return `${value.replace(/\s*$/, "")}\n\n${block}\n`;
}

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

function normalize(value, relativePath) {
  return normalizeTldr(value
    .replace(ZOMBIE, CANONICAL_BLOCKED)
    .replace(UNGUARDED_ALLOWED_TOOLS, `allowed-tools: Bash(${LOCAL_CLI}:*)`)
    .replace(GLOBAL_ALLOWED_TOOLS, `allowed-tools: Bash(${LOCAL_CLI}:*)`)
    .replace(UNGUARDED_LOCAL_CLI, `${LOCAL_CLI} `)
    .replace(BARE_CLI, `${LOCAL_CLI} `), relativePath);
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
  const flow = tldrFlow(relativePath);
  if (flow && !raw.replace(/\r\n/g, "\n").includes(tldrBlock(flow))) reasons.push(`guia TLDR de ${flow} ausente o desactualizada`);
  if (reasons.length === 0) continue;

  violations.push({ relativePath, reasons });
  if (!CHECK) {
    writeFileSync(absolutePath, normalize(raw, relativePath));
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
