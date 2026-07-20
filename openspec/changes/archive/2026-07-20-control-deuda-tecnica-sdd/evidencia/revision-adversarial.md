# Revision adversarial independiente: control-deuda-tecnica-sdd (#128)

- **Fecha:** 2026-07-20.
- **Modo:** revisor independiente con contexto limpio (subagente separado, sin acceso a la sesion de
  implementacion), sobre el diff `development...feat/control-deuda-tecnica-sdd`.
- **Alcance revisado:** motor `tools/debt-control/`, gates en `scripts/checkOpenSpecReadiness.mjs`,
  cierre `scripts/opsxFinishChange.mjs`, estado `.project-os/debt/` (incluido el baseline real),
  blueprint del constructor, docs y specs del change. Ejecuto las suites (48/48 motor, readiness,
  constructor 48/48, openspec strict 38/38, paridad 36 espejos) y reproducciones del baseline.
- **Veredicto inicial:** PASS CON HUECOS (0 Blockers, 2 Majors, 6 Minors, 3 Preguntas).

## Hallazgos y disposicion

| # | Sev. | Hallazgo | Disposicion |
| --- | --- | --- | --- |
| 1 | Major | Deadlock del gate de archive: un Blocker/Major capturado en el assessment inmutable bloqueaba para siempre aunque la deuda se resolviera despues | CORREGIDO: `preArchiveGate` cruza cada candidato contra el estado vivo del registro (`findMatchingItem`); solo bloquea lo que sigue `open`. Spec `openspec-readiness-gates` actualizada (escenario "Blocker capturado y despues resuelto") + test de desbloqueo. Runbook ordena corregir antes de capturar |
| 2 | Major | `resumeConditions` era codigo muerto: una remediacion podia introducir deuda nueva y reanudar el plan | CORREGIDO: trigger `remediation-new-debt` en `policy.evaluate` (item abierto nacido en flujo remediation mantiene la pausa), el gate de archive rechaza deuda confirmada abierta sobre plan pausado tambien en saneamiento, y `resumeConditions` quedo cableada a `debt:check` (condiciones pendientes por plan). Tests nuevos en policy y gates |
| 3 | Minor | Redaccion de secretos incompleta (Bearer con espacio, ghp_, AKIA, JWT pasaban) | CORREGIDO: `sanitize` cubre prefijos reales de token y separadores; test de handoff con formatos reales |
| 4 | Minor | Modo `auto` contradecia "exactamente tres modos" del spec y el blueprint carecia de cobertura | CORREGIDO: spec `debt-control-github-sync` documenta `auto` como valor de configuracion que resuelve sin red; escenarios de `project-constructor-governance` reescritos; test de `resolveMode` |
| 5 | Minor | `postfinish` fallaba todo cierre mientras cualquier plan estuviera pausado | CORREGIDO: FAIL solo en primera deteccion (issue creado en esa ejecucion) o sync required fallido; pausa reconocida degrada a WARN visible con exit 0. Spec `opsx-change-closure` actualizada con ambos escenarios + tests CLI |
| 6 | Minor | `postfinish` escribia backrefs en `registry.json` sobre `development` (cambios sin commitear en rama protegida) | CORREGIDO: `persistIssueRefs=false` en postfinish + check WARN `github-refs` con recuperacion (persistir via `debt:sync` en rama de trabajo); test |
| 7 | Minor | Titulos con marcadores administrados rompian la idempotencia del issue | CORREGIDO: helper `inert()` neutraliza `<!--` en texto de items; test de no-rotura del bloque |
| 8 | Minor | Escenarios de `opsx-change-closure` sin test | CORREGIDO a nivel motor: tests CLI de postfinish (primera deteccion FAIL, pausa reconocida WARN, sync required fallido FAIL, motor ausente SKIP); el wiring en `opsxFinishChange.mjs` es un mapeo directo exit!=0 -> abort ya revisado |
| 9 | Pregunta | design/tasks mencionaban `registry.mjs` inexistente | CORREGIDO: referencias a `store.mjs`/`capture.mjs` |
| 10 | Pregunta | Excepciones con `expiresOn` 9999 = permanentes de facto | CORREGIDO: horizonte maximo de 365 dias en capture (`MAX_EXCEPTION_DAYS`) + test |
| 11 | Pregunta | Duplicate de un Major abierto no bloqueaba ese flujo | CORREGIDO: el gate bloquea duplicates cuyo item destino sigue abierto con severidad blocker/major + test |

## Estado final

Todos los Majors y Minors corregidos y cubiertos por tests (suite del motor: 58/58 tras la
remediacion; readiness y opsx-finish verdes). Las afirmaciones que resistieron la refutacion quedan
listadas en el reporte del revisor: sin falsos verdes, captura idempotente y atomica, nucleo neutral,
pausa por plan, baseline honesto, ownership de OpenSpec intacto y Graphify fuera de toda ruta.

**Veredicto final tras remediacion: PASS.**
