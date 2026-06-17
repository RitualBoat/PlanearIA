# PlanearIA - Context for Claude

## Project Overview

PlanearIA is an offline-first React Native + Expo SDK 54 + TypeScript app for Mexican teachers. It uses a modular monolith architecture and pragmatic MVVM.

The current product vision is not "many separate modules". It is a connected teacher suite:

- Office Docente: documents, lesson plans, sheets, lists, rubrics, attendance, grades and import/export.
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
- CI/CD: GitHub Actions (`ci.yml`, `cd.yml`).

## Architecture Rules

- MVVM: thin screens, hooks as ViewModels, Context for shared state, services for I/O.
- Offline-first from design.
- New syncable academic data MUST use `src/sync`; do not create parallel HTTP clients or queues.
- New academic modules should use ports/repositories compatible with future SQLite default.
- Do NOT activate SQLite as default without explicit approval.
- Do NOT delete legacy AsyncStorage keys (`@planearia:*`) without migration, validation and rollback.
- Every multiuser entity must be isolated by `userId`.
- AI must go through backend, never frontend provider keys.
- No microservices or costly services unless the user explicitly asks and tradeoffs are documented.
- Web/tablet/mobile should start from a shared responsive screen. Platform-specific files need justification.

## Key Documentation

Read before significant work:

- `Documentacion/README.md`
- `Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/prompt_mejorado.md` for the UX/UI Claude audit.

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

- Active/closing: `Auth, Seguridad y Sesion Real`.
- Done: global offline-first sync engine in `src/sync`.
- Next recommended new plan: `Plan Maestro: UX/UI y Navegacion Global`.
- Future plans depend on UX/UI Global: Office Docente, Classroom redesign/integration, Cuenta/Accesibilidad, Calendario, WhatsApp Docente, Canva, Reportes.

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

When asked to work on a plan:

1. Read `Documentacion/README.md`.
2. Read the active plan.
3. Find next pending `[ ]` task.
4. Implement.
5. Validate.
6. Mark as `[x]` only with evidence.

Task states: `[ ]` pending, `[~]` in progress, `[x]` completed.

## Ground Truth

For high-parity experiences, check or request ground truth before UI implementation:

- Office Docente: Word/Docs + Excel/Sheets + LibreOffice/OnlyOffice conceptual references.
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
