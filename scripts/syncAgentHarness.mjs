#!/usr/bin/env node
// Single source of truth generator for PlanearIA agent/IDE harness config.
// Reads neutral sources under .agents/ (+ .mcp.json) and emits per-harness mirrors.
// Scope: PROJECT-OWNED files only (instructions, rules, MCP, permissions).
// The opsx workflows are owned by the openspec CLI (`openspec update`) + scripts/patchOpsxZombie.mjs,
// NOT by this generator. See openspec/changes/single-source-agent-harness/design.md (D6).
//
// Usage:
//   node scripts/syncAgentHarness.mjs --write   # regenerate mirrors (idempotent)
//   node scripts/syncAgentHarness.mjs --check   # exit 1 if any mirror drifts from source

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MODE = process.argv.includes("--write")
  ? "write"
  : process.argv.includes("--check")
    ? "check"
    : null;

if (!MODE) {
  console.error("Usage: node scripts/syncAgentHarness.mjs --write|--check");
  process.exit(2);
}

const read = (rel) => readFileSync(path.join(ROOT, rel), "utf8");
const has = (rel) => existsSync(path.join(ROOT, rel));

// Normalize to LF + exactly one trailing newline so CRLF (Windows) never shows as drift.
const norm = (s) => s.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n*$/, "") + "\n";

function parseFrontmatter(raw) {
  const m = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: "", body: raw.replace(/\r\n/g, "\n") };
  return { fm: m[1], body: raw.replace(/\r\n/g, "\n").slice(m[0].length) };
}

function fmValue(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function fmList(fm, key) {
  // Parses a YAML block list:  key:\n  - "a"\n  - "b"
  const lines = fm.split("\n");
  const out = [];
  let inKey = false;
  for (const line of lines) {
    if (new RegExp(`^${key}:\\s*$`).test(line)) { inKey = true; continue; }
    if (inKey) {
      const m = line.match(/^\s*-\s*(.*)$/);
      if (m) { out.push(m[1].trim().replace(/^["']|["']$/g, "")); continue; }
      if (line.trim() !== "" && !/^\s/.test(line)) break;
    }
  }
  return out;
}

// Preserve an externally-managed block (e.g. the codegraph tool's block) by re-reading it from the target.
function preservedBlock(targetRel, start, end) {
  if (!has(targetRel)) return "";
  const cur = read(targetRel).replace(/\r\n/g, "\n");
  const s = cur.indexOf(start);
  const e = cur.indexOf(end);
  if (s === -1 || e === -1 || e < s) return "";
  return cur.slice(s, e + end.length).trim() + "\n\n";
}

const GEN_MARK =
  "<!-- GENERADO por scripts/syncAgentHarness.mjs desde .agents/. No editar a mano: correr `npm run agent:harness:sync`. -->";

// Cursor .mdc `globs` is a comma-separated list, so a brace group like `{ts,tsx}` (which contains a
// comma) would be mis-split. Expand a single brace group into separate globs before joining.
function expandBraces(glob) {
  const m = glob.match(/^(.*)\{([^}]+)\}(.*)$/);
  if (!m) return [glob];
  return m[2].split(",").map((opt) => `${m[1]}${opt.trim()}${m[3]}`);
}

const RULE_NAMES = ["backend", "frontend", "testing"];

function loadRules() {
  return RULE_NAMES.map((name) => {
    const { fm, body } = parseFrontmatter(read(`.agents/rules/${name}.md`));
    return { name, description: fmValue(fm, "description"), globs: fmList(fm, "globs"), body: body.trim() };
  });
}

function rulesEmbed(rules) {
  return [
    "## Reglas Por Path (referencia embebida)",
    "",
    "Para harnesses sin soporte nativo de path-globs, estas reglas aplican al editar los archivos indicados.",
    "",
    rules
      .map((r) => `> Globs: ${r.globs.join(", ")}\n\n${r.body}`)
      .join("\n\n"),
  ].join("\n");
}

// ---- Instructions -----------------------------------------------------------
function renderInstructions(outputs) {
  const core = read(".agents/instructions/core.md").replace(/\r\n/g, "\n").trim();
  const claudeHeader = read(".agents/instructions/claude-header.md").replace(/\r\n/g, "\n").trim();
  const agentsHeader = read(".agents/instructions/agents-header.md").replace(/\r\n/g, "\n").trim();
  const copilot = read(".agents/instructions/copilot.md").replace(/\r\n/g, "\n").trim();
  const rules = loadRules();

  const CG_START = "<!-- CODEGRAPH_START -->";
  const CG_END = "<!-- CODEGRAPH_END -->";

  const claudeBlock = preservedBlock("CLAUDE.md", CG_START, CG_END);
  const agentsBlock = preservedBlock("AGENTS.md", CG_START, CG_END);

  outputs.push({
    rel: "CLAUDE.md",
    content: norm(`${claudeBlock}${GEN_MARK}\n\n${claudeHeader}\n\n${core}`),
  });
  outputs.push({
    rel: "AGENTS.md",
    content: norm(`${agentsBlock}${GEN_MARK}\n\n${agentsHeader}\n\n${core}\n\n${rulesEmbed(rules)}`),
  });
  outputs.push({ rel: ".github/copilot-instructions.md", content: norm(`${GEN_MARK}\n\n${copilot}`) });
}

// ---- Rules ------------------------------------------------------------------
function renderRules(outputs) {
  for (const r of loadRules()) {
    const claudePaths = r.globs.map((g) => `  - "${g}"`).join("\n");
    outputs.push({
      rel: `.claude/rules/${r.name}.md`,
      content: norm(`---\npaths:\n${claudePaths}\n---\n\n${r.body}`),
    });
    const cursorGlobs = r.globs.flatMap(expandBraces).join(",");
    outputs.push({
      rel: `.cursor/rules/${r.name}.mdc`,
      content: norm(
        `---\ndescription: ${r.description}\nglobs: ${cursorGlobs}\nalwaysApply: false\n---\n\n${r.body}`,
      ),
    });
  }
}

// ---- MCP --------------------------------------------------------------------
const CODEX_PREAMBLE = `# Project-scoped Codex configuration for PlanearIA.
# Generated by scripts/syncAgentHarness.mjs from .mcp.json. Do not edit by hand.
# Loaded by Codex CLI, the Codex VS Code extension, and the Codex app when this repo is trusted.

project_doc_max_bytes = 65536
project_doc_fallback_filenames = ["CLAUDE.md", ".github/copilot-instructions.md"]

[features]
goals = true

# --- Codex-specific extra (not in .mcp.json) ---
[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"
startup_timeout_sec = 20
tool_timeout_sec = 60
`;

function tomlArgs(args) {
  return `[${(args || []).map((a) => JSON.stringify(a)).join(", ")}]`;
}

function renderMcp(outputs) {
  const mcp = JSON.parse(read(".mcp.json"));
  const servers = mcp.mcpServers || {};

  // Cursor mirrors the universal set verbatim.
  outputs.push({
    rel: ".cursor/mcp.json",
    content: norm(JSON.stringify({ mcpServers: servers }, null, 2)),
  });

  // Codex TOML: preamble (with its extra server) + one [mcp_servers.<name>] per universal server.
  const blocks = [CODEX_PREAMBLE.trim(), "# --- Parity with .mcp.json (universal MCP source of truth) ---"];
  for (const [name, s] of Object.entries(servers)) {
    const isNet = Boolean(s.url) || s.command === "npx" || s.command === "cmd" || (s.args || []).includes("mcp-remote");
    const startup = s.url ? 20 : isNet ? 60 : 30;
    const tool = s.url ? 60 : isNet ? 120 : 90;
    if (s.url) {
      blocks.push(`[mcp_servers.${name}]\nurl = "${s.url}"\nstartup_timeout_sec = ${startup}\ntool_timeout_sec = ${tool}`);
    } else {
      blocks.push(
        `[mcp_servers.${name}]\ncommand = "${s.command}"\nargs = ${tomlArgs(s.args)}\nstartup_timeout_sec = ${startup}\ntool_timeout_sec = ${tool}`,
      );
    }
  }
  outputs.push({ rel: ".codex/config.toml", content: norm(blocks.join("\n\n")) });
}

// ---- Permissions ------------------------------------------------------------
function renderPermissions(outputs) {
  const perms = JSON.parse(read(".agents/permissions.json"));
  const deny = [
    ...(perms.deny?.bash || []).map((p) => `Bash(${p})`),
    ...(perms.deny?.read || []).map((p) => `Read(${p})`),
  ];
  outputs.push({
    rel: ".claude/settings.json",
    content: norm(JSON.stringify({ permissions: { deny } }, null, 2)),
  });
}

// ---- Skills mirror (project-owned domain skills -> Codex) -------------------
// Codex only discovers skills under .codex/skills/. Mirror the committed .agents/skills/* there,
// EXCLUDING `impeccable` (local third-party tool) and any `openspec-*` (owned by `openspec update`).
const SKILL_EXCLUDE = new Set(["impeccable"]);

function walkFiles(absDir, baseRel) {
  const out = [];
  for (const entry of readdirSync(absDir)) {
    const abs = path.join(absDir, entry);
    const rel = `${baseRel}/${entry}`;
    if (statSync(abs).isDirectory()) out.push(...walkFiles(abs, rel));
    else out.push(rel);
  }
  return out;
}

function renderSkills(outputs) {
  const srcRoot = path.join(ROOT, ".agents/skills");
  if (!existsSync(srcRoot)) return;
  for (const name of readdirSync(srcRoot)) {
    if (SKILL_EXCLUDE.has(name) || name.startsWith("openspec-")) continue;
    const skillAbs = path.join(srcRoot, name);
    if (!statSync(skillAbs).isDirectory()) continue;
    for (const fileRel of walkFiles(skillAbs, `.agents/skills/${name}`)) {
      const target = fileRel.replace(/^\.agents\/skills\//, ".codex/skills/");
      outputs.push({ rel: target, content: norm(read(fileRel)) });
    }
  }
}

// ---- Driver -----------------------------------------------------------------
function build() {
  const outputs = [];
  renderInstructions(outputs);
  renderRules(outputs);
  renderMcp(outputs);
  renderPermissions(outputs);
  renderSkills(outputs);
  return outputs;
}

const outputs = build();

if (MODE === "write") {
  let changed = 0;
  for (const o of outputs) {
    const abs = path.join(ROOT, o.rel);
    const cur = has(o.rel) ? norm(read(o.rel)) : null;
    if (cur !== o.content) {
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, o.content);
      changed++;
      console.log(`  write ${o.rel}`);
    }
  }
  console.log(changed === 0 ? "agent-harness: up to date" : `agent-harness: wrote ${changed} file(s)`);
  process.exit(0);
}

// check mode
const drifted = [];
for (const o of outputs) {
  const cur = has(o.rel) ? norm(read(o.rel)) : null;
  if (cur !== o.content) drifted.push(o.rel);
}
if (drifted.length) {
  console.error("agent-harness: DRIFT detected in generated mirrors (run `npm run agent:harness:sync`):");
  for (const rel of drifted) console.error(`  - ${rel}`);
  process.exit(1);
}
console.log(`agent-harness: OK (${outputs.length} mirrors in parity)`);
process.exit(0);
