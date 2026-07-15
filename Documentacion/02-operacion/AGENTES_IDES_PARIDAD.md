# Paridad De Agentes Y IDE - PlanearIA

> **Estado:** auditoria formal (2026-07-07). No se edito codigo ni configs; este documento es la base para el change OpenSpec que implementara la unificacion.
> **Objetivo:** cualquier IA/IDE que abra PlanearIA (Claude Code, Codex CLI, Cursor, GitHub Copilot, opencode, Antigravity u otros futuros) recibe el mismo contexto, las mismas herramientas, las mismas reglas por path, los mismos workflows OpenSpec y la misma validacion, sin drift manual.
> **Fuente de verdad:** este doc audita y propone; la implementacion vivira en un change OpenSpec que reemplace este documento por la version "vigente" una vez ejecutado.
> **No usar para:** ejecutar cambios de harness sin la section "Plan de implementacion" aprobada como change SDD.

> **Actualizacion (Fase 0 + Fase 1), issue #41:**
> - **Fase 0 (hotfix P0)** resuelta en commit `7af0847`: MCP parity Codex/Cursor, comando zombi, markdown de Copilot.
> - **Fase 1 (single-source)** en el change OpenSpec `single-source-agent-harness`: generador `scripts/syncAgentHarness.mjs` (fuente `.agents/` -> espejos project-owned de instrucciones, rules, MCP y permisos), validacion `npm run mcp:parity`, y gate `agent-harness-parity.yml` en modo suave.
> - **Hallazgo clave (corrige el plan):** los workflows opsx **NO** son project-owned. Los genera el CLI de openspec (`openspec update`, con `generatedBy` en el frontmatter); su paridad se mantiene con ese comando + `scripts/patchOpsxZombie.mjs`. El comando zombi es un **bug upstream de OpenSpec 1.5.0**, por eso `openspec update` lo reintroduce y el patch lo vuelve a quitar.
> - **Correccion de la seccion 4:** `CLAUDE.md` **NO** se reduce a wrapper. `CLAUDE.md` y `AGENTS.md` quedan ambos ricos y generados desde `.agents/instructions/` (verificados en paridad por el gate).

---

## 1. Resumen Ejecutivo

- **11 hallazgos** priorizados en P0/P1/P2; 4 son bloqueantes de paridad hoy mismo (P0).
- **3 de 4 harnesses** con config de MCP explicita no reciben MCPs criticos (`github`, `codegraph`, `context7`, `figma`, `planearia-sqlite`, `vercel`, `expo`): solo Claude Code y opencode los ven via `.mcp.json` universal; Codex y Cursor ven solo `playwright`.
- **5 copias** de cada uno de los 5 workflows OpenSpec (apply/archive/explore/propose/sync) sin ningun sincronizador. Editar una copia no propaga a las otras 4.
- **1 comando zombi** (`/opsx-continue` en 4 harnesses; `openspec-continue-change` en Codex) referenciado en los 5 harnesses pero que **no existe** en ningun archivo del repo. Bug de paridad silencioso.
- **Reglas por path** (`.claude/rules/{backend,frontend,testing}.md`) solo se activan automaticamente en Claude Code; Codex, Cursor (sin `.cursor/rules/`), opencode, Antigravity y Copilot no las reciben al editar archivos de esos globs.
- **Inventario de skills inconsistentes** (conteos verificados 2026-07-07): `.claude/skills/` tiene 10 skills commiteadas (+ `impeccable` como symlink gitignored); `.codex/skills/` solo 5 (las OpenSpec); `.agents/skills/` tiene 7 commiteadas (+ `impeccable` e `interview-me` como symlinks gitignored); `.cursor/skills/` tiene 5 (las OpenSpec linkeadas); Copilot/Antigravity tienen 0.
- **Drift de contenido**: `CLAUDE.md` y `AGENTS.md` difieren en 5 secciones (producto, stack detallado, ground truth por modulo, estilo, path de Python); `.github/copilot-instructions.md` tiene markdown roto y lista de validacion incompleta.
- **Propuesta aprobada por decision del usuario (2026-07-07)**: fuente unica en `.agents/workflows/opsx/` y `.agents/skills/`; generador `scripts/syncAgentHarness.mjs` que produce los espejos para cada harness; gate CI `agent-harness-parity.yml` que rompe el PR si algun espejo se desfasea.

---

## 2. Matriz De Cobertura Actual Por Harness

Leyenda:
- `OK` = recibido sin config adicional requerida por ese harness.
- `parcial` = recibido pero le falta al menos una pieza.
- `X` = no recibido en absoluto (el agente trabaja sin esa capacidad).

### 2.1 Contexto base / instrucciones de entrada

| Recurso | Claude Code | Codex CLI | Cursor | GitHub Copilot | opencode | Antigravity |
| --- | --- | --- | --- | --- | --- | --- |
| Instrucciones raiz | `CLAUDE.md` (168 lineas) | `AGENTS.md` (113 lineas) | `AGENTS.md` | `.github/copilot-instructions.md` (78 lineas) + `AGENTS.md` | `AGENTS.md` + global `~/.config/opencode/AGENTS.md` | `AGENTS.md` |
| Contenido identico al canon | OK (es el canon) | parcial (sin producto, stack, ground truth, python, estilo) | parcial (hereda de AGENTS.md) | parcial + markdown roto | parcial | parcial |
| Reglas por path glob (frontend/backend/testing) | OK via `.claude/rules/*.md` | X (Codex no soporta path globs como rules) | X (no existe `.cursor/rules/`) | X | X | X |
| Permisos de seguridad (`rm -rf`, `.env`) | OK via `.claude/settings.json` | X | X | X | X | X |
| Comandos slash opsx | OK via `.claude/commands/opsx/*` | via skills `$openspec-*` | OK via `.cursor/commands/opsx-*` | X (usar prompts) | OK via `.opencode/commands/opsx-*` | X |

### 2.2 MCP servers

| MCP server | `.mcp.json` (universal) | `.codex/config.toml` | `.cursor/mcp.json` |
| --- | --- | --- | --- |
| `github` | OK | X | X |
| `codegraph` | OK | X | X |
| `context7` | OK | X | X |
| `figma` | OK | X | X |
| `vercel` | OK | X | X |
| `expo` | OK | X | X |
| `planearia-sqlite` | OK | X | X |
| `playwright` | OK | OK | OK |
| `openaiDeveloperDocs` | X | OK (extra) | X |

Resultado operativo: Codex y Cursor no pueden invocar `github_issue_write`, `codegraph_explore`, `context7_query-docs`, las tools de Vercel, Expo, ni `planearia_sqlite_*` sin que el usuario las instale a mano fuera del repo. Las workflows SDD que esperan esos MCPs (enriquecer issue, blast radius, docs de libs, QA visual web, diagnostico SQLite) se caen o se degradan en esos harnesses.

Tambien: Codex carga `CLAUDE.md` y `.github/copilot-instructions.md` via `project_doc_fallback_filenames` (ver `.codex/config.toml:5`) pero sus MCPs no se reflejan de `.mcp.json`. Esta es la causa raiz de la divergencia de herramientas.

### 2.3 Skills

| Skill | `.claude/skills/` | `.codex/skills/` | `.agents/skills/` (cross) | opencode las ve | Cursor / Copilot / Antigravity |
| --- | --- | --- | --- | --- | --- |
| openspec-explore | OK | OK | - | via repo | X |
| openspec-propose | OK | OK | - | via repo | X |
| openspec-apply-change | OK | OK | - | via repo | X |
| openspec-sync-specs | OK | OK | - | via repo | X |
| openspec-archive-change | OK | OK | - | via repo | X |
| adversarial-review | OK | X | - | X | X |
| awwwards | OK | X | - | X | X |
| code-auditing | OK | X | - | X | X |
| enrich-us | OK | X | - | X | X |
| react-doctor | OK | X | - | via `.claude/skills/` (ruta inconsistente) | X |
| accessibility | - | X | OK | via repo | X |
| ai-gateway | - | X | OK | via repo | X |
| best-practices | - | X | OK | via repo | X |
| offline-sync | - | X | OK | via repo | X |
| testing | - | X | OK | via repo | X |
| token-efficiency | - | X | OK | via repo | X |
| ux-ui-design | - | X | OK | via repo | X |
| mvvm | - | X | X (vive en `~/.agents/skills/mvvm` global, NO en repo) | via global | X |

Correccion de inventario (verificada 2026-07-07): la columna combinada "Cursor / Copilot / Antigravity" arriba marca `X` en las 5 filas OpenSpec, pero `.cursor/skills/` **si** contiene esas 5 skills linkeadas (apply/archive/explore/propose/sync); la `X` aplica solo a Copilot y Antigravity. Ademas `impeccable` (presente en `.claude/skills/` y `.agents/skills/`) e `interview-me` (en `.agents/skills/`) existen como symlinks **gitignored**: no cuentan como fuente commiteada, por lo que el generador single-source debe decidir explicitamente si los materializa como espejos o los deja fuera de paridad.

Observacion extra: opencode referencia `react-doctor` desde `.claude/skills/react-doctor/SKILL.md` mientras las demas cross-agent skills se referencian desde `.agents/skills/`. Esta inconsistencia de ruta rompe el modelo "todas las cross-agent skills viven en `.agents/skills/`" y forzaria a cualquier sync script a conocer dos raices.

### 2.4 Workflows OpenSpec (5 comandos x 5 copias = 25 archivos)

| Fuente | Trigger | Frontmatter | Diferencias de cuerpo |
| --- | --- | --- | --- |
| `.claude/commands/opsx/apply.md` | `/opsx:apply` | `name`, `description`, `category`, `tags` | Refs `/opsx-continue` (no existe) y `/opsx-archive` |
| `.opencode/commands/opsx-apply.md` | `/opsx-apply` | solo `description` | Identico a Claude salvo frontmatter y trigger |
| `.cursor/commands/opsx-apply.md` | `/opsx-apply` | `name`, `id`, `category`, `description` | Identico a Claude salvo frontmatter y trigger |
| `.codex/skills/openspec-apply-change/SKILL.md` | `$openspec-apply-change` | `name`, `license`, `compatibility`, `metadata` | **Divergente**: sin `>` checkmarks, "ask the user directly" en vez de `AskUserQuestion tool`, refiere `openspec-continue-change` (no existe), `Ready to archive` en vez de "archive this change with /opsx:archive" |
| `.github/prompts/opsx-apply.prompt.md` | (sin slash; Copilot prompt) | solo `description` | Identico a Claude salvo frontmatter |

Lo mismo aplica a `archive`, `explore`, `propose`, `sync` (no verificados linea por linea en esta auditoria; el implementador debe diffearlos en el change SDD).

### 2.5 Validacion

| Comando | `CLAUDE.md` | `AGENTS.md` | `.github/copilot-instructions.md` |
| --- | --- | --- | --- |
| `npm run typecheck` | OK | OK | OK |
| `npm run lint -- --quiet` | OK | OK | OK |
| `npm test -- --runInBand` | OK | OK | OK |
| `npm run test:classroom` | OK | OK | X |
| `npm run test:planeaciones` | OK | OK | X |
| `npm run test:sync` | OK | OK | X |
| `npm run backend:check` | OK | OK | OK |
| Path Windows worktree (`--rootDir C:\Users\RitualBoatLaptop\Documents\Projects\PlanearIA`) | OK (en `testing.md`) | OK | X (rutas hardcodeadas distintas) |

---

## 3. Hallazgos Priorizados

### P0 - Bloqueantes de paridad

| # | Hallazgo | Evidencia | Impacto |
| --- | --- | --- | --- |
| P0.1 | **3 harnesses sin MCPs criticos** | `.codex/config.toml:10-19`, `.cursor/mcp.json:1-8` | Codex y Cursor no pueden enriquecer issues, hacer blast radius con codegraph, validar APIs con context7, inspeccionar SQLite, ni QA visual web fuera de Playwright |
| P0.2 | **Comando zombi `/opsx-continue` / `openspec-continue-change`** referenciado en los 5 harnesses | `.claude/commands/opsx/apply.md:47`, `.opencode/commands/opsx-apply.md:44`, `.cursor/commands/opsx-apply.md:47`, `.github/prompts/opsx-apply.prompt.md:44` (todos `state: "blocked" -> suggest ...continue`); `.codex/skills/openspec-apply-change/SKILL.md:51` | Cualquier agente que llegue a `state: "blocked"` sugiere un comando que no existe; el flujo se atasca |
| P0.3 | **`.github/copilot-instructions.md` con markdown roto** | lineas 5, 17-18, 24-28, 50-57, 71-76: backticks escapados como `\CLAUDE.md\`, `\aiGateway\`, bloque `\\\ash` en vez de ```` ```bash ```` | Copilot y Codex (que lo carga via `project_doc_fallback_filenames`) leen el doc corrupto y descartan los code fences |
| P0.4 | **Reglas por path solo activas en Claude Code** | `.claude/rules/{backend,frontend,testing}.md` existentes; `.cursor/rules/` no existe; Codex/opencode/Antigravity no soportan path globs de forma nativa | Editar `src/**/*.{ts,tsx}` o `backend/**/*.js` no dispara MVVM, colores de tokens, helmet/JWT, async-storage prohibido, indexing de MongoDB, etc. en esos harnesses |

### P1 - Paridad substancial

| # | Hallazgo | Evidencia | Impacto |
| --- | --- | --- | --- |
| P1.1 | **5 copias de cada workflow opsx sin sync** | 25 archivos en `.claude/commands/opsx/`, `.opencode/commands/`, `.cursor/commands/`, `.codex/skills/openspec-*`, `.github/prompts/` | Cualquier edicion futura de un workflow OpenSpec debe hacerse 5 veces; el drift es seguro |
| P1.2 | **`.codex/skills/` faltan las domain skills** | `.codex/skills/` solo tiene los 5 OpenSpec; `.claude/skills/` tiene 10 commiteadas | Codex no tiene adversarial-review, react-doctor, enrich-us, code-auditing, awwwards, ni las 7 cross-agent commiteadas de `.agents/skills/` (accessibility, ai-gateway, best-practices, offline-sync, testing, token-efficiency, ux-ui-design) |
| P1.3 | **Skills viven en 2 raices inconsistentes** | `.agents/skills/accessibility/SKILL.md` existe en repo; `.claude/skills/accessibility/SKILL.md` **no existe** (verificado 2026-07-07: accessibility solo vive en `.agents/skills/`). opencode referencia react-doctor desde `.claude/skills/react-doctor/SKILL.md` mientras accessibility desde `.agents/skills/` | el sync script debe manejar 2 raices; puede duplicar referencias |
| P1.4 | **Sin sincronizador de configs MCP** | no existe `scripts/syncAgentHarness.mjs` | cualquier nuevo MCP agregado a `.mcp.json` no se refleja en `.codex/config.toml` ni `.cursor/mcp.json` a menos que alguien lo copie a mano |
| P1.5 | **Sin gate CI de paridad** | no existe `.github/workflows/agent-harness-parity.yml` | un PR puede romper la paridad sin que nadie lo note hasta que otro agente falle en produccion |
| P1.6 | **`mvvm` skill no commiteada al repo** | `git ls-files .agents/skills/` no incluye `mvvm`; opencode la carga desde `~/.agents/skills/mvvm` global | cualquier IA que no use el perfil global dejaría de tener la skill MVVM que es core de la arquitectura |

### P2 - Calidad y mantenimiento

| # | Hallazgo | Evidencia | Impacto |
| --- | --- | --- | --- |
| P2.1 | **`CLAUDE.md` y `AGENTS.md` divergen en 5 secciones** | `CLAUDE.md` lineas 8-22 (Producto + experiencias), 24-37 (Stack detallado), 122-132 (Ground truth por modulo), 155-161 (Estilo), 162-168 (Python) no aparecen en `AGENTS.md` | Codex/OpenCode/Cursor/Antigravity trabajan sin contexto del producto objetivo ni del stack exacto |
| P2.2 | **Settings/permissions solo definidos en Claude** | `.claude/settings.json` deniega `rm -rf`, `.env*`; no hay equivalents en `.codex/config.toml`, `.cursor/`, `.opencode/` | los demas harnesses pueden leer `.env` o ejecutar `rm -rf` sin filtro |
| P2.3 | **`.github/copilot-instructions.md` lista solo 4 de 7 comandos de validacion** | lineas 71-76: no incluye `test:classroom`, `test:planeaciones`, `test:sync` | Copilot marca trabajo como validado cuando no corrio los tests focalizados |
| P2.4 | **Duplicacion dentro de Claude: `.claude/commands/opsx/*` y `.claude/skills/openspec-*/SKILL.md`** | `git ls-files` muestra ambos | ineccion de contexto doble para Claude |
| P2.5 | **Antigravity sin mapeo explicito** | el usuario confirmo que Antigravity lee `AGENTS.md` universal | funciona, pero al no existir doc onboarding (`Documentacion/02-operacion/AGENTES_IDES_PARIDAD.md` no existe antes de este reporte), un agente nuevo sin conocimiento del proyecto no sabria que MCPs/skills/rules esperar |
| P2.6 | **`mcp:test` valida handshake pero no paridad de configs** | `scripts/testMcpServers.mjs` (no leido en esta auditoria; el implementador debe confirmar) | `npm run mcp:test` puede pasar aunque `.cursor/mcp.json` solo tenga `playwright` |

---

## 4. Arquitectura Single Source Propuesta (aprobada por el usuario)

Decision del usuario (2026-07-07):

- **Fuente de workflows opsx** en `.agents/workflows/opsx/{apply,archive,explore,propose,sync}.md` (formato canonico neutral), espejos generados por `scripts/syncAgentHarness.mjs` hacia los 5 harnesses.
- **Fuente de skills compartidas** en `.agents/skills/` (repo). `.claude/skills/`, `.codex/skills/` contienen solo wrappers de redireccion o se linkean via symlink segun la plataforma soportada.
- **Fuente de MCP** en `.mcp.json` (universal). `.codex/config.toml` referencia el mismo set; `.cursor/mcp.json` se genera/espeja desde `.mcp.json`.
- **Antigravity**: AGENTS.md universal; no se crea config Antigravity separada.
- **Gate CI** `agent-harness-parity.yml` ejecuta `node scripts/syncAgentHarness.mjs --check` para romper PRs que rompan paridad.

Nivel objetivo (matriz post-implementacion):

| Recurso | Fuente unica | Espejos generados |
| --- | --- | --- |
| Instrucciones raiz | `AGENTS.md` (renombrado a "PlanearIA - Universal Agent Guide") | `CLAUDE.md` (envoltura ligera que referencia AGENTS.md); `.github/copilot-instructions.md` (envoltura ligera) |
| Reglas por path | `.agents/rules/{backend,frontend,testing}.md` | `.claude/rules/*` (formato Claude path glob), Generar `.cursor/rules/*.mdc` con `globs:` y `alwaysApply: false`, fallback AGENTS.md para Codex/opencode/Antigravity |
| Workflows opsx | `.agents/workflows/opsx/*.md` | `.claude/commands/opsx/*` (frontmatter Claude), `.opencode/commands/opsx-*` (frontmatter opencode), `.cursor/commands/opsx-*`, `.codex/skills/openspec-*` (skill trigger), `.github/prompts/opsx-*.prompt.md` |
| Skills compartidas | `.agents/skills/*/SKILL.md` | `.claude/skills/` y `.codex/skills/` con redireccion o copia sistemica |
| MCP servers | `.mcp.json` | `.codex/config.toml` (seccion `[mcp_servers.*]` generada), `.cursor/mcp.json` generado |
| Permisos | `.agents/permissions.json` (nuevo, formato neutral) | `.claude/settings.json` generado, equivalentes Codex/Cursor donde soporten |

---

## 5. Plan De Implementacion (no ejecutado; entrada para el change SDD)

El change OpenSpec que implemente esto debe crear, en este orden:

1. **Issue GitHub** (paso 0 SDD): "Unificar harness de agentes/IDEs para paridad total". Enrich con esta auditoria como body.
2. **`scripts/syncAgentHarness.mjs`** (single source of truth generator):
   - Lee `.agents/workflows/opsx/*.md`, `.agents/rules/*.md`, `.agents/skills/`, `.mcp.json`, `.agents/permissions.json`.
   - Genera los 25 workflows espejo, los `.cursor/rules/*.mdc`, `.claude/rules/*.md`, `.claude/settings.json`, `.codex/config.toml` (seccion `[mcp_servers]`), `.cursor/mcp.json`, `.github/copilot-instructions.md`, `.github/prompts/opsx-*.prompt.md`.
   - Acepta `--check` para CI: falla si algun espejo difiere del source.
3. **`.agents/workflows/opsx/{apply,archive,explore,propose,sync}.md`**: copiar el cuerpo canonico actual de `.claude/commands/opsx/*.md`, eliminar el comando zombi `/opsx-continue` y sustituir por "abrir issue de seguimiento y pausar".
4. **`.agents/rules/{backend,frontend,testing}.md`**: mover desde `.claude/rules/` con el mismo frontmatter de globs, agregar `alwaysApply: false` para CI/Cursor.
5. **`.agents/permissions.json`**: Nuevo, define denegados por harness en formato neutral.
6. **Rebrand de `AGENTS.md`** a "PlanearIA - Universal Agent Guide"; mover las 5 secciones faltantes desde `CLAUDE.md` (producto, stack, ground truth, estilo, python) en formato neutral. `CLAUDE.md` se reduce a envoltura: "Lee AGENTS.md. Especificos de Claude: settings/permissions, `/opsx:*`, skills en `.claude/skills/`".
   - Verificar que el rebrand no rompa `Documentacion/05-context-engineering/README.md:14` que referencia `AGENTS.md` o `CLAUDE.md` como ruta cero.
7. **`.github/copilot-instructions.md`**: reescribir sin markdown roto, corregir rutas, completar lista de validacion (7 comandos).
8. **`.codex/config.toml`**: agregar los 8 MCP servers de `.mcp.json` en formato `[mcp_servers.<name>]`; mantener `openaiDeveloperDocs` que es extra de Codex.
9. **`.cursor/mcp.json`**: agregar los 8 MCP servers.
10. **`.cursor/rules/`**: crear `PlanearIA.mdc`, `backend.mdc`, `frontend.mdc`, `testing.mdc` con frontmatter Cursor (`description`, `globs`, `alwaysApply`).
11. **`.codex/skills/`**: linkear/copiar las 10 skills faltantes desde `.agents/skills/` y `.claude/skills/` (las que no son OpenSpec); corregir la divergencia de las 5 OpenSpec (eliminar la ref a `openspec-continue-change`, alinear `AskUserQuestion` y los checkmarks con la fuente en `.agents/workflows/opsx/`).
12. **`.github/workflows/agent-harness-parity.yml`**: workflow que corre `node scripts/syncAgentHarness.mjs --check` y `npm run mcp:test -- --timeout=90000`. Rompe PRs que rompan paridad.
13. **`scripts/testMcpServers.mjs`**: extender para comparar `.mcp.json` con `.codex/config.toml` y `.cursor/mcp.json` (validar paridad de nombres, no solo handshake).
14. **Doc onboarding** (este archivo queda como referencia de auditoria; sustituir por la version vigente post-implementacion que describe como AGREGAR un nuevo IDE/IA en 3 pasos: (a) agregar entrada a `scripts/syncAgentHarness.mjs`, (b) especificar el frontmatter/ubicacion del espejo, (c) verificar con `npm run agent:harness:check`).
15. **Commit `mvvm` skill al repo**: mover desde `~/.agents/skills/mvvm/SKILL.md` a `.agents/skills/mvvm/SKILL.md` para que no dependa del perfil global.

Tareas de rollback: el gate CI arranca `--check` (no `--write`); cualquier espejo generado se puede regenerar con `npm run agent:harness:sync` y `git checkout` si el source se revierte.

---

## 6. Validacion Que Debe Correr El Implementador

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
npm run mcp:test -- --timeout=90000
node scripts/syncAgentHarness.mjs --check   # nuevo

npm run agent:harness:sync   # nuevo: regenera espejos
npm run agent:harness:check  # nuevo: termina con exit 1 si algun espejo difiere
```

Adicionalmente, validar manualmente en al menos 2 harnesses diferentes (Claude Code + Cursor) que:

- Editar `src/**/*.{ts,tsx}` activa automaticamente las reglas de frontend.
- Editar `backend/**/*.js` activa las reglas de backend.
- `/opsx:apply` (o equivalente por harness) aparece como comando y su flujo ejecuta sin sugerir `/opsx-continue`.
- `mcp:test` pasa con todos los servers declarados incluyendo los antes faltantes en Codex/Cursor.
- Las skills `adversarial-review`, `react-doctor`, `enrich-us`, `accessibility`, `mvvm` son descubribiles en todos los harnesses que soportan skills.

---

## 7. Riesgos Y Mitigaciones

| Riesgo | Mitigacion |
| --- | --- |
| El sync script se rompe y el gate CI bloquea todo el repo | Arrancar con `--check` mode de solo lectura; bin `--write` es opt-in manual. Si falla, el PR solo se alerta, no bloquea con `continue-on-error: true` en la primera semana |
| Un nuevo IDE que entre despues no soporta los formatos que genera el sync | Doc onboarding pide agregar 1 entrada al script y especificar frontmatter/ubicacion; el script es la unica pieza a tocar |
| Diferentes capacidades por harness (Codex no soporta path globs como rules) | El source `.agents/rules/*.md` define las reglas en formato `AGENTS.md`-compatible (sin globs en el cuerpo); los espejos que soportan globs los agregan en frontmatter, los que no los agregan leen como instrucciones generales |
| El usuario commitea un espejo generado y el sync script lo reescribe en el siguiente run | `.gitignore` no debe ignorar los espejos; el gate CI los regenera y comparte con `git diff`; el script es la autoridad |
| `mvvm` movida al repo rompe workflows de otros usuarios del perfil global | Mover con copia, no con movimiento; dejar el global como fallback y actualizar opencode para preferir el del repo |
| Skills OpenSpec cambian de formato en una version nueva del CLI | La fuente `.agents/workflows/opsx/*.md` debe ser generada desde `openspec instructions <accion>` si el CLI lo soporta, o mantenerse manual; documentarlo en el script |

---

## 8. Comando Zombi - Detalle

Para el implementador del change SDD, evidencia exacta del bug P0.2:

```
.claude/commands/opsx/apply.md:47           "suggest using `/opsx:continue`"
.opencode/commands/opsx-apply.md:44         "suggest using `/opsx:continue`"
.cursor/commands/opsx-apply.md:47          "suggest using `/opsx:continue`"
.github/prompts/opsx-apply.prompt.md:44    "suggest using `/opsx:continue`"
.codex/skills/openspec-apply-change/SKILL.md:51   "suggest using openspec-continue-change"
```

Busqueda de definicion del comando:

- `git ls-files | rg 'opsx-continue|openspec-continue-change'` retorna solo las referencias, no las definiciones (no hay `.claude/commands/opsx/continue.md`, no hay `.opencode/commands/opsx-continue.md`, no hay `.codex/skills/openspec-continue-change/`).

Accion correctiva en el change SDD: eliminar la referencia al comando zombi y reemplazar por "abrir un issue de seguimiento y pausar el apply".

---

## 9. Estado De Esta Auditoria

- Fecha: 2026-07-07.
- Metodo: lectura completa de los archivos de harness + mapeo de paridad por capacidad.
- Limitaciones: no se hizo diff linea por linea de los workflows `archive`, `explore`, `propose`, `sync` entre los 5 harnesses; el implementador debe hacerlo antes de mover a `.agents/workflows/opsx/` para no perpetuar divergencias no detectadas.
- Pendiente de: change OpenSpec formal (issue + proposal/design/spec/tasks) que reemplace este documento por la version "vigente" una vez ejecutado el plan de la seccion 5.

---

## 10. Como Agregar Una IA/IDE Nueva (procedimiento objetivo post-implementacion)

Una vez implementado el single source:

1. Abrir `scripts/syncAgentHarness.mjs` y agregar una entrada al objeto `HARNESSES` con: nombre, sentido de lectura (instrucciones raiz, MCP, skills, reglas, permisos), y el path/formato del espejo segun soporte el IDE.
2. Si el IDE lee `AGENTS.md` (mayoria 2025+), no requiere nada extra; solo agregar la entrada al script para el resto de espejos.
3. Si el IDE no soporta path-glob rules, las reglas de `.agents/rules/*.md` se embeben en `AGENTS.md` o la envoltura del IDE como seccion de texto plano (suficiente para que el modelo las aplique contextualmente al editar archivos de ese dominio).
4. Correr `npm run agent:harness:sync` para que el script genere los nuevos espejos; commitear el output.
5. Correr `npm run agent:harness:check` para confirmar paridad.
6. Si el IDE soporta MCP, validar con `npm run mcp:test` que los 8 servers responden en su transporte.
7. Documentar el nuevo IDE en la matriz de cobertura de este archivo (seccion 2) y en `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`.

Este procedimiento reemplaza cualquier decision ad hoc; cualquier IA futura que entre al repo sin seguirlo trabajara con context drift, lo cual el gate CI detectara.

---

## 11. Estado Vigente Post-Fase 1 (implementacion real)

Implementado en el change OpenSpec `single-source-agent-harness` (issue #41). Dos dominios distintos:

### 11.1 Project-owned (generador propio)

Fuente unica en `.agents/` -> espejos generados por `scripts/syncAgentHarness.mjs`:

- `.agents/instructions/{core,claude-header,agents-header,copilot}.md` -> `CLAUDE.md`, `AGENTS.md` (ambos ricos; `core.md` compartido garantiza contenido normativo identico), `.github/copilot-instructions.md`.
- `.agents/rules/{backend,frontend,testing}.md` -> `.claude/rules/*.md` (`paths:`), `.cursor/rules/*.mdc` (`globs`+`alwaysApply: false`), y bloque embebido en `AGENTS.md`.
- `.mcp.json` -> `.codex/config.toml` (`[mcp_servers.*]`) y `.cursor/mcp.json`.
- `.agents/permissions.json` -> `.claude/settings.json`.
- `.agents/skills/*` (menos `impeccable`) -> `.codex/skills/*`.

Comandos:

```bash
npm run agent:harness:sync    # regenera espejos (idempotente, normaliza EOL)
npm run agent:harness:check   # exit 1 si algun espejo difiere de la fuente
npm run mcp:parity            # nombres de MCP: .mcp.json vs codex/cursor
```

El generador preserva el bloque externo `<!-- CODEGRAPH_START/END -->` y NO toca los workflows opsx.
`impeccable` NO se versiona (100+ archivos de terceros): se reinstala con `npx skills add pbakaus/impeccable`.

### 11.2 opsx (propiedad del CLI de openspec)

Los archivos opsx (`.claude/commands/opsx`, `.claude/skills/openspec-*`, `.codex/skills/openspec-*`, `.cursor/commands/opsx-*`, `.opencode/commands/opsx-*`, `.github/prompts/opsx-*`) los genera la CLI oficial local, NO el generador del harness. OpenSpec 1.6.0 todavia reintroduce el comando zombi `/opsx:continue` y comandos que presuponen un binario global; el patch post-update los normaliza a una pausa accionable y a `npm exec --yes=false -- openspec`:

```bash
npm run openspec:check           # version local + config + validacion estricta
npm run agent:opsx:update        # CLI local fijada + patchOpsxWorkflows
npm run agent:opsx:patch:check   # exit 1 si queda CLI global o comando zombi
```

### 11.3 Gate CI

`.github/workflows/agent-harness-parity.yml` (modo suave, `continue-on-error`): corre `openspec:check` + `agent:harness:check` + `mcp:parity` + `agent:opsx:patch:check`. Cutover a hard-fail = quitar `continue-on-error` una vez estable.

### 11.4 Correccion a la seccion 4

`CLAUDE.md` **NO** se reduce a wrapper: `CLAUDE.md` y `AGENTS.md` quedan ambos ricos y generados desde `.agents/instructions/`.

### 11.5 Agregar un IDE nuevo (actualizado)

1. Si lee `AGENTS.md`: nada extra para instrucciones.
2. Para MCP/rules/permisos/skills: agregar el render del nuevo espejo en `scripts/syncAgentHarness.mjs`.
3. Para opsx: agregar el tool a `openspec init --tools` y correr `npm run agent:opsx:update`.
4. `npm run agent:harness:sync && npm run agent:harness:check` y commitear.
