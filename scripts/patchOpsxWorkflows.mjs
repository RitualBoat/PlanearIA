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
  // Cursor y opencode reciben ademas una copia bajo skills/. Quedaron fuera de esta lista desde el
  // inicio, asi que conservaban tanto la CLI global como la ruta de archive rota: un agente en esos
  // harnesses leia instrucciones que el resto ya no tiene.
  ".cursor/skills",
  ".opencode/commands",
  ".opencode/skills",
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
// Dos defectos de la plantilla upstream de archive, ambos verificados contra el CLI fijado:
//
// 1. Ofrecer "Sync now (recommended)" antes de archivar garantiza el aborto posterior: la CLI aplica las
//    mismas deltas durante el archive y falla al reencontrar una requirement ADDED ya presente
//    (dist/core/specs-apply.js:229). El camino recomendado es el que rompe.
// 2. `mv` manual abandona el `moveDirectory` de la CLI (dist/core/archive.js:415), que es el unico con
//    degradacion a copy+remove ante el bloqueo de Windows sobre `specs/`.
const SYNC_PROMPT =
  /( *)- If changes needed: "Sync now \(recommended\)", "Archive without syncing"\r?\n *- If already synced: "Archive now", "Sync anyway", "Cancel"/g;
const CANONICAL_SYNC_PROMPT =
  '$1- Report the assessment only. Do NOT offer to sync before archiving: `npm run opsx:archive` classifies the sync state and picks the correct archive invocation.';
const MANUAL_MOVE = /mv "<changeRoot>" "<planningHome\.changesDir>\/archive\/YYYY-MM-DD-<name>"/g;
const CANONICAL_MOVE = "npm run opsx:archive -- <change-name>";
// La rama "si el usuario elige sincronizar" queda sin sujeto cuando la opcion desaparece del prompt, y
// el guardrail correspondiente seguiria autorizandola. Se neutralizan ambas para que el workflow no
// conserve una ruta que ya no se ofrece.
const SYNC_BRANCH = /If user chooses sync, use Task tool \([^)]*\)\. Proceed to archive regardless of choice\./g;
const CANONICAL_SYNC_BRANCH =
  "Do not sync here. `npm run opsx:archive` resolves the sync state and archives with or without applying deltas.";
const SYNC_GUARDRAIL =
  /- If sync is requested, use (?:the Skill tool to invoke `openspec-sync-specs`|openspec-sync-specs approach) \(agent-driven\)/g;
const CANONICAL_SYNC_GUARDRAIL =
  "- Do not sync main specs before archiving; the OpenSpec CLI is their only writer during archive";

const CLOSURE_START = "<!-- PLANEARIA_CLOSURE_WORKFLOW -->";
const CLOSURE_END = "<!-- /PLANEARIA_CLOSURE_WORKFLOW -->";
const TLDR_START = "<!-- PLANEARIA_TLDR_WORKFLOW -->";
const TLDR_END = "<!-- /PLANEARIA_TLDR_WORKFLOW -->";
const READINESS_START = "<!-- PLANEARIA_READINESS_WORKFLOW -->";
const READINESS_END = "<!-- /PLANEARIA_READINESS_WORKFLOW -->";

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

function readinessBlock(flow) {
  const instructions = {
    propose: "Before creating a change, run `npm run openspec:ready:propose -- --issue <n>`. It is read-only and checks the enriched issue, Project membership and pre-propose metadata. Resolve each FAIL or record only a valid, temporary exception; do not create the change when the gate fails. After proposal, design, specs, and tasks are ready, create `<changeRoot>/brownfield-baseline.md` with only the touched surfaces, current and target behavior, legacy compatibility, owner/context, evidence, and exclusions.",
    archive: "Before archive, run `npm run openspec:ready:archive -- --change <name> --run-local`. It is read-only and checks readiness.json, brownfield-baseline.md, completed tasks, proportional validation evidence, rollback and adversarial review. Resolve each FAIL or a valid, temporary exception before moving the change.",
  };
  return `${READINESS_START}\n\n### PlanearIA Definition of Ready and Done\n\n${instructions[flow]}\n\n${READINESS_END}`;
}

function normalizeReadiness(value, relativePath) {
  const flow = tldrFlow(relativePath);
  if (flow !== "propose" && flow !== "archive") return value;
  const block = readinessBlock(flow);
  const marker = new RegExp(`${READINESS_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${READINESS_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (marker.test(value)) return value.replace(marker, block);
  return `${value.replace(/\s*$/, "")}\n\n${block}\n`;
}

function closureBlock() {
  return [
    CLOSURE_START,
    "",
    "### PlanearIA canonical closure order",
    "",
    "Archive with `npm run opsx:archive -- <change-name>`; preview with `npm run opsx:archive:dry`. That command is the single owner of this step: it guards the branch, runs the archive readiness gate, classifies whether the delta specs are already applied, delegates the spec sync and the directory move to the OpenSpec CLI, and commits the result on the change branch.",
    "",
    "The OpenSpec CLI is the only writer of main specs during archive. Do not run `/opsx:sync` first for a change you are about to archive: the CLI applies the same deltas and aborts when an ADDED requirement already exists. Do not move the change directory by hand; the CLI move degrades safely on Windows and a manual `mv` does not.",
    "",
    "Rerunning the archive is safe: an already archived and committed change reports a no-op. Close the branch afterwards with `npm run opsx:finish`, which never pushes directly to the protected target.",
    "",
    CLOSURE_END,
  ].join("\n");
}

function normalizeClosure(value, relativePath) {
  if (tldrFlow(relativePath) !== "archive") return value;
  const block = closureBlock();
  const marker = new RegExp(`${CLOSURE_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${CLOSURE_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
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
  return normalizeClosure(normalizeReadiness(normalizeTldr(value
    .replace(ZOMBIE, CANONICAL_BLOCKED)
    .replace(SYNC_PROMPT, CANONICAL_SYNC_PROMPT)
    .replace(MANUAL_MOVE, CANONICAL_MOVE)
    .replace(SYNC_BRANCH, CANONICAL_SYNC_BRANCH)
    .replace(SYNC_GUARDRAIL, CANONICAL_SYNC_GUARDRAIL)
    .replace(UNGUARDED_ALLOWED_TOOLS, `allowed-tools: Bash(${LOCAL_CLI}:*)`)
    .replace(GLOBAL_ALLOWED_TOOLS, `allowed-tools: Bash(${LOCAL_CLI}:*)`)
    .replace(UNGUARDED_LOCAL_CLI, `${LOCAL_CLI} `)
    .replace(BARE_CLI, `${LOCAL_CLI} `), relativePath), relativePath), relativePath);
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
  if (hasMatch(SYNC_PROMPT, raw)) reasons.push("recomienda sincronizar specs antes de archivar");
  if (hasMatch(MANUAL_MOVE, raw)) reasons.push("prescribe mv manual del directorio del change");
  if (hasMatch(SYNC_BRANCH, raw)) reasons.push("conserva la rama de sincronizacion previa al archive");
  if (hasMatch(SYNC_GUARDRAIL, raw)) reasons.push("autoriza sincronizar specs antes de archivar");
  const flow = tldrFlow(relativePath);
  if (flow && !raw.replace(/\r\n/g, "\n").includes(tldrBlock(flow))) reasons.push(`guia TLDR de ${flow} ausente o desactualizada`);
  if ((flow === "propose" || flow === "archive") && !raw.replace(/\r\n/g, "\n").includes(readinessBlock(flow))) reasons.push(`guia readiness de ${flow} ausente o desactualizada`);
  if (flow === "archive" && !raw.replace(/\r\n/g, "\n").includes(closureBlock())) reasons.push("guia de orden canonico de cierre ausente o desactualizada");
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
