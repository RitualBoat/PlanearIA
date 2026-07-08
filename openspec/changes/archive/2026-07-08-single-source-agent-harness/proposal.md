## Why

Cada harness de agente/IDE (Claude Code, Codex CLI, Cursor, GitHub Copilot, opencode, Antigravity) recibe hoy un subconjunto distinto de contexto, MCP, reglas por path, workflows OpenSpec y skills, mantenido a mano y sin verificacion. La Fase 0 (issue #41, commit `7af0847`) tapo los bugs P0 puntualmente, pero mientras no exista una fuente unica generadora y un gate, cualquier cambio futuro vuelve a desfasar los espejos y reaparece el context drift y los bugs de paridad silenciosos. Referencia: `Documentacion/02-operacion/AGENTES_IDES_PARIDAD.md`.

## What Changes

- Se define una **fuente unica neutral** en `.agents/` (instrucciones raiz, workflows opsx, reglas por path, skills, permisos) mas `.mcp.json` como canon MCP.
- Se agrega un **generador determinista** `scripts/syncAgentHarness.mjs` (`--check` / `--write`) que produce los espejos por harness y es idempotente (segundo `--write` = 0 diff).
- Se agrega un **gate CI** `agent-harness-parity.yml` que corre `--check` + `mcp:test`; arranca en modo suave (`continue-on-error`) y pasa a hard-fail una vez estable.
- Las reglas por path (`backend`/`frontend`/`testing`) pasan a estar disponibles en **todos** los harnesses (globs donde el harness los soporta; texto embebido en `AGENTS.md` donde no).
- **BREAKING (interno para mantenedores):** `.claude/commands/opsx/*`, `.opencode/commands/opsx-*`, `.cursor/commands/opsx-*`, `.codex/skills/openspec-*`, `.github/prompts/opsx-*`, `.codex/config.toml`, `.cursor/mcp.json`, `.claude/settings.json`, `CLAUDE.md`, `AGENTS.md` y `.github/copilot-instructions.md` dejan de editarse a mano: pasan a ser **artefactos generados**. Editarlos directamente sera revertido por el generador y detectado por el gate.
- `CLAUDE.md` y `AGENTS.md` quedan ambos **ricos y verificados identicos** desde la fuente neutral. Esto **supersede la seccion 4** del doc de auditoria (que proponia reducir `CLAUDE.md` a wrapper).
- Skills parity: `impeccable`, `interview-me` y `mvvm` se materializan y commitean en `.agents/skills/` (dejan de ser symlinks gitignored / dependencia del perfil global) y se espejan a los harnesses con soporte.
- `scripts/testMcpServers.mjs` se extiende para validar **paridad de nombres** de MCP entre `.mcp.json`, `.codex/config.toml` y `.cursor/mcp.json`, no solo el handshake.

## Capabilities

### New Capabilities
- `agent-harness-parity`: fuente unica neutral + generador + gate que garantizan que todos los harnesses de agente/IDE reciben el mismo contexto, MCP, reglas por path, workflows OpenSpec, skills y permisos, con drift detectable en CI y un procedimiento objetivo para agregar un IDE nuevo.

### Modified Capabilities
<!-- Ninguna. El generador es aditivo: no cambia los requisitos de `ai-friendly-repository-context` ni de `agent-knowledge-graph-policy`; los complementa garantizando paridad de los entrypoints que esas specs ya asumen. -->

## Impact

- **Codigo/tooling nuevo**: `scripts/syncAgentHarness.mjs`, `.github/workflows/agent-harness-parity.yml`, scripts npm `agent:harness:sync` / `agent:harness:check` en `package.json`, extension de `scripts/testMcpServers.mjs`.
- **Fuente nueva**: `.agents/instructions/`, `.agents/workflows/opsx/*`, `.agents/rules/*`, `.agents/permissions.json`, y `.agents/skills/{impeccable,interview-me,mvvm}` materializadas.
- **Generados (dejan de editarse a mano)**: todos los espejos por harness listados en What Changes.
- **`.gitignore`**: se quitan `impeccable`, `interview-me`, `mvvm` del ignore; los espejos generados no se ignoran.
- **Docs**: `Documentacion/02-operacion/AGENTES_IDES_PARIDAD.md` (actualizar seccion 4, estado a "vigente", procedimiento de "agregar IDE") y `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`. Verificar referencias en `Documentacion/05-context-engineering/README.md`.
- **Relacion con specs existentes**: complementa `ai-friendly-repository-context` (entrypoints de agente) y `agent-knowledge-graph-policy` (routing GitNexus/CodeGraph) sin modificar sus requisitos.
- **Sin impacto de runtime de producto**: no toca endpoints, `userId`, offline-first, sync ni el gateway de IA.

## No Objetivos (fuera de alcance)

- Agregar nuevos MCP servers o nuevos IDEs mas alla de los 6 auditados.
- Cambiar la logica interna de las skills.
- Migrar el transporte de ningun MCP existente.
- Re-arreglar los bugs P0 de la Fase 0 (ya resueltos en el commit `7af0847`).
- Reducir `CLAUDE.md` a un wrapper delgado (decision revertida en la entrevista 2026-07-07).
- No aplica un plan maestro de producto de `Documentacion/01-planes-maestros`: el driver de este change es la auditoria `Documentacion/02-operacion/AGENTES_IDES_PARIDAD.md` y el issue #41.
