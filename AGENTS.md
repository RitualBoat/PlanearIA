<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading code when you need to understand or locate implementation.

- MCP tool when available: `codegraph_explore`.
- CLI fallback: `npm run codegraph:explore -- "<question>"`.
- Use direct reads/`rg` for Markdown docs, assets, generated files, exact full-file editing context, or files outside the index.
<!-- CODEGRAPH_END -->

# PlanearIA - Codex Agent Guide

> **Estado:** vigente.
> **Uso:** entrada de Codex para trabajar en PlanearIA.
> **Fuente de verdad:** `CLAUDE.md`, `Documentacion/README.md`, `Documentacion/05-context-engineering/README.md`, `openspec/config.yaml`.
> **No usar para:** saltarse OpenSpec SDD o cerrar trabajo sin evidencia.

## Lectura Inicial

Para trabajo significativo, leer:

1. `CLAUDE.md`
2. `Documentacion/README.md`
3. `Documentacion/05-context-engineering/README.md`
4. `Documentacion/00-fundamentos/ARQUITECTURA.md`
5. `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
6. `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`
7. `Documentacion/01-planes-maestros/meta_guia_planes.md`
8. Plan activo, spec o carpeta `context/` relacionada.

## Arquitectura Base

- PlanearIA es una app React Native + Expo SDK 54 + TypeScript para docentes mexicanos.
- Arquitectura: monolito modular + MVVM pragmatico.
- Screens delgadas, hooks como ViewModels, Context para estado compartido, services/repositories para I/O.
- Datos academicos sincronizables usan `src/sync`.
- Backend: `backend/api/index.js` + `backend/routes`.
- IA: `backend/lib/aiGateway.js`; nunca keys ni modelos desde frontend.
- Multiusuario: toda ruta/entidad academica filtra por `userId`.
- SQLite es opt-in; AsyncStorage sigue como default.
- Claves `@planearia:*` se borran solo con migracion, validacion y rollback.
- Presupuesto bajo/cero; evitar microservicios e infraestructura cara.

## OpenSpec SDD En Codex

Trabajo formal no trivial sigue este protocolo:

```text
Paso 0: crear issue GitHub / item Project
Paso 1: enrich con criterios observables
Paso 2: OpenSpec propose + apply
Paso 3: audit + QA real
```

En Codex, usar skills del repo:

- `$openspec-explore` para investigar.
- `$openspec-propose` para crear proposal/design/spec/tasks.
- `$openspec-apply-change` para implementar tarea por tarea.
- `$openspec-sync-specs` cuando aplique.
- `$openspec-archive-change` para archivar.

Reglas:

- No implementar cambios de producto no triviales sin change OpenSpec.
- No marcar `[x]` sin evidencia.
- UI visible requiere Playwright por breakpoint; el gate visual no es N/A por defecto.
- Specs archivadas en `openspec/specs/` son verdad de comportamiento y no se editan a mano.

## MCPs Y Herramientas

- `codegraph`: primero para estructura, flujos, dependencias e impacto de codigo.
- `github`: issues, PRs y tracking operativo.
- `context7`: documentacion actual de librerias/APIs.
- `figma`: ground truth visual cuando exista.
- `playwright`: QA visual web obligatoria para UI.
- `planearia-sqlite`: diagnostico read-only de SQLite local opt-in.

Detalle canonico: `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`.

## Validacion

Usar el set minimo significativo y ampliar segun riesgo:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

En Windows, si Jest lo necesita:

```bash
--rootDir c:\Users\jarco\dev\PlanearIA
```

## Review

Priorizar bugs, perdida de datos, auth/user isolation, sync, botones muertos, estados loading/empty/error/offline, accesibilidad y evidencia faltante.