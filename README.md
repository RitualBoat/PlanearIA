# PlanearIA

> **Estado:** desarrollo activo.
> **Uso:** puerta de entrada para humanos e IAs.
> **Fuente de verdad:** `CLAUDE.md`, `AGENTS.md`, `Documentacion/README.md`, `openspec/config.yaml`, codigo real.
> **No usar para:** sustituir OpenSpec, specs archivadas o validacion tecnica.

PlanearIA es una suite docente offline-first para profesores mexicanos. Integra herramientas familiares de trabajo escolar: Office Docente, Clases, AsistePLAN, DiseñaPLAN, ConectaPLAN, AgendaPLAN, ReportaPLAN, cuenta, seguridad y accesibilidad.

La promesa de producto es simple:

> Creo algo, PlanearIA entiende que es, me sugiere donde va, lo asigno, le doy seguimiento y obtengo reportes sin salir de la app.

## Stack

- React Native 0.81.5 + Expo SDK 54 + TypeScript 5.9.
- React Navigation 7.
- Context + hooks como ViewModels.
- AsyncStorage como persistencia local default.
- Expo SQLite instalado como infraestructura opt-in, no default.
- Backend Node serverless en `backend/api/index.js` + `backend/routes`.
- MongoDB Atlas M0.
- JWT con refresh sessions.
- IA centralizada en `backend/lib/aiGateway.js`.
- GitHub Actions para CI/CD y Vercel para demo/backend.

## Mapa Rapido

```text
PlanearIA/
  App.tsx
  src/                    App Expo: screens, hooks, context, services, sync, navigation, themes, tests
  backend/                API serverless, rutas, auth, MongoDB, IA gateway
  types/                  Tipos compartidos
  Documentacion/          Fundamentos, planes, operacion, validacion, context engineering, archivo
  context/                Ground truth, referencias, ejemplos reales y material de estudio
  openspec/               Specs, changes y config SDD
  .github/                Workflows, templates e instrucciones Copilot
  .claude/ .codex/        Skills y comandos SDD versionados para agentes
```

## Flujo De Trabajo Obligatorio

PlanearIA usa OpenSpec SDD para trabajo no trivial:

```text
Issue GitHub
  -> enrich con criterios observables
  -> OpenSpec propose/design/spec/tasks
  -> apply tarea por tarea
  -> evidencia tecnica y visual
  -> adversarial review
  -> archive
```

Reglas del flujo:

- Todo trabajo formal nace como issue.
- El issue se enriquece antes de proponer.
- Las specs usan `SHALL` y escenarios WHEN/THEN.
- Las tareas se marcan `[x]` solo con evidencia.
- UI visible requiere QA con Playwright por breakpoint.
- `openspec/specs/` es verdad de comportamiento; no se edita a mano.

## Lectura Para IAs

1. `AGENTS.md` o `CLAUDE.md`.
2. `Documentacion/README.md`.
3. `Documentacion/05-context-engineering/README.md`.
4. `openspec/config.yaml`.
5. El plan, spec o carpeta `context/` correspondiente.

## Reglas Criticas

- Mantener monolito modular y MVVM pragmatico.
- Datos academicos sincronizables usan `src/sync`.
- Toda entidad multiusuario filtra por `userId`.
- Toda IA pasa por backend y `backend/lib/aiGateway.js`.
- Correcciones IA generan copia, borrador, diff o resumen revisable; no sobrescriben originales sin confirmacion.
- SQLite sigue opt-in; no activar como default sin aprobacion, validacion y rollback.
- No borrar claves `@planearia:*` sin migracion controlada.
- Presupuesto bajo/cero: free tiers y soluciones simples primero.
- No copiar codigo open source sin revisar licencia, stack y compatibilidad.

## Comandos Locales

```bash
npm install
npm run backend:install
npm run web
npm run backend:dev
```

Validacion:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run backend:check
```

CodeGraph:

```bash
npm run codegraph:status
npm run codegraph:explore -- "how does SyncContext reach entitySync and syncEngine?"
```

## Documentos Principales

- `Documentacion/README.md`: mapa documental.
- `Documentacion/05-context-engineering/README.md`: rutas de lectura para IAs.
- `Documentacion/00-fundamentos/ARQUITECTURA.md`: arquitectura vigente.
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`: sync offline-first.
- `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`: IA y gateway.
- `Documentacion/01-planes-maestros/meta_guia_planes.md`: SDD con OpenSpec.
- `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`: MCPs y QA Playwright.

## Version

- Actualizado: 2026-07-06.
- Version documental: AI-Friendly First.
