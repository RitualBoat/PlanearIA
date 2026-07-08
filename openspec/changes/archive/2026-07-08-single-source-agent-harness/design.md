## Context

Nota: las reglas de design UI de PlanearIA (ground truth Figma, responsive por breakpoint, tokens de tema, reanimated, excelencia visual) **no aplican**: este change es tooling de repositorio, sin UI, sin runtime de producto, sin IA. Las decisiones abajo son de arquitectura de generacion y CI.

Estado actual (post Fase 0, commit `7af0847`): los bugs P0 estan resueltos a mano. Existen 6 harnesses (Claude Code, Codex CLI, Cursor, GitHub Copilot, opencode, Antigravity) con archivos duplicados y editados manualmente: 5 copias de cada workflow opsx, MCP declarado en 3 formatos, reglas por path solo en Claude, skills en 2 raices mas symlinks gitignored (`impeccable`, `interview-me`) y una skill core (`mvvm`) solo en el perfil global. No hay generador ni gate. Fuente de evidencia: `Documentacion/02-operacion/AGENTES_IDES_PARIDAD.md`.

Restriccion de entorno: desarrollador solo, presupuesto bajo/cero, Windows-first (CRLF, sin symlinks confiables en git). CI en GitHub Actions.

## Goals / Non-Goals

**Goals:**
- Una fuente unica neutral (`.agents/` + `.mcp.json`) de la que se generan todos los espejos por harness.
- Un generador determinista e idempotente con `--check` (CI) y `--write` (local).
- Un gate CI que detecta drift, con arranque suave para no bloquear el repo por un bug del script.
- Paridad real de MCP, reglas por path, workflows opsx, skills y permisos entre los harnesses que soporten cada capacidad.
- Procedimiento objetivo para agregar un IDE nuevo (una entrada en el registro + sync/check).

**Non-Goals:**
- Nuevos MCP servers o IDEs fuera de los 6 auditados.
- Cambiar la logica interna de las skills.
- Reducir `CLAUDE.md` a wrapper (revertido en la entrevista).
- Cualquier cambio de runtime de producto.

## Decisions

### D1. Fuente neutral en `.agents/`, no CLAUDE.md como canon
La verdad vive en `.agents/` (instrucciones en secciones, workflows opsx, rules, skills, permisos) y `.mcp.json`. **Alternativa considerada**: usar `CLAUDE.md` como canon y derivar el resto. **Rechazada** porque privilegia un harness, mantiene el acoplamiento actual y el usuario decidio que `CLAUDE.md` y `AGENTS.md` sean ambos ricos y generados. La fuente neutral desacopla el contenido del formato de cada harness.

### D2. El generador materializa copias; nunca symlinks
`syncAgentHarness.mjs` escribe archivos reales. **Alternativa**: symlinks desde `.claude/skills/` a `.agents/skills/` (como hoy `impeccable`). **Rechazada** por Windows/git: los symlinks son fragiles, ya estan gitignored y rompen en clones limpios. Materializar cuesta duplicacion en disco pero es portable y el gate garantiza que no divergen.

### D3. `--check` compara render esperado contra archivos en disco
El script renderiza en memoria el contenido esperado de cada espejo y lo compara contra el archivo commiteado; si difiere, imprime el diff y sale con codigo != 0. **Alternativa**: guardar hashes en un manifest. **Rechazada**: el diff textual es mas depurable y no agrega un artefacto de estado que tambien podria desfasarse.

### D4. Idempotencia y normalizacion EOL
`--write` es punto fijo: render deterministico (orden estable de claves, sin timestamps) y normalizacion de fin de linea a la convencion del repo antes de escribir/comparar, para no producir diffs espurios por CRLF en Windows. Se valida en CI con doble `--write` seguido de `git diff` vacio.

### D5. Adaptadores de formato por harness en un registro `HARNESSES`
Un objeto declarativo por harness define: que fuentes lee y, por cada tipo de espejo, la ruta destino y una funcion de render (frontmatter + cuerpo). Agregar un IDE = agregar una entrada. Los cuerpos canonicos son compartidos; solo cambian frontmatter/trigger y, donde el harness no soporta una capacidad (p. ej. path-globs), la proyeccion a texto embebido.

### D6. Los workflows opsx son propiedad del CLI de openspec (delegar + patch), NO del generador
Hallazgo verificado durante apply: los 30 archivos opsx (5 workflows x 6 harnesses) los genera y mantiene el propio CLI `openspec` (`openspec init --tools ...` / `openspec update`), con `generatedBy: "1.5.0"` en su frontmatter. Correr `openspec update --force` regenera los 30 y **reintroduce el comando zombi** (`opsx:continue` / `openspec-continue-change`), que resulta ser un bug de las plantillas upstream de OpenSpec, no un drift de PlanearIA. **Alternativa considerada**: que el generador de este change posea los opsx desde `.agents/workflows/opsx/`. **Rechazada** (decision del usuario): pelearia contra `openspec update`, perderia mejoras futuras del CLI y obligaria a re-generar tras cada update. **Decision**: la paridad de opsx se delega a `openspec update` con la version de openspec pineada, seguido de un patch post-update (`scripts/patchOpsxZombie.mjs`) que elimina la linea del comando continue inexistente; ademas se reporta el bug upstream con `openspec feedback`. El generador `syncAgentHarness.mjs` NO toca archivos opsx. `.agents/workflows/opsx/` se elimina.

### D7. CLAUDE.md/AGENTS.md identicos; copilot-instructions es proyeccion compacta
La fuente neutral tiene todas las secciones. `CLAUDE.md` y `AGENTS.md` renderizan el set completo y el gate verifica que su contenido normativo es identico. `.github/copilot-instructions.md` es una proyeccion **compacta** deliberada (asistente ligero), con un mapeo documentado de que secciones incluye; no entra en la verificacion de identidad, solo en la de "generado desde la misma fuente".

### D8. Paridad MCP sin dependencia TOML nueva
Como el generador escribe `.codex/config.toml`, controla su formato. La verificacion de paridad en `testMcpServers.mjs` solo necesita los **nombres** de server: se extraen los headers `[mcp_servers.<name>]` con parser minimo y se comparan contra `.mcp.json` y `.cursor/mcp.json`. **Alternativa**: agregar `smol-toml`. **Diferida** para respetar presupuesto/deps; si en el futuro se necesita parseo TOML completo, se agrega esa dependencia pequena.

### D9. Gate CI suave primero, luego duro
`agent-harness-parity.yml` corre `--check` + `mcp:test`. Arranca con `continue-on-error: true` (alerta, no bloquea) y, tras estabilizar, se quita para hard-fail. **Alternativa**: hard-fail desde el dia uno. **Rechazada**: un bug del generador bloquearia todos los merges del repo.

## Risks / Trade-offs

- Bug del generador bloquea el repo -> Mitigacion: arranque suave (`continue-on-error`), `--check` es read-only, `--write` es opt-in manual.
- Consolidar los 5 workflows opsx pierde divergencias utiles -> Mitigacion: diff linea por linea previo (D6) antes de mover a `.agents/`.
- Mover `mvvm` desde el perfil global rompe otros usuarios -> Mitigacion: copiar (no mover) al repo; dejar el global como fallback.
- Materializar copias duplica contenido -> Mitigacion aceptada: el gate garantiza no-divergencia; el costo en disco es marginal.
- Un mantenedor edita un espejo a mano y lo commitea -> Mitigacion: el script es la autoridad; el gate detecta el diff y la doc explica editar la fuente en `.agents/`.
- Harness sin enforcement de permisos (Codex/opencode/Antigravity) -> Mitigacion: las denegaciones se proyectan como texto de guia en sus instrucciones, no se descartan en silencio.

## Migration Plan

Orden de implementacion (detalle en tasks.md):
1. Crear la fuente neutral en `.agents/` a partir de los archivos actuales (instrucciones, workflows, rules, permisos) sin cambiar comportamiento.
2. Materializar skills (`impeccable`, `interview-me`, `mvvm`) y ajustar `.gitignore`.
3. Escribir `syncAgentHarness.mjs` + scripts npm; generar espejos y verificar que `--write` reproduce lo actual (diff minimo esperado).
4. Extender `testMcpServers.mjs` (paridad de nombres).
5. Agregar el gate CI en modo suave.
6. Actualizar docs (`AGENTES_IDES_PARIDAD.md` §4 + estado vigente, `MCP_FLUJOS_PLANEARIA.md`).
7. Validacion manual en Claude Code + Cursor.

Rollback: `--check` no escribe nada; los espejos se regeneran con `npm run agent:harness:sync` y se revierten con `git checkout`. Si el gate molesta, permanece en `continue-on-error` hasta estabilizar. El cutover a hard-fail es un cambio de una linea reversible.

## Open Questions

- Estructura exacta de `.agents/instructions/`: un archivo unico con marcadores de seccion vs. parciales por seccion ensamblados. Preferencia: parciales, para que copilot pueda seleccionar un subconjunto. A confirmar en apply.
- Confirmar que Antigravity solo lee `AGENTS.md` universal (sin config propia) antes de omitir su espejo dedicado.
- Definir el umbral/senal para el cutover del gate de suave a hard-fail (p. ej. N PRs verdes consecutivos).
