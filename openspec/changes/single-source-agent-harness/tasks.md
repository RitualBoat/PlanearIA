## 1. Fuente neutral en `.agents/`

- [ ] 1.1 Crear `.agents/instructions/` con las secciones neutrales (producto, stack, reglas arquitectonicas, lectura por defecto, OpenSpec SDD, MCP, ground truth, validacion, estilo, python) extraidas de `CLAUDE.md` y `AGENTS.md` sin cambiar el contenido normativo
- [ ] 1.2 Diffear linea por linea las 5 copias de cada workflow opsx (`apply`/`archive`/`explore`/`propose`/`sync`) y consolidar el cuerpo canonico en `.agents/workflows/opsx/*.md`, eliminando toda referencia al comando continue inexistente
- [ ] 1.3 Mover las reglas por path a `.agents/rules/{backend,frontend,testing}.md` en formato neutral, con metadata de `globs` para los harnesses que la soporten
- [ ] 1.4 Crear `.agents/permissions.json` con las denegaciones neutrales (`rm -rf`, lectura de `.env*`, etc.)

## 2. Skills parity

- [ ] 2.1 Materializar `impeccable`, `interview-me` y `mvvm` como archivos reales en `.agents/skills/` (copiar `mvvm` desde `~/.agents/skills/mvvm` sin borrar el global)
- [ ] 2.2 Quitar `impeccable`/`interview-me`/`mvvm` del `.gitignore` y confirmar que quedan trackeadas por git

## 3. Generador `scripts/syncAgentHarness.mjs`

- [ ] 3.1 Definir el registro declarativo `HARNESSES` (fuentes que lee y, por tipo de espejo, ruta destino + funcion de render)
- [ ] 3.2 Render de instrucciones raiz: `CLAUDE.md` y `AGENTS.md` ricos e identicos en contenido normativo; `.github/copilot-instructions.md` como proyeccion compacta con mapeo documentado
- [ ] 3.3 Render de los 5 workflows opsx a sus espejos (`.claude/commands/opsx/*`, `.opencode/commands/opsx-*`, `.cursor/commands/opsx-*`, `.codex/skills/openspec-*`, `.github/prompts/opsx-*`) con frontmatter/trigger por harness
- [ ] 3.4 Render de reglas por path: `.claude/rules/*`, `.cursor/rules/*.mdc` (`globs` + `alwaysApply: false`) y embebido como texto en `AGENTS.md` para harnesses sin path-globs
- [ ] 3.5 Render de MCP: generar `.codex/config.toml` (seccion `[mcp_servers.*]`, conservando `openaiDeveloperDocs`) y `.cursor/mcp.json` desde `.mcp.json`
- [ ] 3.6 Render de permisos: generar `.claude/settings.json` desde `.agents/permissions.json`; proyectar denegaciones como texto de guia donde el harness no soporta enforcement
- [ ] 3.7 Espejar skills a `.claude/skills/` y `.codex/skills/` segun soporte de cada harness
- [ ] 3.8 Implementar `--write` (deterministico, orden estable, normalizacion EOL) y `--check` (imprime diff y sale con codigo != 0 si algun espejo difiere)
- [ ] 3.9 Agregar scripts npm `agent:harness:sync` (= `--write`) y `agent:harness:check` (= `--check`) en `package.json`

## 4. Validacion de paridad MCP

- [ ] 4.1 Extender `scripts/testMcpServers.mjs` para extraer los nombres `[mcp_servers.<name>]` de `.codex/config.toml` y las claves de `.cursor/mcp.json`, compararlos con `.mcp.json` (Codex puede tener extras) y fallar si falta alguno

## 5. Gate CI

- [ ] 5.1 Crear `.github/workflows/agent-harness-parity.yml` que corre `agent:harness:check` + `npm run mcp:test` con `continue-on-error: true` (modo suave)
- [ ] 5.2 Documentar en el workflow y en el doc de operacion la senal de cutover a hard-fail (p. ej. N PRs verdes consecutivos)

## 6. Documentacion

- [ ] 6.1 Actualizar `Documentacion/02-operacion/AGENTES_IDES_PARIDAD.md`: reescribir seccion 4 (supersede wrapper: CLAUDE.md y AGENTS.md ambos ricos), pasar estado a "vigente" y dejar operativo el procedimiento "como agregar un IDE nuevo"
- [ ] 6.2 Actualizar `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md` (generador + gate) y verificar que el rebrand no rompe referencias en `Documentacion/05-context-engineering/README.md`

## 7. Verificacion y evidencia

- [ ] 7.1 Idempotencia: correr `npm run agent:harness:sync` dos veces y confirmar `git diff` vacio tras la segunda
- [ ] 7.2 Correr `openspec validate --change single-source-agent-harness --strict`, `npm run mcp:test -- --timeout=90000`, `npm run agent:harness:check`, y `npm run typecheck`/`lint` (sanity, aunque el change no toca fuente TS)
- [ ] 7.3 Validacion manual en Claude Code + Cursor: editar `src/**/*.{ts,tsx}` activa rules de frontend; editar `backend/**/*.js` activa rules de backend; `/opsx:apply` (o equivalente) no sugiere el comando zombi. Adjuntar evidencia al issue #41
- [ ] 7.4 Gate de QA visual de navegador: N/A justificado (este change es tooling de repositorio y no toca ninguna pantalla visible ni superficie UI; no hay nada que validar por breakpoint). Evidencia sustituta: gate CI verde + la validacion 2-harness de 7.3
