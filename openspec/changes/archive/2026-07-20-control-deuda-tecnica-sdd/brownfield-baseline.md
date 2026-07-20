# Brownfield Baseline: control-deuda-tecnica-sdd

## Superficies tocadas

- `scripts/checkOpenSpecReadiness.mjs` y `scripts/testOpenSpecReadiness.mjs` (gates propose/archive).
- `scripts/opsxFinishChange.mjs` y `scripts/testOpsxFinish.mjs` (cierre post-merge).
- `package.json` raiz (scripts `debt:*` y wiring de tests).
- `tools/project-constructor/blueprint/` (`manifest.json`, `core/project-os/`) y tests del constructor.
- `.agents/instructions` como fuente harness y sus espejos generados (`AGENTS.md`, `CLAUDE.md`).
- Documentacion operativa (`Documentacion/02-operacion/`, context engineering, plan maestro harness).
- Superficies nuevas sin comportamiento previo: `tools/debt-control/` y `.project-os/debt/`.

## Fuentes de verdad actuales

- `openspec/specs/openspec-readiness-gates/spec.md` (contrato vigente de gates).
- `openspec/specs/opsx-change-closure/spec.md` (contrato vigente del cierre).
- `openspec/specs/project-constructor-governance/spec.md` y blueprint real del constructor.
- `openspec/config.yaml`, `AGENTS.md`/`CLAUDE.md` generados desde `.agents/`.
- Issue #128 con la politica aprobada.

## Comportamiento vigente

- El gate de propose valida issue/Project/manifest y dependencias; no conoce planes pausados.
- El gate de archive valida artefactos, tareas, evidencia, rollback y exige solo una referencia de
  revision adversarial; no clasifica ni persiste hallazgos residuales.
- `opsx:finish` publica la rama, espera checks, mergea via GitHub y limpia; termina ahi, sin
  comprobacion posterior de deuda.
- El constructor genera `.project-os/` con politicas de readiness y perfiles; no incluye politica de
  deuda.
- No existe registro de deuda: los hallazgos viven en texto libre de reviews archivadas e issues.

## Comportamiento objetivo

- Los mismos gates agregan verificaciones de deuda read-only: pre-propose bloquea planes pausados con
  allowlist de saneamiento; archive exige assessment sin Blockers/Majors.
- `opsx:finish` ejecuta una red de seguridad post-merge con salida honesta y SKIP explicito.
- El constructor siembra una politica de deuda neutral seed-once en repos generados.
- Existe registro canonico versionado con presupuesto, triggers, pausa derivada y sincronizacion
  GitHub idempotente en modos required/advisory/off.

## Compatibilidad legacy

- El contrato actual de `checkOpenSpecReadiness.mjs` (IDs, estados PASS/FAIL/EXCEPTION, allowlist de
  validaciones, excepciones) se conserva; las verificaciones de deuda se agregan sin renombrar ni
  eliminar checks existentes.
- Sin politica de deuda configurada, todos los comandos y gates se comportan como hoy (SKIP explicito),
  de modo que revertir el PR restaura el flujo previo sin migraciones.
- Los assessments e issues creados sobreviven a un rollback: no se borran registros al revertir.
- Los espejos harness solo cambian via `.agents/` + `agent:harness:sync`, como hasta ahora.

## Owner de spec y contexto

- Specs `debt-control-*`: nuevas, owner este change y futuro nucleo Project Engineering OS (#126).
- `openspec-readiness-gates` y `opsx-change-closure`: owner PlanearIA harness (plan
  `PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`, linea B).
- `project-constructor-governance`: owner constructor (plan `PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md`).
- `openspec/specs/` sigue siendo escrito solo por la CLI OpenSpec durante archive.

## Evidencia actual

- `npm run openspec:ready:propose -- --issue 128`: PASS 9/9 (2026-07-20).
- Gate actual sin nocion de deuda: `scripts/checkOpenSpecReadiness.mjs` lineas 226-290 (validateArchive)
  solo exige `adversarialReview.ref`.
- `opsx:finish` termina tras merge y limpieza: `scripts/opsxFinishChange.mjs` lineas 194-211.
- Blueprint sin politica de deuda: `tools/project-constructor/blueprint/core/project-os/` (11 archivos,
  ninguno de deuda).
- Suites verdes previas al change segun CI de `development` (PR #125 mergeado).

## Fuera de alcance

- Publicar el repositorio open source o paquetes npm (#126).
- Resolver la deuda historica detectada por el baseline dentro de este change.
- Editar `openspec/specs/` a mano o duplicar workflows de la CLI OpenSpec.
- Cambiar la app React Native, el backend o los flujos de producto.
- Introducir servicios pagados o dependencias de runtime nuevas.
