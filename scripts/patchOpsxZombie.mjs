#!/usr/bin/env node
// Post-`openspec update` patch: OpenSpec 1.5.0 templates emit a suggestion to a non-existent
// continue command (`/opsx:continue`, `/opsx-continue`, `openspec-continue-change`) in the apply
// workflow's `state: "blocked"` branch. Running `openspec update` regenerates the harness files and
// reintroduces it, so this patch strips it back out after every update. Idempotent.
//
// Reported upstream via `openspec feedback`. Remove this patch once OpenSpec fixes the templates.
//
// Usage: node scripts/patchOpsxZombie.mjs [--check]
//   (default)  rewrite offending lines in place
//   --check    exit 1 if any zombie reference remains (does not modify files)

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");

// Directories where the openspec CLI writes opsx workflow mirrors.
const DIRS = [
  ".claude/commands/opsx",
  ".claude/skills",
  ".codex/skills",
  ".cursor/commands",
  ".opencode/commands",
  ".github/prompts",
];

const CANONICAL = "show the list of missing artifacts, open a follow-up issue to track them, and pause the apply";
// Matches: show message, suggest using `/opsx:continue` | `/opsx-continue` | openspec-continue-change
const ZOMBIE = /show message, suggest using (?:`\/opsx[:-]continue`|openspec-continue-change)/g;

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!existsSync(abs)) return [];
  const out = [];
  for (const entry of readdirSync(abs)) {
    const rel = path.join(dir, entry);
    const st = statSync(path.join(ROOT, rel));
    if (st.isDirectory()) out.push(...walk(rel));
    else if (entry.endsWith(".md")) out.push(rel);
  }
  return out;
}

const files = DIRS.flatMap(walk);
let hits = 0;
const patched = [];

for (const rel of files) {
  const raw = readFileSync(path.join(ROOT, rel), "utf8");
  if (!ZOMBIE.test(raw)) continue;
  ZOMBIE.lastIndex = 0;
  hits++;
  if (!CHECK) {
    writeFileSync(path.join(ROOT, rel), raw.replace(ZOMBIE, CANONICAL));
    patched.push(rel);
  } else {
    patched.push(rel);
  }
}

if (CHECK) {
  if (hits) {
    console.error(`patchOpsxZombie: ${hits} file(s) still reference the zombie continue command:`);
    for (const rel of patched) console.error(`  - ${rel}`);
    process.exit(1);
  }
  console.log("patchOpsxZombie: OK (no zombie references)");
  process.exit(0);
}

console.log(hits === 0 ? "patchOpsxZombie: nothing to patch" : `patchOpsxZombie: patched ${hits} file(s)`);
for (const rel of patched) console.log(`  - ${rel}`);
process.exit(0);
