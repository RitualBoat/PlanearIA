# Tasks: control-deuda-tecnica-sdd

## 1. Nucleo neutral `tools/debt-control/`

- [x] 1.1 Scaffolding del paquete privado (package.json `node --test`, bin, engines, sin deps de runtime) y `constants.mjs` con categorias, severidades, estados, exit codes y versiones de schema.
- [x] 1.2 `schema.mjs`: validacion determinista de config, registry y assessment con mensajes de causa y recuperacion; `schema/*.schema.json` documentales.
- [x] 1.3 `fingerprint.mjs`: ID estable `debt-<12hex>` por categoria+artefacto+titulo normalizados, con tests de estabilidad y colision basica.
- [x] 1.4 `store.mjs` + ciclo de vida en `capture.mjs`: carga/guardado atomico, estados de item (open/resolved/refuted/duplicate/accepted-exception), merge de occurrences, validacion de excepciones.
- [x] 1.5 `policy.mjs`: presupuesto por plan (1/2 unidades), cinco triggers, pausa derivada por plan, pausa global por transversal critica y condiciones de reanudacion; funciones puras con tests de limite.
- [x] 1.6 `capture.mjs`: intake de assessment idempotente por hash, inmutabilidad historica, escritura temporal+rename y convergencia tras ejecucion parcial.
- [x] 1.7 `github.mjs`: issue de remediacion idempotente por plan (marcador estable, bloque administrado), modos required/advisory/off con FAIL/WARN/SKIP, `gh` sin shell, runner inyectable para tests.
- [x] 1.8 `handoff.mjs`: prompt de relevo determinista (issue, plan, hallazgos, evidencia, alcance, gates, rollback, no objetivos, criterio de retorno), sanitizacion de secretos y recomendacion misma-tarea/tarea-nueva con razones.
- [x] 1.9 `gates.mjs` + `report.mjs` + `cli.mjs` + `bin/debt-control.mjs`: subcomandos check/gate/capture/sync/handoff/postfinish, `--json`, `--root`, veredictos PASS/FAIL/WARN/SKIP de fuente unica.

## 2. Tests y fixtures del nucleo

- [x] 2.1 Fixtures: sin GitHub (off), GitHub advisory, GitHub required, deuda bajo presupuesto, umbral alcanzado, Major inmediato, hallazgo repetido (recurrencia), excepcion expirada, candidatos refutados y segundo run sin drift.
- [x] 2.2 Tests `node --test` del nucleo: schema, fingerprint, registry, policy (limites y casos negativos), capture (idempotencia y ejecucion parcial), github (tres modos con runner simulado), handoff (render reproducible y redaccion de secretos), gates y paridad humano/JSON.

## 3. Integracion PlanearIA

- [x] 3.1 Crear `.project-os/debt/config.json` con planes reales, ruteo por labels, allowlist de saneamiento y modo GitHub `required`; `registry.json` vacio valido y directorio `assessments/`.
- [x] 3.2 `scripts/checkOpenSpecReadiness.mjs`: verificacion `debt-pre-propose` en fase propose (plan pausado bloquea, allowlist permite, SKIP explicito sin config) sin romper el contrato existente.
- [x] 3.3 `scripts/checkOpenSpecReadiness.mjs`: verificacion `debt-gate` en fase archive (assessment presente y valido, sin Blockers/Majors del flujo, regla de no deuda nueva en plan pausado).
- [x] 3.4 `scripts/opsxFinishChange.mjs`: red de seguridad post-merge via `debt-control postfinish` con salida honesta y SKIP explicito si no hay politica.
- [x] 3.5 `package.json`: scripts `debt:check`, `debt:capture`, `debt:sync`, `debt:handoff`, `test:debt-control`; revisar wiring CI para ejecutar los tests del motor donde corren los del constructor.
- [x] 3.6 Actualizar `scripts/testOpenSpecReadiness.mjs` (y test de finish si aplica) con casos del gate de deuda.

## 4. Constructor y documentacion

- [x] 4.1 Blueprint: `core/project-os/debt-policy.json` neutral + entrada de manifest hacia `.project-os/debt/config.json` (owner project/seed-once) + ajuste de tests/fixtures del constructor afectados.
- [x] 4.2 Runbook `Documentacion/02-operacion/CONTROL_DEUDA_TECNICA.md`: uso, politica, excepciones, actualizacion, migracion y rollback; enlaces desde context engineering y plan maestro del harness.
- [x] 4.3 Fuente `.agents/instructions` con el Debt Control Loop y `npm run agent:harness:sync` para espejos; verificacion con `agent:harness:check`.

## 5. Baseline real de PlanearIA

- [x] 5.1 Auditar candidatos vigentes (npm audit, issue #66, warnings de suite, continue-on-error de CI, seguimientos de reviews archivadas, Knip/mojibake pendientes) reproduciendo cada uno con evidencia actual.
- [x] 5.2 Capturar el assessment `baseline` con el motor real: confirmados, refutados, resueltos-previamente y duplicados clasificados explicitamente.
- [x] 5.3 Ejecutar `debt:check`; si hay trigger, crear/reutilizar el issue de remediacion en modo required y documentar la pausa del plan afectado.

## 6. Validacion y cierre

- [x] 6.1 Suite completa: `test:debt-control`, `test:openspec-readiness`, `test:opsx-finish`, `constructor:check` afectado, `npm run typecheck`, `npm run lint -- --quiet`, `agent:harness:check`, `agent:opsx:patch:check` y segundo run sin drift del motor.
- [ ] 6.2 Actualizar TLDR.md si cambio el alcance; completar readiness.json con validaciones, evidencia, rollback y referencia de revision adversarial.
- [x] 6.3 Revision adversarial independiente (contexto limpio); corregir Blockers/Majors antes de archive.
