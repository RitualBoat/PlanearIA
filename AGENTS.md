<!-- CODEGRAPH_START -->
## Code Intelligence Policy

PlanearIA uses two local code-intelligence tools with strict routing:

- **GitNexus is primary for structural questions**: architecture maps, MVVM screen -> hook/ViewModel -> service flows, call chains, dependency impact, backend/AI gateway paths, sync/offline paths, and SDD blast-radius decisions.
  - CLI: `npx -y gitnexus@latest query -r PlanearIA "<question>"`
  - Impact: `npx -y gitnexus@latest impact -r PlanearIA <symbol>`
  - Freshness: `npx -y gitnexus@latest status`
  - Reindex: `npx -y gitnexus@latest analyze --index-only --name PlanearIA .`
- **CodeGraph is secondary/fallback for line-numbered source context** once files/symbols are known, or when GitNexus is unavailable, stale, ambiguous, or does not return enough editable source.
  - MCP tool when available: `codegraph_explore`.
  - CLI fallback: `npm run codegraph:explore -- "<question>"`.
- Do not call both tools by reflex for the same question. Use the second only when the first misses a key file, is stale/ambiguous, or evidence comparison is part of an explicit spike.
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

- Todo change SDD no trivial debe empezar con issue/user story en GitHub y item en `PlanearIA Product OS`
  antes de enrich, explore o propose. No crear `openspec/changes/<nombre>/` sin ese origen operativo.
- No implementar cambios de producto no triviales sin change OpenSpec.
- No marcar `[x]` sin evidencia.
- UI visible requiere Playwright por breakpoint; el gate visual no es N/A por defecto.
- Specs archivadas en `openspec/specs/` son verdad de comportamiento y no se editan a mano.

## MCPs Y Herramientas

- `gitnexus`: primario para estructura, flujos MVVM, call chains, dependencias e impacto de codigo.
- `codegraph`: secundario/fallback para fuente lineada estilo Read, simbolos puntuales y comprobacion cuando GitNexus sea ambiguo o no este disponible.
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
