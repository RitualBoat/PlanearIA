# PlanearIA - Codex Agent Guide

This file is the Codex entry point for the repo. Keep `CLAUDE.md` as the shared long-form project
context; when this file and `CLAUDE.md` disagree, follow the newest explicit user request first, then
prefer the more specific repo instruction.

## Read First

For significant work, read:

- `CLAUDE.md`
- `Documentacion/README.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` when touching UX/UI.

## Product And Architecture

- PlanearIA is an offline-first React Native + Expo SDK 54 + TypeScript app for Mexican teachers.
- Keep the modular monolith and pragmatic MVVM: thin screens, hooks as ViewModels, Context for shared
  state, services/repositories for I/O.
- Syncable academic data goes through `src/sync`; do not create parallel HTTP clients or queues.
- Backend AI calls go through `backend/lib/aiGateway.js`. Never put provider keys in frontend code.
- Do not activate SQLite as default or delete legacy `@planearia:*` keys without explicit approval,
  migration, validation, and rollback.
- Every multiuser/backend academic path must isolate by `userId`.
- Budget is zero/low. Avoid microservices, paid infrastructure, or rewrites unless the user explicitly
  asks and tradeoffs are documented.

## OpenSpec SDD In Codex

PlanearIA uses OpenSpec for non-trivial product changes. The active config is `openspec/config.yaml`.

In Claude, the workflow is exposed as `/opsx:*` commands. In Codex, prefer the repo skills:

- `$openspec-explore` for investigation before proposal.
- `$openspec-propose` to create `openspec/changes/<change>/` artifacts.
- `$openspec-apply-change` to implement tasks one at a time.
- `$openspec-sync-specs` to sync delta specs when needed.
- `$openspec-archive-change` to archive completed changes.

The user's local Codex setup may also expose deprecated custom prompts such as `/prompts:opsx-propose`
or `/opsx-propose`. Treat skills as the portable source of truth.

Rules:

- Before any non-trivial SDD change reaches `$openspec-propose`, create or identify its GitHub issue/user
  story, add it to the PlanearIA Product OS Project, and use that issue as the source for enrichment.
  Do not skip this Product OS step unless the user explicitly authorizes a trivial hotfix outside SDD.
- Do not implement non-trivial product changes without a proposed OpenSpec change.
- Mark tasks `[x]` only after evidence: typecheck/lint/tests, and visual validation for UI.
- Specs archived in `openspec/specs/` are behavioral truth; update them through archive/sync, not by
  hand during implementation.

## CodeGraph MCP First

This repo is initialized for CodeGraph. For codebase-navigation questions, architecture tracing, impact
analysis, or "how does X work?", start with CodeGraph before falling back to broad `rg` + file reads.

- MCP server: `codegraph` in `.mcp.json` (`codegraph serve --mcp`).
- Local index: `.codegraph/` (generated per machine and ignored by Git).
- Health check: `npm run codegraph:status`.
- Manual refresh: `npm run codegraph:sync`.
- CLI fallback when MCP tools are not loaded:

```bash
npm run codegraph:explore -- "how does SyncContext reach entitySync and syncEngine?"
```

Use CodeGraph results as already-read source for the returned files/symbols. Re-run CodeGraph after edits
or if the staleness/status output says the index is behind. Use normal file reads when the answer needs
non-indexed docs/assets, exact full-file editing context, generated files, or anything outside this repo.

Shared project MCPs in `.mcp.json`: CodeGraph, Figma, Context7, GitHub, Vercel, Expo, Playwright and
PlanearIA SQLite read-only.
When Expo local MCP project context is needed during development, start Expo with `npm run start:mcp`.
For local SQLite diagnostics, use `planearia-sqlite` or `npm run sqlite:inspect`; never use arbitrary SQL
or activate SQLite as default because of this inspector. MongoDB MCP is opt-in only with dev/staging read-only
credentials outside Git.

## Validation Commands

Use the smallest meaningful checks, then broaden with risk:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

On Windows, if Jest path resolution needs it:

```bash
--rootDir c:\Users\jarco\dev\PlanearIA
```

## Review Guidelines

- Prioritize bugs, data loss, auth/user isolation, sync regressions, missing tests, and broken UI states.
- Check loading, empty, error, offline, and accessibility states for user-facing flows.
- Never commit secrets, `.env` values, personal Codex state, local MCP auth, or screenshots/logs with
  tokens.
