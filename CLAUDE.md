# PlanearIA - Context for Claude

## Project Overview

PlanearIA is an offline-first React Native + Expo SDK 54 + TypeScript app for Mexican teachers. It uses a modular monolith architecture and pragmatic MVVM.

The current product vision is not "many separate modules". It is a connected teacher suite:

- Office Docente: documents, lesson plans, sheets, lists, rubrics, attendance, grades and import/export.
- Asistente IA / ChatGPT Docente: a first-party chatbot for teachers, with attachments from Office, Classroom and Canva, routed through the backend AI gateway. Silent AI may start approved background LLM tasks, such as document corrections, but results must be reviewable before applying.
- Classroom: classes, units, materials, activities, students, submissions and operational follow-up.
- Canva/Genially Docente: visual learning materials.
- WhatsApp Docente: professional teacher communication.
- Calendar, reports, account, security and accessibility.

Built by a solo student developer. Budget is zero/low. Do not suggest expensive infrastructure or full rewrites without strong justification.

## Stack

- React Native 0.81.5 + Expo 54 + TypeScript 5.9.
- React Navigation 7.
- Context + hooks as ViewModels.
- AsyncStorage as default local persistence.
- Expo SQLite installed as opt-in infrastructure, not default.
- Expo SecureStore for native session tokens; AsyncStorage fallback on web.
- Backend: Node serverless in `backend/api/index.js` + `backend/routes`.
- MongoDB Atlas M0.
- JWT auth with refresh sessions.
- AI gateway: `backend/lib/aiGateway.js`.
- Future AI chatbot: first-party ChatGPT/Gemini-like assistant; cloud and local OpenAI-compatible providers must go through the gateway.
- CI/CD: GitHub Actions (`ci.yml`, `cd.yml`).

## Architecture Rules

- MVVM: thin screens, hooks as ViewModels, Context for shared state, services for I/O.
- Offline-first from design.
- New syncable academic data MUST use `src/sync`; do not create parallel HTTP clients or queues.
- New academic modules should use ports/repositories compatible with future SQLite default.
- Do NOT activate SQLite as default without explicit approval.
- Do NOT delete legacy AsyncStorage keys (`@planearia:*`) without migration, validation and rollback.
- Every multiuser entity must be isolated by `userId`.
- AI must go through backend, never frontend provider keys. This includes OpenAI/Gemini-like cloud models and local providers such as LM Studio.
- AI-generated corrections must not overwrite originals; create a copy, draft, diff/summary or chat result for teacher review.
- No microservices or costly services unless the user explicitly asks and tradeoffs are documented.
- Web/tablet/mobile should start from a shared responsive screen. Platform-specific files need justification.

## Key Documentation

Read before significant work:

- `Documentacion/README.md`
- `Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md` for personas, journeys, interview guide and the Nielsen gate.
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` for the active UX/UI plan (blueprint + change backlog).

## Project Structure

```text
PlanearIA/
  App.tsx
  src/
    screens/
    hooks/
    context/
    services/
    navigation/
    sync/
    themes/
    utils/
    __tests__/
  backend/
    api/index.js
    routes/
    lib/
    shared/
  types/
  Documentacion/
  context/
  .github/workflows/
```

## Closed Plans

Do not reopen without explicit request:

- Planeaciones: closed as functional document editor base. In the current vision it becomes part of Office Docente.
- Classroom: closed as functional class-management base. It can still be visually redesigned in UX/UI Global.
- Pasos Iniciales.
- Infraestructura Local/CI/Deploy.
- Storage Local SQLite/Migration Offline: closed as opt-in infrastructure.

Closed plan docs live in `Documentacion/01-planes-maestros/cerrados/`.

## Active And Pending

- Active: `Plan Maestro: UX/UI y Navegacion Global` (`Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`), SDD format: blueprint + change backlog in waves. Pilot change: `theming-runtime` (Ola 0).
- Active/closing: `Auth, Seguridad y Sesion Real`.
- Done: global offline-first sync engine in `src/sync`.
- Former "future plans" (Office Docente, Asistente IA, Classroom redesign, Cuenta/Accesibilidad, Calendario, WhatsApp Docente, Canva, Reportes) are now change groups inside the UX/UI plan backlog, not separate plan documents.
- Suite naming (confirmed 2026-07): NotasPLAN (docs), CalcuPLAN (sheets), PresentaPLAN (slides), DiseñaPLAN (creative), AsistePLAN (AI chat), ConectaPLAN (messaging), Escritorio Docente (home/launcher).

## Testing Rules

For code changes:

1. Search existing tests in `src/__tests__/`.
2. Run affected tests.
3. Add tests if risk/blast radius warrants it.
4. Fix failing tests before marking complete.

Useful commands:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

On Windows, if Jest path resolution needs it, add:

```bash
--rootDir c:\Users\jarco\dev\PlanearIA
```

## Working With Plans

Master plans follow `Documentacion/01-planes-maestros/meta_guia_planes.md` v3 (SDD format):
a plan is a Blueprint + a backlog of OpenSpec changes in waves. Plans do NOT contain sequential
technical task phases; `/opsx:propose` generates each change's specs and `tasks.md`.

When asked to work on a plan:

1. Read `Documentacion/README.md` and the active plan.
2. Pick the next `pendiente` change in the active wave whose dependencies are archived.
3. Run the SDD cycle for that change (see OpenSpec section below and meta guia v3 section 2).
4. On archive, mark the change `archivado` in the plan's backlog and sync GitHub Project.

Task states `[ ]` / `[~]` / `[x]` still apply inside each change's `tasks.md` and in legacy plans
(e.g. Auth). `[x]` only with evidence (typecheck, lint, affected tests; visual validation for UI).

## OpenSpec (Spec Driven Development)

PlanearIA uses OpenSpec for product-facing changes. Config: `openspec/config.yaml`
(project context and rules live there; keep it in sync with this file and `Documentacion/`).

Workflow (Claude Code slash commands, `opsx` prefix):

1. `/enrich-us <issue-o-idea>` (optional): turn a vague idea or GitHub issue into an
   implementation-ready story. GitHub issues via `gh`/GitHub MCP, never Jira.
2. `/opsx:explore`: investigate before proposing when scope is unclear.
3. `/opsx:propose "<idea>"`: create the change (proposal, specs, design, tasks) in `openspec/changes/`.
4. `/opsx:apply`: implement tasks one at a time; mark `[x]` only with typecheck/lint/test evidence.
5. `/adversarial-review`: independent red-team pass before archiving (ideally a fresh session).
6. `/opsx:archive`: move the completed change's specs into `openspec/specs/` as permanent truth.

Rules:

- Specs in `openspec/specs/` are the source of truth for system behavior; update them via archive, not by hand.
- Changes in progress live in `openspec/changes/`. Do not implement product changes without a proposal for non-trivial work.
- `openspec/config.yaml` context points at `Documentacion/00-fundamentos/*` and `.claude/rules/*`. All OpenSpec artifacts must respect those and the Architecture Rules above.
- This project does NOT use symlinked skills (Windows). Skills are real files under `.claude/skills/`.
- Reference/study material for the SDD setup lives in `context/OpenSpec/` (lidr-specboot template + screenshots); it is not the active config.

## CodeGraph MCP

PlanearIA is initialized for CodeGraph to reduce repeated grep/read exploration.

- Start structural code questions with CodeGraph: "how does X work?", call flow, dependencies, impact
  radius, affected tests, or where a symbol lives.
- MCP config lives in `.mcp.json`; the server command is `codegraph serve --mcp`.
- The local index lives in `.codegraph/` and is ignored by Git. Rebuild with `npm run codegraph:init`
  or refresh with `npm run codegraph:sync`.
- If an agent session does not expose MCP tools, use the CLI equivalent:

```bash
npm run codegraph:explore -- "how does SyncContext reach entitySync and syncEngine?"
```

Treat returned CodeGraph source blocks as already read. Fall back to `rg` and direct reads when working
with non-indexed docs/assets, full-file edits, generated outputs, or files outside the indexed project.

Shared project MCPs in `.mcp.json`: CodeGraph, Figma, Context7, GitHub, Vercel, Expo, Playwright and
PlanearIA SQLite read-only.
When Expo local MCP project context is needed during development, start Expo with `npm run start:mcp`.
For local SQLite diagnostics, use `planearia-sqlite` or `npm run sqlite:inspect`; never use arbitrary SQL
or activate SQLite as default because of this inspector. MongoDB MCP is opt-in only with dev/staging read-only
credentials outside Git.

## Ground Truth

For high-parity experiences, check or request ground truth before UI implementation:

- Office Docente: Word/Docs + Excel/Sheets + LibreOffice/OnlyOffice conceptual references.
- Asistente IA: ChatGPT/Gemini/NotebookLM-style chat patterns, with PlanearIA-specific permissions, attachments, background task states and confirmation flows.
- Classroom: Google Classroom/Classroomio.
- Canva/Genially.
- WhatsApp professional messaging.

Do not copy open source code without license/stack review.

## Writing Style

- No emojis in code, docs, commits or logs.
- Clear, practical language.
- Comments explain why, not what.
- Spanish is acceptable for docs and user-facing text.

## Python

Executable: `C:/Users/jarco/AppData/Local/Programs/Python/Python312/python.exe`.
