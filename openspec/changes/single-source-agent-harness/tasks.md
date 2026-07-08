## 1. Fuente neutral en `.agents/` (project-owned)

- [x] 1.1 Crear `.agents/instructions/` con `core.md` (cuerpo normativo compartido), `claude-header.md`, `agents-header.md` y `copilot.md` (proyeccion compacta)
- [x] 1.3 Mover las reglas por path a `.agents/rules/{backend,frontend,testing}.md` en formato neutral con frontmatter `description` + `globs`
- [x] 1.4 Crear `.agents/permissions.json` con las denegaciones neutrales (`rm -rf`, lectura de `.env*`)
- [x] 1.5 (reemplaza 1.2) Eliminar `.agents/workflows/opsx/`: los workflows opsx son propiedad del CLI de openspec (grupo 4)

## 2. Skills parity

- [x] 2.1 Materializar `interview-me` y `mvvm` en `.agents/skills/` (`mvvm` copiada desde `~/.agents/skills/mvvm`). `impeccable` queda local (100+ archivos de terceros, re-instalable) por decision de diseno
- [x] 2.2 Ajustar `.gitignore`: versionar `.agents/instructions|rules|permissions.json|skills` (interview-me, mvvm); mantener `impeccable` ignorado

## 3. Generador `scripts/syncAgentHarness.mjs` (solo project-owned)

- [x] 3.1 Registro de espejos (fuente -> destino + render) para instrucciones, rules, MCP y permisos. No incluye workflows opsx
- [x] 3.2 Render de instrucciones: `CLAUDE.md`/`AGENTS.md` desde header + `core.md` (+ rules embebidas en AGENTS.md); copilot desde `copilot.md`; bloque `CODEGRAPH_START/END` preservado
- [x] 3.3 Render de rules: `.claude/rules/*.md` (`paths:`) y `.cursor/rules/*.mdc` (`description`+`globs`+`alwaysApply: false`)
- [x] 3.4 Render de MCP: `.codex/config.toml` (`[mcp_servers.*]`, conserva `openaiDeveloperDocs`) y `.cursor/mcp.json` desde `.mcp.json`
- [x] 3.5 Render de permisos: `.claude/settings.json` desde `.agents/permissions.json`
- [x] 3.6 Espejar skills project-owned a `.codex/skills/` (recursivo; excluye `impeccable` y `openspec-*`). 11 archivos versionados; `--check` en paridad (23 mirrors)
- [x] 3.7 `--write` (deterministico, normaliza EOL) y `--check` (diff + exit != 0). Idempotencia verificada
- [x] 3.8 Scripts npm `agent:harness:sync` / `agent:harness:check` en `package.json`

## 4. Workflows opsx: delegar a openspec + patch + upstream

- [x] 4.1 `scripts/patchOpsxZombie.mjs`: tras `openspec update`, elimina la linea del comando continue inexistente en los 6 harnesses (idempotente; `--check` para CI). Verificado end-to-end
- [x] 4.2 Pin de openspec en el call-site: `agent:opsx:update` usa `npx openspec@1.5.0`. devDependency formal omitida a proposito (evita bloat; el pin da reproducibilidad)
- [ ] 4.3 Reportar el zombi upstream: `openspec feedback` esta roto (bug de su lado: label 'feedback' inexistente). Reporte redactado para presentar manual en `openspecio/openspec`

## 5. Validacion de paridad MCP

- [x] 5.1 `scripts/testMcpServers.mjs --parity-only`: compara nombres de `.mcp.json` vs `.codex/config.toml` y `.cursor/mcp.json` (Codex puede tener extras). Script npm `mcp:parity`

## 6. Gate CI

- [x] 6.1 `.github/workflows/agent-harness-parity.yml` (modo suave): `agent:harness:check` + `mcp:parity` + `agent:opsx:patch:check`. El `openspec update + git diff` completo queda como paso local (`agent:opsx:update`) por fragilidad EOL/version en CI
- [x] 6.2 Senal de cutover a hard-fail documentada en el header del workflow (quitar `continue-on-error` una vez estable)

## 7. Documentacion

- [x] 7.1 `AGENTES_IDES_PARIDAD.md`: nota de estado Fase 0/1 + seccion 11 (dominios project-owned vs opsx-CLI, comandos, gate, correccion §4, procedimiento "agregar IDE" actualizado)
- [x] 7.2 `MCP_FLUJOS_PLANEARIA.md` actualizado (generador + `mcp:parity` + gate). Referencias en `05-context-engineering/README.md` verificadas: usan `AGENTS.md`/`CLAUDE.md` por nombre, siguen validas

## 8. Verificacion y evidencia

- [x] 8.1 Idempotencia: segundo `agent:harness:sync` = 0 cambios; diff de `CLAUDE.md`/`AGENTS.md` regenerados sin perdida normativa (solo fix de mojibake + secciones enriquecidas + bloque codegraph preservado)
- [x] 8.2 Corridos `openspec validate --strict`, `npm run mcp:parity`, `npm run agent:harness:check`, `npm run typecheck`; los 3 checks del gate pasan en Linux CI
- [ ] 8.3 (parcial) Verificacion estructural proxy hecha (globs `.mdc` de Cursor, `paths:` de Claude, rules embebidas en AGENTS.md, opsx sin zombi). Falta la comprobacion UI en vivo en Claude Code + Cursor (requiere sesion interactiva del usuario)
- [x] 8.4 Gate de QA visual de navegador: N/A justificado (tooling de repositorio, sin pantalla visible). Evidencia sustituta: gate CI + validacion 2-harness
