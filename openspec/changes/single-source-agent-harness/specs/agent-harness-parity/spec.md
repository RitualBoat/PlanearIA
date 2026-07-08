## ADDED Requirements

### Requirement: Fuente unica neutral define la configuracion de todos los harnesses
La configuracion canonica de harness SHALL residir en `.agents/` (instrucciones raiz, workflows opsx, reglas por path, skills, permisos) y en `.mcp.json` (canon MCP). Todo archivo por harness SHALL ser un artefacto generado desde esa fuente, nunca editado a mano como fuente de verdad.

#### Scenario: Editar la fuente propaga a los espejos
- **WHEN** un mantenedor edita un archivo fuente bajo `.agents/` y ejecuta el generador con `--write`
- **THEN** todos los espejos por harness afectados quedan actualizados para coincidir con la fuente

#### Scenario: El espejo generado no es autoridad
- **WHEN** un mantenedor edita directamente un archivo generado por harness
- **THEN** el generador con `--write` sobrescribe la edicion manual y el gate con `--check` reporta el drift

### Requirement: El generador es determinista e idempotente
El generador `scripts/syncAgentHarness.mjs` SHALL producir salida identica byte a byte entre ejecuciones dado un source sin cambios; un segundo `--write` SHALL producir cero diff.

#### Scenario: Doble escritura sin cambios
- **WHEN** `--write` se ejecuta dos veces sin cambiar ninguna fuente
- **THEN** `git status` no reporta cambios despues de la segunda ejecucion

#### Scenario: Normalizacion de fin de linea en Windows
- **WHEN** un espejo destino usa CRLF en Windows
- **THEN** el generador normaliza los fines de linea para no producir un diff espurio

### Requirement: El gate CI detecta drift de paridad
El workflow CI `agent-harness-parity.yml` SHALL ejecutar el generador en modo `--check` mas la validacion de paridad de nombres de MCP, y SHALL fallar (o alertar, en modo suave) cuando un espejo difiera de su fuente.

#### Scenario: Espejo desfasado en un PR
- **WHEN** un PR contiene un espejo que difiere de su fuente
- **THEN** `--check` termina con codigo distinto de cero e imprime el diff

#### Scenario: Arranque suave
- **WHEN** el gate esta en su modo suave inicial (`continue-on-error`)
- **THEN** un drift detectado se reporta como anotacion no bloqueante en vez de bloquear el merge

#### Scenario: Todo en paridad
- **WHEN** todos los espejos coinciden con sus fuentes
- **THEN** `--check` termina con codigo cero

### Requirement: Paridad de MCP entre harnesses
`.codex/config.toml` y `.cursor/mcp.json` SHALL exponer los mismos nombres de server que `.mcp.json` (Codex MAY conservar servers extra), y la paridad SHALL ser validada por `scripts/testMcpServers.mjs`.

#### Scenario: Verificacion de paridad de nombres
- **WHEN** se ejecuta `npm run mcp:test`
- **THEN** verifica que cada nombre de server de `.mcp.json` este presente en `.codex/config.toml` y `.cursor/mcp.json`, y falla si falta alguno

#### Scenario: Server extra de Codex permitido
- **WHEN** Codex declara `openaiDeveloperDocs`, que no esta en `.mcp.json`
- **THEN** la verificacion de paridad no falla por ese server extra

### Requirement: Las reglas por path llegan a todos los harnesses
Las reglas de `backend`/`frontend`/`testing` SHALL estar disponibles en todos los harnesses: como reglas nativas por glob donde el harness las soporta y embebidas como texto en `AGENTS.md` donde no.

#### Scenario: Claude editando frontend
- **WHEN** se edita un archivo que coincide con `src/**/*.{ts,tsx}` en Claude Code
- **THEN** las reglas de frontend se aplican automaticamente

#### Scenario: Cursor editando backend
- **WHEN** se edita un archivo que coincide con `backend/**/*.js` en Cursor
- **THEN** las reglas de backend se aplican via `.cursor/rules/*.mdc` (con `globs` y `alwaysApply: false`)

#### Scenario: Harness sin soporte de globs
- **WHEN** un harness sin path-globs (Codex/opencode/Antigravity) carga sus instrucciones raiz
- **THEN** las mismas reglas estan presentes como texto embebido en `AGENTS.md`

### Requirement: Las instrucciones raiz quedan ricas e identicas en CLAUDE.md y AGENTS.md
`CLAUDE.md` y `AGENTS.md` SHALL generarse desde la fuente neutral de instrucciones y SHALL contener el mismo contenido normativo; ninguno se reduce a wrapper.

#### Scenario: Paridad de contenido
- **WHEN** el gate se ejecuta
- **THEN** verifica que `CLAUDE.md` y `AGENTS.md` incluyen las mismas secciones normativas y falla si uno omite contenido que el otro tiene

### Requirement: Los workflows opsx se generan por el CLI de openspec y quedan sin comando zombi
Los cinco workflows opsx en los 6 harnesses SHALL mantenerse via `openspec update` con la version de openspec pineada (no via el generador de este change, que no los posee), y un paso de patch post-update SHALL eliminar la referencia al comando continue inexistente que emiten las plantillas upstream de OpenSpec 1.5.0.

#### Scenario: Sin comando zombi tras update + patch
- **WHEN** se corre `openspec update` seguido del patch post-update
- **THEN** ningun archivo de harness referencia `opsx:continue`, `opsx-continue` u `openspec-continue-change`

#### Scenario: Paridad de opsx verificada en CI
- **WHEN** el gate corre `openspec update` + patch y luego `git diff --exit-code`
- **THEN** falla si los archivos opsx commiteados difieren de la salida generada+parcheada (drift de version del CLI o edicion manual)

#### Scenario: Guia del estado bloqueado
- **WHEN** el apply alcanza `state: "blocked"` (tras el patch)
- **THEN** la guia es listar los artefactos faltantes, abrir un issue de seguimiento y pausar

### Requirement: Las skills compartidas project-owned estan commiteadas y espejadas
`interview-me` y `mvvm` SHALL estar commiteadas bajo `.agents/skills/` (no solo en el perfil global) y espejadas a los harnesses que soportan skills. `impeccable`, por ser una herramienta de diseno de terceros de 100+ archivos re-instalable via `npx skills add pbakaus/impeccable`, SHALL mantenerse local/gitignored y su paridad se documenta como reinstalacion, no como vendoring (evita bloat y respeta la politica de `.gitignore`).

#### Scenario: Skill project-owned descubrible
- **WHEN** un harness con soporte de skills carga el repo
- **THEN** `mvvm` e `interview-me` son descubribles desde archivos commiteados del repo

#### Scenario: Sin dependencia del perfil global
- **WHEN** se usa un clon limpio sin el perfil global `~/.agents/`
- **THEN** `mvvm` sigue presente en el repo

#### Scenario: Skill de terceros por reinstalacion
- **WHEN** un harness necesita `impeccable` en un clon limpio
- **THEN** el doc de onboarding indica instalarla con `npx skills add pbakaus/impeccable` (no se versiona)

### Requirement: Los permisos se declaran una vez y se aplican donde el harness lo soporta
Las denegaciones de seguridad (por ejemplo `rm -rf`, lectura de `.env*`) SHALL declararse en `.agents/permissions.json` y generarse hacia `.claude/settings.json` y cualquier harness que soporte enforcement.

#### Scenario: Claude aplica las denegaciones
- **WHEN** el generador se ejecuta
- **THEN** `.claude/settings.json` deniega los patrones destructivos y de acceso a secretos configurados

#### Scenario: Harness sin soporte de enforcement
- **WHEN** un harness no puede aplicar permisos por configuracion
- **THEN** las denegaciones aparecen como guia documentada en sus instrucciones en vez de descartarse en silencio

### Requirement: Agregar un IDE/harness nuevo sigue un procedimiento objetivo
El sistema SHALL documentar un procedimiento para agregar un harness nuevo agregando una sola entrada al registro del generador y corriendo sync y check.

#### Scenario: Onboarding de un harness nuevo
- **WHEN** un mantenedor agrega una entrada de harness al registro del generador y corre `npm run agent:harness:sync` y luego `npm run agent:harness:check`
- **THEN** los nuevos espejos se generan y la verificacion de paridad pasa
