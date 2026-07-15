## 1. Contrato y entrada del doctor

- [x] 1.1 Crear el manifest versionado del doctor con el Project esperado, orden de checks, firmas semanticas, estados permitidos y remediaciones read-only.
- [x] 1.2 Registrar un comando npm local para el doctor y sus opciones de salida humana/`--json`, sin usar una dependencia o descarga `@latest` en la ruta bloqueante.
- [x] 1.3 Documentar en el manifest Graphify como `SKIP` retirado/manual y comprobar que el contrato no consulta PATH, `graphify-out/` ni un servidor Graphify.

## 2. Runner y comprobaciones

- [x] 2.1 Implementar el runner Node con orden fijo, modelo de resultado estable, salida `--json` unica y exit code no cero ante cualquier `FAIL`.
- [x] 2.2 Implementar probes read-only para Node/npm, Git/worktree, OpenSpec, visibilidad del Project GitHub, paridad de harness y paridad/smoke de MCP activo, normalizando su evidencia sin exponer secretos.
- [x] 2.3 Implementar la clasificacion semantica de GitNexus para que `Not a git repository`, degradacion FTS o consulta inutilizable fallen aunque el subproceso devuelva cero; mantener CodeGraph como resultado de fallback independiente y solo enlazar la recuperacion existente.
- [x] 2.4 Clasificar MCP OAuth configurado pero no autenticado como `WARN` y ejecutar la comprobacion Expo con la CLI local/fijada en modo no mutante, sin instalaciones ni upgrades.

## 3. Pruebas y documentacion

- [x] 3.1 Añadir pruebas con runner inyectable para escenario sano, comando ausente, falso verde GitNexus, Project inaccesible, MCP OAuth esperado y Graphify retirado sin invocacion.
- [x] 3.2 Añadir una prueba de integracion del contrato del doctor contra las comprobaciones individuales, incluyendo aserciones de orden, formato JSON, exit code y ausencia de efectos de reparacion.
- [x] 3.3 Actualizar la guia operativa del harness con uso, significados `PASS`/`FAIL`/`WARN`/`SKIP`, remediaciones seguras y la regla Graphify retirado/no aplicable.

## 4. Evidencia de cierre

- [x] 4.1 Ejecutar las pruebas del doctor, `npm run test:gitnexus`, `npm run agent:harness:check`, `npm run mcp:parity`, `npm run mcp:test`, `npm run openspec:check`, `npm run typecheck` y `npm run lint -- --quiet`.
- [x] 4.2 Ejecutar el doctor en el checkout real, adjuntar su reporte humano y JSON al issue #52, y verificar que el estado GitNexus actual sea visible como `FAIL` mientras Graphify sea `SKIP` retirado/manual.
- [x] 4.3 Ejecutar `npm exec --yes=false -- openspec validate create-deterministic-harness-doctor --strict --no-interactive`, actualizar la evidencia del issue y solicitar revision antes de archive.
