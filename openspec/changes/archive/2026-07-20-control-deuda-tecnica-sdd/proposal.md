# Proposal: control-deuda-tecnica-sdd

> Issue: [#128](https://github.com/RitualBoat/PlanearIA/issues/128) - [Harness][Debt] Motor verificable de control de deuda tecnica para flujos SDD
> Plan maestro afectado: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (linea B, harness)
> Bloquea: #126 (publicacion open source de Project Engineering OS)

## Why

Al cerrar un flujo SDD, los agentes detectan hallazgos residuales (avisos de revision adversarial,
limitaciones, seguimientos), pero el gate actual solo exige una referencia de revision: no clasifica,
no persiste ni gobierna esos hallazgos. La deuda se acumula en texto libre y se pierde. PlanearIA
necesita un motor determinista que convierta hallazgos verificados en un registro gobernado por
presupuesto y gates, reutilizable despues en el nucleo open source de Project Engineering OS (#126).

## What Changes

- Se crea un motor neutral `tools/debt-control/` (Node puro, sin dependencias de runtime, sin React,
  Expo, MVVM ni dominio docente) con CLI propia, tests `node --test` y fixtures.
- Se crea el namespace de estado `.project-os/debt/` en PlanearIA: `config.json` (politica),
  `registry.json` (fuente canonica del estado actual con IDs estables) y `assessments/` (evidencia
  historica inmutable por flujo).
- El gate `scripts/checkOpenSpecReadiness.mjs` agrega dos verificaciones read-only: `debt-pre-propose`
  (bloquea nuevos changes de producto de un plan pausado) y `debt-gate` en archive (exige assessment
  del flujo y ausencia de Blockers/Majors abiertos).
- `scripts/opsxFinishChange.mjs` ejecuta una red de seguridad posterior al merge: recalcula el estado
  de deuda, sincroniza issues segun el modo GitHub y reporta PASS/FAIL/WARN/SKIP sin falsos verdes.
- Modos GitHub configurables `required`/`advisory`/`off` con creacion/actualizacion idempotente de un
  issue de remediacion por plan. PlanearIA queda en `required`.
- Generador determinista de prompts de relevo y recomendacion mismo-chat/chat-nuevo basada en datos
  canonicos, sin inventar contexto ni filtrar secretos.
- El blueprint del constructor agrega una politica de deuda neutral para repositorios generados
  (default `required` cuando el perfil GitHub esta activo), sin duplicar workflows de la CLI OpenSpec.
- Baseline verificable de la deuda actual de PlanearIA: cada candidato se reproduce, verifica o refuta
  con evidencia vigente; solo la deuda confirmada entra al presupuesto. Si el baseline activa un
  trigger, se crea/reutiliza el issue de remediacion y el plan afectado queda pausado.
- Documentacion operativa: runbook `Documentacion/02-operacion/CONTROL_DEUDA_TECNICA.md`, politica de
  excepciones, actualizacion y rollback, encontrable en menos de tres saltos desde `AGENTS.md`.

## Capabilities

### New Capabilities

- `debt-control-registry`: registro canonico machine-readable de deuda con esquema versionado,
  validacion determinista, IDs estables para deduplicacion, estados actuales separados de la evidencia
  historica y excepciones con motivo, owner, aprobador, expiracion y recuperacion.
- `debt-control-policy`: clasificacion en siete categorias mutuamente excluyentes, presupuesto hibrido
  por plan (Minor 1 unidad, Minor recurrente/transversal 2, umbral 5), cinco triggers de saneamiento,
  pausa por plan afectado (repositorio completo solo ante deuda transversal critica) y condiciones
  verificables de reanudacion.
- `debt-control-github-sync`: issue de remediacion idempotente por plan con la regla NO GENERAR MAS
  DEUDA TECNICA, modos `required`/`advisory`/`off` con degradacion explicita FAIL/WARN/SKIP y sin
  falsos PASS ante indisponibilidad o falta de autenticacion.
- `debt-control-handoff`: prompt de relevo determinista renderizado desde datos canonicos (issue, plan,
  hallazgos, evidencia, alcance, gates, rollback, no objetivos, criterio de retorno) y recomendacion
  mismo-chat/chat-nuevo segun fase, severidad y sanidad de contexto declarada.

### Modified Capabilities

- `openspec-readiness-gates`: el gate pre-propose bloquea changes de producto de planes pausados
  (permitiendo saneamiento, seguridad, incidentes y rollback) y el gate de archive exige un assessment
  de deuda valido sin Blockers/Majors abiertos del flujo.
- `opsx-change-closure`: el cierre agrega una comprobacion final posterior al merge como red de
  seguridad, con salida honesta que nunca convierte un fallo de deuda en exito silencioso.
- `project-constructor-governance`: los repositorios generados reciben una politica de deuda neutral
  seed-once bajo `.project-os/`, con default `required` solo cuando el perfil GitHub esta activo.

## Impact

- Codigo nuevo: `tools/debt-control/` (bin, src, test, fixtures, schema).
- Codigo tocado: `scripts/checkOpenSpecReadiness.mjs`, `scripts/opsxFinishChange.mjs`,
  `scripts/testOpenSpecReadiness.mjs`, `package.json` (scripts `debt:*`),
  `tools/project-constructor/blueprint/` (politica de deuda + manifest) y sus tests afectados.
- Estado nuevo: `.project-os/debt/` (config, registry, assessments) versionado en el repo.
- Documentacion: runbook de operacion, `.agents/instructions` (fuente) sincronizada a espejos,
  indices de context engineering y plan maestro del harness.
- GitHub: labels e issue de remediacion idempotente por plan; PlanearIA en modo `required`.
- Sin dependencias de runtime nuevas, sin servicios pagados, sin cambios en la app React Native ni en
  el backend.

## No objetivos

- No crear ni publicar todavia el repositorio open source ni paquetes npm (eso es #126).
- No resolver silenciosamente la deuda historica dentro de este change; el baseline solo la registra,
  verifica o refuta.
- No introducir SonarQube ni servicios pagados.
- No convertir automaticamente cualquier warning, TODO o salida de scanner en deuda sin verificacion.
- No borrar historial, issues, assessments ni evidencia archivada.
- No ejecutar refactors o correcciones automaticas por salida de scanners.
- No imponer React, Expo, MVVM, offline, IA ni UI al nucleo neutral.
- No duplicar los workflows generados por la CLI oficial de OpenSpec dentro del renderer del harness.
- No modificar `openspec/specs/` a mano; el ownership del archive sigue en la CLI OpenSpec.
