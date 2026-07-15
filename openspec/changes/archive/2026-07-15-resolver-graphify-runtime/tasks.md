## 1. Baseline y configuración canónica

- [x] 1.1 Registrar el baseline de `.mcp.json`, sus espejos generados y el estado ignorado/local de `graphify-out/` sin modificar ni borrar ese directorio.
- [x] 1.2 Retirar `graphify` de `.mcp.json` y eliminar los scripts `graphify:*` que anuncian un runtime predeterminado no instalado.
- [x] 1.3 Ejecutar `npm run agent:harness:sync` para regenerar `.codex/config.toml` y `.cursor/mcp.json`; no editar los espejos manualmente.

## 2. Guardas de runtime y documentación

- [x] 2.1 Extender la validación MCP para fallar si `graphify` reaparece en la fuente canónica o en cualquiera de los espejos activos, con recuperación accionable mediante el sincronizador.
- [x] 2.2 Actualizar la fuente de instrucciones de agentes y sus espejos para conservar GitNexus primario y CodeGraph fallback, sin prescribir Graphify como runtime o tercer paso rutinario.
- [x] 2.3 Actualizar la documentación operativa y de readiness: Graphify queda únicamente como auditoría manual opcional, con `graphify-out/` como salida local regenerable y no como health check.

## 3. Validación y evidencia

- [x] 3.1 Ejecutar la prueba de regresión de Graphify excluido y `npm run mcp:parity`; verificar que los tres archivos de configuración activa no declaren el servidor.
- [x] 3.2 Ejecutar `npm run agent:harness:check` y el smoke de servidores MCP activos con `npm run mcp:test -- --timeout=90000`.
- [x] 3.3 Ejecutar `npm run lint -- --quiet`, `npm run typecheck` y `git diff --check`; investigar y corregir cualquier falla causada por este change.
- [x] 3.4 Adjuntar al issue #51 la evidencia de configuración antes/después, comandos de validación y la decisión de que `graphify-out/` no prueba salud.
