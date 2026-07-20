# Gap analysis

> **Snapshot:** 2026-07-19.
> **Regla:** un gap histórico resuelto no vuelve al backlog; un gap vigente necesita owner y validación.

## 1. Hallazgos históricos o resueltos

| Hallazgo anterior | Estado actual | Evidencia | Tratamiento |
| --- | --- | --- | --- |
| GitNexus podía quedar stale o producir falso verde estructural | Resuelto | issue [#112](https://github.com/RitualBoat/PlanearIA/issues/112) cerrado; `gitnexus:diagnose` fresh en `502746f`; verificación estructural compartida | No copiar el diagnóstico antiguo; transferir el contrato corregido |
| Graphify formaba parte del baseline MCP | Resuelto/retirado | spec `agent-tool-runtime-health`; issue #51; ausencia del baseline | Mantener `SKIP retirado/manual` |
| OpenSpec dependía de rutas globales/flotantes | Resuelto | `openspec:check` PASS con CLI local `1.6.0`; lockfile | Copiar el contrato exacto, no instrucciones upstream `@latest` |
| Harness tenía mirrors desalineados | Resuelto en snapshot | `agent:harness:check`: 36 mirrors en paridad | Usar como baseline, no como garantía del constructor futuro |
| OPSX podía tener dos rutas de actualización | Normalizado | AGENTS y `patchOpsxWorkflows.mjs`: CLI oficial + patch/check separado | Conservar ownership externo |
| #81 y #111 bloqueaban el constructor | Resuelto | ambos issues cerrados; branch/change del constructor activo | No mantenerlos como bloqueos actuales |

## 2. Gaps vigentes priorizados

| ID | Severidad | Gap | Evidencia | Acción Ola 0 | Criterio de cierre |
| --- | --- | --- | --- | --- | --- |
| G1 | Blocker | No existe todavía un CLI/blueprint reutilizable validado ni una fixture vacía verde | ausencia de release/fixture demostrada al iniciar el change; implementación local en curso no equivale a DoD | Implementar paquete, estado, owners, fixture y segundo run | bootstrap real + sync check sin drift |
| G2 | Major | Doctor actual puede iniciar MCP/OAuth | `harnessDoctor.mjs:checkMcpSmoke` ejecuta `npm run mcp:test`; `testMcpServers.mjs` hace `spawn` | Doctor nuevo consume evidencia y usa allowlist read-only | snapshot FS/procesos sin side effects |
| G3 | Major | Paridad TOML puede dar señal semántica falsa | regex en `testMcpServers.mjs`; subtables `github.tools.*` en `.codex/config.toml` | Parser estructural y fixture negativa | subtable no aparece como servidor |
| G4 | Major | El núcleo actual mezcla producto y gobernanza | `openspec/config.yaml`, AGENTS y reglas frontend/backend | Blueprint neutral + prueba de términos prohibidos | fixture sin dominio/stack |
| G5 | Major | No hay recuperación transaccional reusable | scripts actuales regeneran, pero no instalan/rollback en repos ajenos | journal, backups, hashes, resume y rollback | fallo inyectado converge sin pérdida |
| G6 | Major | Tests verdes pueden contener warnings/logs inesperados | baseline Jest auditada previamente; plan preparación mantiene deuda | constructor con stdout/stderr allowlist cerrada | cero ruido inesperado del constructor |
| G7 | Major | `main` está documentada como estable pero no protegida | API GitHub devuelve `404 Branch not protected` | Gate manual; no mutar desde bootstrap | decisión/aplicación verificada o documentación normalizada |
| G8 | Minor | Encontrabilidad es manual | checklist en context engineering | test de enlaces críticos | todas las rutas en ≤2 enlaces |
| G9 | Major | No existe runbook general de incidentes | inventario `Documentacion/02-operacion/` | base universal y anexos posteriores | tabletop y owner definidos |
| G10 | Minor | Golden journeys pendientes | plan preparación | diferir hasta discovery | perfil/producto define journeys |
| G11 | Minor | Agent evaluation baseline pendiente | plan preparación | fixture mínima del harness; evaluación amplia posterior | dataset/versiones explícitos |
| G12 | Major | Canal y licencia de distribución no aprobados | PlanearIA sin licencia raíz; paquete aún inexistente | `private` + `UNLICENSED`; `npm pack` local | decisión humana antes de publicar |
| G13 | Minor | CI del constructor no tiene historial | workflow aún no existe | advisory | promoción solo con baseline y rollback |
| G14 | Major | Prompt 01 no se ha ejecutado y no existe perfil técnico aprobado | el blueprint solo instala un handoff inerte; no hay respuestas de producto | mantener ejecución y activación diferidas | Olas 1/2, después de Ola 0 |

## 3. Acciones que no son fixes automáticos

- `npm audit`, CodeQL u otros scanners producen candidatos a investigar.
- Knip requiere revisar imports dinámicos, entrypoints, reexports y contratos públicos.
- React Doctor solo se activa con perfil React y baseline estable.
- Graphify no se instala para “resolver” un `SKIP`.
- Warnings de suites existentes no autorizan actualizar dependencias.
- Protección de ramas, OAuth y cambios de Project requieren intervención humana.

## 4. Secuencia de normalización

1. Terminar documentación y contratos de Ola 0.
2. Implementar CLI/blueprint y ownership.
3. Implementar harness y parser MCP estructural.
4. Implementar doctor read-only por evidencia.
5. Probar fixture vacía, fallo parcial, resume y rollback.
6. Añadir CI advisory y baseline silenciosa.
7. Ejecutar revisión adversarial y corregir Blockers/Majors.
8. Decidir licencia/canal antes de cualquier publicación.

## 5. Estado de salida esperado

Ola 0 no resuelve G10 ni G14 porque dependen del producto. Sí debe cerrar G1-G6, G8 y la parte universal de
G9; debe convertir G7, G12 y G13 en gates humanos explícitos sin falsos verdes.
