## Why

Graphify figura como servidor MCP activo y como herramienta disponible en las instrucciones del repositorio, pero el entorno no tiene `uv`, `graphify` ni `graphify-mcp`. La paridad de nombres sigue pasando aunque el servidor no pueda arrancar, con lo que los agentes reciben una promesa de runtime no reproducible y el futuro doctor del harness quedaría bloqueado por una herramienta opcional.

La decisión aprobada es retirar Graphify del MCP activo. GitNexus y CodeGraph ya cubren el routing estructural primario y el fallback lineado, mientras que Graphify podrá seguir usándose solo como auditoría manual local cuando se justifique su costo y se instale explícitamente.

## What Changes

- **BREAKING** para el harness de agentes: retirar `graphify` de la configuración MCP canónica y de sus espejos generados; los clientes dejarán de intentar iniciar `graphify-mcp` por defecto.
- Retirar scripts e instrucciones que presenten Graphify como herramienta de runtime obligatoria o disponible sin instalación.
- Establecer que la paridad MCP valida únicamente servidores activos; una salida local `graphify-out/` no prueba salud ni obliga a incluir Graphify en el doctor.
- Documentar el uso de Graphify como auditoría manual opcional, con instalación y rebuild explícitos fuera de la ruta bloqueante del repositorio.
- Añadir validaciones que demuestren que Graphify ya no se propaga a los harnesses y que GitNexus/CodeGraph conservan su routing aprobado.

## Capabilities

### New Capabilities

- `agent-tool-runtime-health`: define qué herramientas de agente son activas, cómo se valida su salud y cómo se excluyen herramientas manuales opcionales del MCP, de la paridad y del doctor bloqueante.

### Modified Capabilities

- None.

## Impact

- Configuración del harness: `.mcp.json`, `.codex/config.toml` y `.cursor/mcp.json`, regenerados desde su fuente canónica.
- Instrucciones y operación: `.agents/instructions/core.md`, sus espejos generados, `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md` y la guía/plan de readiness.
- Scripts y validación: scripts `graphify:*` de `package.json`, `scripts/testMcpServers.mjs` y sus pruebas si la cobertura de paridad/salud requiere ajuste.
- Artefactos locales: `graphify-out/` seguirá siendo una salida opcional regenerable y no una señal de salud. No hay impacto en la app, backend, sync, datos académicos, autenticación ni APIs de producto.
