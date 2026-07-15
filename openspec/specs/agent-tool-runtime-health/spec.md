# agent tool runtime health Specification

## Purpose

Define which agent tools belong to PlanearIA's active MCP baseline, how their configuration is validated, and how manual local tooling stays outside blocking harness health checks.

## Requirements

### Requirement: Baseline MCP activo excluye Graphify
La fuente canónica `.mcp.json` SHALL contener únicamente servidores MCP activos del flujo predeterminado. Graphify SHALL NOT estar registrado en la fuente canónica ni en los espejos generados de Codex y Cursor.

#### Scenario: Sincronización después del retiro
- **WHEN** un mantenedor elimina Graphify de `.mcp.json` y ejecuta `npm run agent:harness:sync`
- **THEN** `.codex/config.toml` y `.cursor/mcp.json` no contienen un servidor llamado `graphify`
- **AND** `npm run mcp:parity` valida el mismo conjunto de servidores activos sin requerir Graphify

#### Scenario: Inicio de un cliente por defecto
- **WHEN** Codex o Cursor carga la configuración MCP generada del repositorio
- **THEN** el cliente no intenta ejecutar `graphify-mcp`
- **AND** la disponibilidad del harness no depende de `uv`, `graphify` ni `graphify-mcp`

### Requirement: Graphify queda fuera de la ruta bloqueante como herramienta manual
Graphify SHALL ser documentado, si se conserva como referencia, únicamente como auditoría manual local que requiere instalación y regeneración explícitas. `graphify-out/` SHALL tratarse como salida local opcional y SHALL NOT usarse como prueba de que el runtime, el MCP o el doctor están sanos.

#### Scenario: Artefactos locales existentes
- **WHEN** existe un directorio local `graphify-out/` sin un ejecutable Graphify instalado
- **THEN** las validaciones del harness no reportan Graphify como servidor sano
- **AND** el doctor no falla ni queda bloqueado por su ausencia

#### Scenario: Auditoría voluntaria futura
- **WHEN** un mantenedor decide ejecutar una auditoría manual con Graphify
- **THEN** instala y configura la herramienta explícitamente antes de reconstruir o consultar el grafo
- **AND** esa instalación no modifica el baseline MCP ni se exige a otros colaboradores o agentes

### Requirement: La validación impide reintroducir Graphify al baseline activo
La validación de configuración MCP SHALL fallar si Graphify reaparece en `.mcp.json`, `.codex/config.toml` o `.cursor/mcp.json` como servidor activo.

#### Scenario: Reintroducción accidental en la fuente canónica
- **WHEN** un cambio agrega un servidor `graphify` a `.mcp.json`
- **THEN** la validación MCP termina con código distinto de cero
- **AND** informa que Graphify es una herramienta manual excluida del baseline activo

#### Scenario: Drift manual en un espejo generado
- **WHEN** un cambio agrega Graphify directamente a `.codex/config.toml` o `.cursor/mcp.json`
- **THEN** `npm run agent:harness:check` o la validación MCP reporta el drift o el servidor prohibido
- **AND** el mantenedor puede recuperarse regenerando los espejos desde `.mcp.json`

### Requirement: El routing GitNexus y CodeGraph permanece operativo
Las instrucciones activas SHALL conservar GitNexus como primera opción para preguntas estructurales y CodeGraph como fallback para fuente lineada o fallo/ambigüedad de GitNexus. Graphify SHALL NOT ser prescrito como tercer paso rutinario.

#### Scenario: Consulta estructural de un agente
- **WHEN** un agente necesita mapear arquitectura, call chains, dependencias o impacto en PlanearIA
- **THEN** las instrucciones le indican usar GitNexus primero
- **AND** solo indican CodeGraph cuando haga falta fallback o contexto editable lineado
- **AND** no requieren Graphify para completar la consulta
