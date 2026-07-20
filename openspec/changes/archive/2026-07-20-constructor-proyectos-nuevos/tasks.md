## 1. Fundaciones y contratos

- [x] 1.1 Crear el paquete neutral y privado `tools/project-constructor/` con `package.json` `UNLICENSED`,
  lockfile, bin, módulos ESM y scripts `test`/`check`, sin publicación.
- [x] 1.2 Definir y validar el schema del blueprint, configuración instalada, estado de ownership,
  transactions, perfiles y matriz de capacidades.
- [x] 1.3 Añadir scripts raíz para ejecutar bootstrap, sync/check, doctor, rollback, tests y fixture sin
  acoplarlos al runtime del producto.
- [x] 1.4 Crear `readiness.json`, `brownfield-baseline.md` y el inventario de superficies/evidencia del
  change sin declarar validaciones aún no ejecutadas.

## 2. Plan maestro y documentación versionada

- [x] 2.1 Crear `Documentacion/01-planes-maestros/PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md` con visión,
  decisiones, blueprint, DoR/DoD, olas, gates, backlog lazy, distribución, rollback y cierre.
- [x] 2.2 Versionar la auditoría as-is, matriz de transferibilidad y gap analysis, separando hallazgos
  históricos/resueltos de gaps vigentes.
- [x] 2.3 Crear runbook de uso, estrategia de actualización/rollback y matriz de compatibilidad por
  agente/SO.
- [x] 2.4 Crear evaluación de costos/licencias y política de secretos, herramientas retiradas, scanners,
  Knip y dependencias.
- [x] 2.5 Crear `PROMPT_00_BOOTSTRAP_ENTORNO` y `GUIA_MANUAL_USUARIO` como adaptadores del CLI, sin lógica
  duplicada ni preguntas de producto.
- [x] 2.6 Actualizar índices documentales para que plan, runbook, Prompt 00 y guía manual sean encontrables
  en menos de tres saltos.

## 3. Blueprint universal y gobernanza

- [x] 3.1 Crear `.project-os/` y templates neutrales de `README.md`, `AGENTS.md`, jerarquía de fuentes,
  flujo SDD y context engineering.
- [x] 3.2 Crear configuración OpenSpec universal con versión exacta local, lockfile reproducible y
  ownership externo de workflows OPSX.
- [x] 3.3 Crear plantillas neutrales de issues/PR y manifiesto Product OS con labels, estados, campos y
  gates manuales.
- [x] 3.4 Crear el catálogo de nueve perfiles de evidencia, activando solo documentación y
  harness/tooling.
- [x] 3.5 Crear el paquete de payloads de discovery en modo local/dry-run, sin crear issues remotos durante
  bootstrap.
- [x] 3.6 Instalar `PROMPT_01_DISCOVERY_PROYECTO` como handoff independiente e inerte, con gate explícito
  de Etapa A y sin ejecutar entrevistas, generar decisiones ni activar perfiles durante bootstrap.
- [x] 3.7 Definir política y ejemplos neutrales de metadata DoR/DoD, incluyendo excepciones temporales
  limitadas y condiciones no eximibles.

## 4. Bootstrap, ownership y recuperación

- [x] 4.1 Implementar carga/validación del blueprint y cálculo ordenado del plan de archivos.
- [x] 4.2 Implementar preflight de Git, writability, colisiones, owners y hashes antes de la primera
  escritura.
- [x] 4.3 Implementar render determinista, normalización LF y escritura mediante archivo temporal +
  rename.
- [x] 4.4 Implementar `state.json`, hashes, owners `constructor`, `human-overlay`, `external-openspec` y
  `project`.
- [x] 4.5 Implementar journals, backups y fallo inyectable sin descartar contenido ajeno.
- [x] 4.6 Implementar reanudación convergente y rollback hash-aware de una transacción explícita.
- [x] 4.7 Implementar comandos `bootstrap`, `sync`, `sync --check`, `rollback` y `github-plan`, con salidas
  humana/JSON y códigos de salida definidos.
- [x] 4.8 Implementar `readiness-check` pre-propose/pre-archive read-only, con verificación remota
  fail-closed, salida humana/JSON y sin comandos inyectables desde metadata.

## 5. Harness reusable

- [x] 5.1 Implementar renderers de instrucciones y fallback universal en `AGENTS.md`.
- [x] 5.2 Implementar adaptadores de reglas, skills y permisos para Codex, Claude Code, Cursor, OpenCode y
  GitHub Copilot.
- [x] 5.3 Implementar render/parsing estructural de MCP y overlays sin contar subtables TOML como
  servidores.
- [x] 5.4 Implementar matriz de capacidades `native`, `generated`, `documented` y `unsupported` con
  validación contra destinos reales.
- [x] 5.5 Excluir workflows/skills OPSX del renderer y añadir adaptador/check separado de bloques
  delimitados bajo ownership OpenSpec.
- [x] 5.6 Implementar diff determinista de `sync --check` sin timestamps, rutas absolutas ni mutaciones.

## 6. Doctor read-only

- [x] 6.1 Implementar schema de resultados y formatos humano/JSON equivalentes con
  `PASS`/`FAIL`/`WARN`/`SKIP`, causa, evidencia y recuperación.
- [x] 6.2 Implementar checks universales de Node/package manager, lockfile, Git, OpenSpec local, GitHub
  CLI/Project, harness, variables por nombre y CI declarada.
- [x] 6.3 Implementar selección de checks por perfil e informar perfiles inactivos como `SKIP`, nunca
  `PASS`.
- [x] 6.4 Implementar cuatro señales MCP separadas: configuración, startup, tool listing y smoke
  autenticado aportado como evidencia.
- [x] 6.5 Implementar roles separados de GitNexus/CodeGraph y Graphify `SKIP retirado/manual`, sin
  reparación ni reindex.
- [x] 6.6 Implementar redacción de secretos, timeouts y allowlist cerrada de probes read-only.

## 7. Tests, fixtures y CI

- [x] 7.1 Probar bootstrap de repositorio Git vacío, instalación neutral y segundo run sin cambios.
- [x] 7.2 Probar colisión previa, fallo parcial, reanudación y rollback que preserva ediciones humanas.
- [x] 7.3 Probar cinco harnesses, degradaciones, drift por adaptador, LF multi-SO y parser MCP/TOML.
- [x] 7.4 Probar doctor humano/JSON, falsos verdes, perfiles, OAuth sin side effects, secretos, timeouts,
  GitNexus/CodeGraph y Graphify.
- [x] 7.5 Probar neutralidad, paquete de diez issues, enlaces/findability y ausencia de decisiones de
  producto activadas.
- [x] 7.6 Probar migración de versión fixture y segundo `sync --check` sin drift residual.
- [x] 7.7 Añadir workflow CI advisory del constructor y documentar el criterio explícito de promoción a
  blocking.
- [x] 7.8 Probar gates DoR/DoD válidos y fallidos, dependencias abiertas, estado remoto desconocido,
  excepciones vencidas/prohibidas y ausencia de mutaciones.

## 8. Evidencia y cierre

- [x] 8.1 Ejecutar tests, `npm pack` local, fixture completa, segundo run, `sync --check` y doctor
  humano/JSON; guardar evidencia machine-readable.
- [x] 8.2 Ejecutar `npm run openspec:check`, validación strict del change, TLDR/brownfield/readiness,
  paridad de harness/OPSX, typecheck y lint.
- [x] 8.3 Ejecutar las suites raíz proporcionales y comprobar que warnings/logs inesperados del constructor
  son cero.
- [x] 8.4 Revisar cualitativamente `TLDR.md`, Prompt 00, guía manual, costos/licencias, rollback y
  encontrabilidad.
- [x] 8.5 Ejecutar revisión adversarial desde contexto limpio, corregir Blockers/Majors y registrar la
  evidencia.
- [x] 8.6 Completar `readiness.json` y sincronizar issue, Project y plan con la evidencia de cierre.
- [x] 8.7 Corregir por contacto el `DEP0190` observado en el gate real, cubrir el runner Windows sin
  `shell: true` y repetir el pre-archive sin warnings.

El gate pre-archive, el archive/sync de specs, la publicación del PR y `npm run opsx:finish` son pasos
posteriores a completar las tareas del change. `opsx:finish` solo puede ejecutarse tras checks requeridos
y autorización de merge aplicable.
