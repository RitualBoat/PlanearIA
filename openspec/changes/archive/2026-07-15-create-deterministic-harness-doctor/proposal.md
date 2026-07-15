## Why

PlanearIA has individually useful harness checks, but no deterministic preflight that tells an agent whether it is safe to begin a change. This creates an immediate false green: `gitnexus:diagnose` can print `Not a git repository` and still return exit code 0, while the retired Graphify tool must never become a blocking requirement again.

The active preparation plan requires a doctor before UX/UI Ola 1 so a solo developer can obtain actionable, reproducible readiness evidence instead of rediscovering local tool state per change.

## What Changes

- Add one read-only, Windows-first harness doctor command with a stable human summary and machine-readable result.
- Aggregate the existing checks for local runtime, Git/worktree, OpenSpec, GitHub Projects, GitNexus, CodeGraph, active MCP parity/smoke, and Expo compatibility without performing repairs, installs, upgrades, or reindexing.
- Define `PASS`, `FAIL`, `WARN`, and `SKIP` semantics with a cause and recovery command for every result; any failure makes the doctor return a non-zero exit code.
- Classify semantic GitNexus errors as failures even if the wrapped process exits successfully.
- Report Graphify as `SKIP (retirado/manual)`, preserve the active GitNexus-primary/CodeGraph-fallback routing, and keep Graphify outside all blocking paths.
- Add deterministic fixtures/tests and operational documentation for the command and expected recovery boundaries.

## Capabilities

### New Capabilities

- `harness-readiness-doctor`: A deterministic preflight report that evaluates the active PlanearIA agent harness, surfaces actionable readiness states, and explicitly treats Graphify as retired/manual.

### Modified Capabilities

None.

## Impact

- Affected areas: `package.json`, new or updated Node scripts and tests under `scripts/`, harness configuration only as read input, and `Documentacion/02-operacion/`.
- Existing checks remain independently runnable: `openspec:check`, `agent:harness:check`, `mcp:parity`, `mcp:test`, and the GitNexus scripts.
- No application UI, backend route, sync data, authentication behavior, secrets, dependency upgrade, MCP baseline, or product runtime behavior changes.
- Plan affected: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (R1 readiness gate).

## No objetivos

- Repairing, installing, updating, authenticating, or reindexing any tool from the doctor.
- Reintroducing Graphify into the MCP baseline or treating `graphify-out/` as health evidence.
- Solving a detected environment fault within the same command or changing the PlanearIA application.
