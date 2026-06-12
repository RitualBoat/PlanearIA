# PlanearIA - Context for Claude

## Project Overview

PlanearIA is an offline-first React Native + Expo SDK 54 + TypeScript app for Mexican teachers. Modular monolith architecture (MVVM). The goal is zero-friction: each module must feel like a tool the teacher already knows (Word, Classroom, Excel, Canva, WhatsApp).

Built by a solo student developer. Not in production. No real users yet. Budget is zero/low.

## Stack

- React Native 0.81.5 + Expo 54 + TypeScript 5.9
- React Navigation 7, Context + hooks as ViewModels
- AsyncStorage (default local persistence) + SQLite/Expo SQLite (opt-in for relational academic data)
- Backend: Node serverless in `backend/api/`, MongoDB Atlas M0, JWT auth
- AI gateway: multi-provider in `backend/lib/aiGateway.js`
- Testing: Jest + Testing Library

## Architecture Rules

- MVVM: thin screens, hooks as ViewModels, Context for shared state, services for I/O
- Offline-first from design. AsyncStorage is current default; SQLite is opt-in infrastructure
- New academic data modules MUST use ports/repositories compatible with SQLite, no direct AsyncStorage reads
- Do NOT activate SQLite as default without explicit approval
- Do NOT delete legacy AsyncStorage keys (`@planearia:*`)
- userId isolation in every syncable entity
- No microservices, no expensive infrastructure without warning
- Conventional Commits: `type(scope): description`

## Key Documentation

Read these before any plan or significant work:

- @Documentacion/README.md
- @Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md
- @Documentacion/00-fundamentos/ARQUITECTURA.md
- @Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md
- @Documentacion/01-planes-maestros/meta_guia_planes.md

## Project Structure

```
PlanearIA/
  App.tsx                    # Entry point
  src/
    screens/                 # Views (React Native)
    hooks/                   # ViewModels
    context/                 # State providers
    services/                # I/O, sync, storage, AI, API
    navigation/              # StackNavigator, AppTabsNavigator
    sync/                    # Offline sync engine
    themes/                  # Colors, tokens
    __tests__/               # Jest tests
  backend/
    api/                     # Vercel serverless endpoints
    lib/                     # Auth, AI gateway, helpers
  types/                     # TypeScript types
  Documentacion/             # Plans, architecture, operations
  context/                   # Ground truth, stitch results, references
  .agents/skills/            # Project AI skills (multi-agent)
```

## Closed Plans (do not reopen without explicit request)

- Planeaciones (Word/Docs editor, Phase 9)
- Pasos Iniciales (GitHub Product OS setup)
- Classroom (Grupos, Alumnos, Recursos)
- Infraestructura Local/CI/Deploy (Phases 0-7)
- Storage Local SQLite/Migration Offline (opt-in infrastructure)

## Active/Pending Plans

- Auth, Seguridad y Sesion Real: plan created, pending execution
- UX/UI Global, Excel/Listas, Canva, WhatsApp, Reportes: future

## Testing Rules (Mandatory)

Every code change MUST:
1. Search existing tests in `src/__tests__/`
2. Run affected tests: `npm test -- --testPathPattern="<pattern>"`
3. Create new tests if module has no coverage
4. Fix failing tests before marking complete
5. On Windows: add `--rootDir c:\Users\jarco\dev\PlanearIA`

## Validation Commands

```bash
npx tsc --noEmit
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom -- --runInBand
npm run test:sync -- --runInBand
```

## MongoDB Index Rule

Every backend CRUD endpoint MUST create indexes. `createIndex` is idempotent.

## Writing Style

- No emojis anywhere (code, docs, commits, logs)
- No verbose/flowery language
- Comments explain WHY, not WHAT
- English for logs, Spanish acceptable for user-facing docs
- See @.agents/skills/writing-style/SKILL.md

## Token Efficiency

- Use CAVEMAN mode for mechanical/approved tasks (minimal prose)
- Use NORMAL mode for planning, architecture, questions, ambiguity
- See @.agents/skills/token-efficiency/SKILL.md

## Working with Plans

When asked to "work on the next task":
1. Read `Documentacion/README.md` and the active plan
2. Find next pending `[ ]` task
3. Implement it
4. Run related tests
5. Mark as `[x]` with date and evidence

Task states: `[ ]` pending, `[~]` in progress, `[x]` completed.

## Ground Truth

For modules with "clone/high-parity" (Word, Classroom, Excel, Canva, WhatsApp): always check `context/<module>-ground-truth/` and `context/stitch-results/` before implementing UI.

## Python

Executable: `C:/Users/jarco/AppData/Local/Programs/Python/Python312/python.exe` (has `requests`).
