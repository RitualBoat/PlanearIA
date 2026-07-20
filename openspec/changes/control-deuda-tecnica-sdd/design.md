# Design: control-deuda-tecnica-sdd

## Contexto y restricciones

- Issue fuente: #128. Politica ya aprobada via `interview-me`; este design no reabre decisiones.
- Bounded contexts (segun `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`): este change
  vive por completo en la capacidad transversal de gobernanza del harness (tooling SDD). No toca
  contextos de producto (planeaciones, classroom, office, asistente), no comparte entidades de dominio
  docente y por lo tanto **no requiere contrato cruzado**. El unico dato compartido es el registro de
  deuda bajo `.project-os/debt/`, cuyo owner es el propio motor.
- Presupuesto cero: Node puro, `gh` CLI ya presente, sin servicios pagados ni dependencias de runtime.
- Compatibilidad Windows/macOS/Linux: rutas con `node:path`, sin shell strings, ejecucion de `gh` con
  `spawnSync`/`execFileSync` sin `shell: true` (leccion de #113: los `.cmd` de npm dan EINVAL en
  Windows; `gh` es un `.exe`, no sufre esa restriccion).
- El nucleo debe poder extraerse a Project Engineering OS (#126) sin editarlo: cero referencias a
  PlanearIA, React, Expo, MVVM o dominio docente dentro de `tools/debt-control/src/`.

## Arquitectura

```text
tools/debt-control/            nucleo neutral reutilizable (futuro upstream MIT)
  bin/debt-control.mjs         CLI: check | gate | capture | sync | handoff | postfinish
  src/constants.mjs            categorias, severidades, estados, exit codes, versiones de schema
  src/schema.mjs               validacion determinista de config/registry/assessment
  src/fingerprint.mjs          IDs estables (sha256 truncado de campos normalizados)
  src/registry.mjs             carga/persistencia, ciclo de vida de items, dedupe, excepciones
  src/policy.mjs               presupuesto, triggers, pausa/reanudacion (funciones puras)
  src/capture.mjs              intake de assessments (mutacion explicita e idempotente)
  src/github.mjs               issue de remediacion idempotente; modos required/advisory/off
  src/handoff.mjs              prompt de relevo determinista + recomendacion mismo/nuevo chat
  src/report.mjs               salida humana y JSON identicas en veredicto/causa/recuperacion
  src/gates.mjs                pre-propose, pre-archive y post-finish
  test/*.test.mjs              node --test, sin red
  test/fixtures/<escenario>/   fixtures de politica, GitHub y ejecucion parcial
  schema/*.schema.json         documentacion machine-readable de los contratos

.project-os/debt/              estado versionado de PlanearIA (owner: motor de deuda)
  config.json                  politica local: umbrales, planes, ruteo, modo GitHub required
  registry.json                fuente canonica del estado actual (items con historia, nunca se borra)
  assessments/<flujo>.json     evidencia historica inmutable por flujo SDD (incluye baseline)
```

Integraciones PlanearIA (fuera del nucleo):

- `package.json`: `debt:check`, `debt:capture`, `debt:sync`, `debt:handoff`, `test:debt-control`.
- `scripts/checkOpenSpecReadiness.mjs`: importa funciones puras del nucleo para `debt-pre-propose`
  (fase propose) y `debt-gate` (fase archive). Ambas lecturas son read-only.
- `scripts/opsxFinishChange.mjs`: tras el merge remoto ejecuta `debt-control postfinish`; el exit code
  del cierre refleja el veredicto sin deshacer el merge y con recuperacion explicita.
- `tools/project-constructor/blueprint/core/project-os/debt-policy.json` + entrada en `manifest.json`
  con target `.project-os/debt/config.json`, owner `project` (seed-once: el proyecto puede editarla).
  El renderer no incluye codigo del motor (llega via paquete npm en #126) ni workflows OpenSpec.

## Modelo de datos

### Item del registro (`registry.json`)

```json
{
  "schemaVersion": 1,
  "items": [
    {
      "id": "debt-3f9c2a1b04d7",
      "title": "...",
      "description": "...",
      "category": "technical-debt",
      "severity": "minor",
      "transversal": false,
      "critical": false,
      "planOwner": "preparacion-operativa-sdd-harness",
      "artifact": "package.json#xlsx",
      "consequence": "...",
      "remediation": "...",
      "evidence": [{ "type": "command", "ref": "npm audit ...", "date": "2026-07-20" }],
      "occurrences": [{ "flow": "baseline-planearia-2026-07", "date": "2026-07-20" }],
      "issue": null,
      "status": "open",
      "exception": null,
      "createdAt": "2026-07-20",
      "updatedAt": "2026-07-20",
      "resolution": null
    }
  ]
}
```

- `category` es exactamente una de: `defect`, `technical-debt`, `external-risk`, `decision-required`,
  `optional-improvement`, `false-positive`, `duplicate`.
- `severity`: `blocker` | `major` | `minor`. Solo aplica presupuesto a `minor` de categorias con deuda
  real (`defect`, `technical-debt`, `external-risk`, `decision-required`). `optional-improvement` vale
  0 unidades. `false-positive` y `duplicate` nacen en estado terminal (`refuted`/`duplicate`).
- `status`: `open` | `resolved` | `refuted` | `duplicate` | `accepted-exception`. Los items nunca se
  eliminan; `resolution` registra flujo/PR/evidencia del cierre.
- `id` = `debt-` + sha256 truncado (12 hex) de `category|artifact normalizado|titulo normalizado`.
  La deduplicacion compara por `id`; una reaparicion agrega un occurrence, no un item nuevo.
- `exception` requiere `reason`, `owner`, `approvedBy`, `expiresOn` (ISO `YYYY-MM-DD`), `recovery`.
  Una excepcion expirada no silencia nada: dispara saneamiento.

### Assessment (`assessments/<flujo>.json`)

Evidencia historica inmutable de un cierre SDD: flujo, fecha, plan, candidatos con su verificacion
(`confirmed` | `refuted` | `duplicate` | `resolved-previously` | `external` | `improvement`) y el
resultado global (`clean` | `debt`). `capture` es idempotente por hash de contenido: reejecutar con el
mismo input es no-op PASS; un input distinto para el mismo flujo es FAIL con recuperacion (no se
sobreescribe evidencia historica).

### Config (`config.json`)

Umbral de presupuesto (5), unidades (1/2), triggers (5 flujos con deuda residual, 3 recurrencias),
modo GitHub (`required` en PlanearIA), labels, planes con `id`/`doc`, `planRouting` (mapa label de
issue -> plan, mas default) y allowlist de labels exentos del bloqueo pre-propose
(`debt-remediation`, `security`, `incident`, `rollback`).

## Politica (funciones puras en `policy.mjs`)

- `budgetFor(plan)`: suma unidades de items `open` minor del plan; recurrente (occurrences en >= 2
  flujos distintos) o transversal vale 2, el resto 1.
- Triggers de saneamiento (cualquiera activa): presupuesto >= 5; >= 5 flujos SDD distintos con deuda
  residual abierta del plan; un item con occurrences en >= 3 flujos distintos; excepcion expirada en
  item abierto; item transversal critico abierto; Blocker/Major abierto.
- Pausa: un trigger pausa unicamente el `planOwner` afectado. Un item `transversal: true` con
  `critical: true` o severidad `blocker` pausa todos los planes declarados.
- Reanudacion (todas): deuda objetivo resuelta/refutada/aceptada con excepcion valida; presupuesto del
  plan < umbral; sin Blockers/Majors ni excepciones expiradas; la remediacion no introdujo deuda nueva
  (su assessment no agrega items confirmados nuevos). La pausa es una funcion derivada del registro:
  no existe flag editable, y borrar el registro produce FAIL de validacion, no reanudacion.

## Gates

- `pre-propose` (en `checkOpenSpecReadiness.mjs`, fase propose): resuelve el plan del issue via
  `planRouting` sobre sus labels; si ese plan (o todos, por deuda transversal critica) esta pausado y
  el issue no lleva label de la allowlist, el resultado es FAIL con causa y recuperacion. Si el
  namespace `.project-os/debt/` no existe, reporta SKIP explicito (motor no configurado), nunca PASS
  implicito.
- `debt-gate` (fase archive): exige `assessments/<change>.json` valido (aunque sea `clean`); FAIL si
  el flujo tiene Blockers/Majors abiertos o si un plan pausado recibe deuda confirmada nueva desde un
  change que no es de saneamiento.
- `postfinish` (en `opsx:finish`, tras merge): recalcula estado, ejecuta `sync` segun modo GitHub y
  reporta el veredicto; un FAIL aqui no des-mergea, pero el comando termina con exit code distinto de
  cero y explica el estado y la recuperacion.

## GitHub sync (`github.mjs`)

- Un issue de remediacion por plan, identificado por el marcador `<!-- debt-control:plan:<id> -->` en
  el cuerpo; busqueda via `gh issue list --label debt-remediation --state open --json`. Si existe, se
  actualiza el bloque administrado del cuerpo de forma determinista; si no, se crea. Reejecutar sin
  cambios de estado no produce ediciones (sin drift).
- El cuerpo incluye: la regla obligatoria NO GENERAR MAS DEUDA TECNICA, los items abiertos con ID,
  severidad, unidades y evidencia, la exigencia de adversarial reviews adicionales hasta resolver
  Blockers/Majors, la guia de subchanges cohesivos y las condiciones de reanudacion.
- Modos: `required` -> `gh` ausente/no autenticado/fallo produce FAIL con recuperacion; `advisory` ->
  WARN conservando expediente local; `off` -> SKIP explicito. Nunca PASS falso. El texto de issues
  jamas se ejecuta como shell; los argumentos van por `execFileSync` sin shell.

## Handoff (`handoff.mjs`)

- Render determinista desde config + registry + assessment: objetivo, issue, plan, hallazgos con
  evidencia, alcance, lectura dirigida, gates y comandos, DoR/DoD, rollback, no objetivos y criterio
  de retorno. Ordena items por severidad e ID; sanitiza tokens/URLs con credenciales (mismo patron de
  redaccion que el gate de readiness). Acepta `--now` para pruebas reproducibles.
- Recomendacion mismo-chat/chat-nuevo: mismo chat solo si fase pre-archive, sin Blockers/Majors, <= 2
  items minor del mismo plan y contexto declarado sano (`--context ok`); cualquier otra combinacion
  (saneamiento, transversal, decision nueva, `--context degraded` o desconocido en fase remediacion)
  recomienda chat nuevo. Salida con razones explicitas.

## Salida y modos de ejecucion

- Todos los comandos aceptan `--json` y `--root <dir>` (fixtures). Veredictos `PASS`/`FAIL`/`WARN`/
  `SKIP` por check, con `cause` y `recovery`; la salida humana se deriva de la misma estructura que el
  JSON (una sola fuente de veredicto).
- Read-only: `check`, `gate`, `handoff`. Mutantes explicitos: `capture` (escribe assessment +
  registry) y `sync` (GitHub). `postfinish` = `check` + `sync`.
- Ejecucion parcial: `capture` escribe primero el assessment y luego el registry con escritura
  temporal + rename; si se interrumpe, reejecutar converge (idempotencia por hash) y `check` detecta
  y nombra un assessment sin reflejar en el registro con recuperacion (`re-ejecuta capture`).

## Baseline de PlanearIA

- Flujo `baseline-planearia-2026-07` capturado con el motor real. Candidatos auditados: advisories de
  `npm audit` (xlsx), issue #66 (deuda doctor/GitNexus y compatibilidad Expo), warnings `act()`/ruido
  de consola de la suite, checks `continue-on-error` en workflows, seguimiento #106 (breakpoints),
  hallazgos residuales de reviews archivadas y mojibake/Knip pendientes del plan harness.
- Cada candidato se reproduce con comando/lectura vigente y se clasifica; los historicos ya resueltos
  quedan como `resolved-previously` y los no verificables como `refuted` con evidencia. Solo la deuda
  confirmada consume presupuesto.
- Si el baseline activa un trigger, el motor crea/reutiliza el issue de remediacion del plan afectado
  (modo `required`) y ese plan queda pausado; la decision queda documentada en el runbook y en el
  paquete de cierre del change.

## Decisiones

| ID | Decision | Motivo |
| --- | --- | --- |
| DD1 | Nucleo en `tools/debt-control/` como paquete privado sin deps | Extraccion limpia hacia #126; espeja `tools/project-constructor` |
| DD2 | Estado en `.project-os/debt/` | Alinea PlanearIA con el namespace neutral que el constructor genera |
| DD3 | Pausa derivada, sin flag editable | La reanudacion exige evidencia; no puede lograrse editando un booleano ni borrando el registro |
| DD4 | Gates integrados en el checker existente, no un checker paralelo | Un solo owner del gate SDD; evita drift de dos implementaciones |
| DD5 | `capture` idempotente por hash y assessments inmutables | Separa estado actual (registry) de evidencia historica (assessments) |
| DD6 | GitHub via `gh` CLI con `execFileSync` sin shell | Reusa autenticacion local, cero secretos en repo, sin superficie de inyeccion |
| DD7 | Blueprint solo entrega politica, no codigo del motor | El motor llega a repos generados como paquete npm en #126; evita copias divergentes |
| DD8 | Sin medicion de tokens del contexto | Algunos harnesses no la exponen; la sanidad de contexto se declara con `--context` |

## Riesgos

- Burocracia: mitigada con defaults, comandos idempotentes y assessment `clean` de una linea.
- Falsos positivos historicos: revalidacion obligatoria contra runtime/tests actuales antes de entrar
  al registro.
- Bloqueo permanente: cada FAIL lleva recuperacion; excepciones acotadas con expiracion; rollback
  documentado (revertir el PR restaura los gates previos sin borrar registro ni issues).
- Drift de espejos harness: cambios en `.agents/` se sincronizan con `npm run agent:harness:sync` y se
  verifican con `agent:harness:check` (ya parte del perfil harness del gate).
