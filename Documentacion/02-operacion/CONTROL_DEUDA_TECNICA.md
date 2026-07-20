# Control de Deuda Tecnica (Debt Control Loop)

> **Estado:** vigente.
> **Uso:** runbook del motor de control de deuda tecnica para flujos SDD.
> **Fuente de verdad:** `tools/debt-control/` (motor), `.project-os/debt/` (estado), specs
> `openspec/specs/debt-control-*`.
> **No usar para:** convertir warnings en deuda sin verificacion, o "reanudar" planes editando el registro.
> **Issue de origen:** [#128](https://github.com/RitualBoat/PlanearIA/issues/128).

## Que resuelve

Al cerrar un flujo SDD, los hallazgos residuales (avisos de revision adversarial, limitaciones,
seguimientos) ya no se pierden como texto suelto: se clasifican, se verifican con evidencia y entran a
un registro gobernado por presupuesto. Cuando la deuda cruza un limite, el motor pausa el plan
afectado, crea o reutiliza un issue de saneamiento y guia al solo dev sobre como continuar.

## Piezas

| Pieza | Ruta | Rol |
| --- | --- | --- |
| Motor neutral | `tools/debt-control/` | CLI y libreria reutilizable (futuro nucleo de Project Engineering OS via #126) |
| Politica local | `.project-os/debt/config.json` | Umbrales, planes, ruteo por labels, modo GitHub (`required` en PlanearIA) |
| Registro canonico | `.project-os/debt/registry.json` | Fuente unica del estado actual; los items nunca se borran |
| Assessments | `.project-os/debt/assessments/<flujo>.json` | Evidencia historica inmutable por flujo SDD |
| Gates | `scripts/checkOpenSpecReadiness.mjs` | `debt-pre-propose` (propose) y `debt-gate` (archive) |
| Red de seguridad | `scripts/opsxFinishChange.mjs` | `debt-control postfinish` tras el merge |

## Comandos

```bash
npm run debt:check                 # read-only: presupuesto, triggers y pausas por plan (--json opcional)
npm run debt:capture -- --flow <change> --input <archivo.json>   # muta: captura el assessment del flujo
npm run debt:sync                  # muta: sincroniza issues de saneamiento segun github.mode
npm run debt:handoff -- --plan <id> [--phase <fase>] [--context ok|degraded]  # read-only: prompt de relevo
npm run test:debt-control          # suite node --test del motor
```

Solo `debt:capture` y `debt:sync` escriben; todo lo demas es read-only. Las salidas humana y JSON
comparten veredicto (`PASS`/`FAIL`/`WARN`/`SKIP`), causa y recuperacion.

## Ciclo por flujo SDD

1. Durante el cierre (antes de archive), clasifica cada hallazgo residual en exactamente una categoria:
   `defect`, `technical-debt`, `external-risk`, `decision-required`, `optional-improvement`,
   `false-positive` o `duplicate`. Todo candidato exige `verification` con metodo, resultado y fecha:
   un warning de scanner sin reproducir no entra al registro ni autoriza correcciones automaticas.
2. Escribe el assessment (ver `tools/debt-control/schema/assessment.schema.json`) y capturalo con
   `debt:capture`. Un cierre sin hallazgos usa `result: "clean"` y `candidates: []`. Corrige los
   Blockers/Majors del flujo ANTES de capturarlos como confirmados; si capturas uno, el assessment es
   inmutable y el desbloqueo solo llega resolviendolo o refutandolo en el registro via un flujo de
   saneamiento (`resolves`/`false-positive`), nunca editando la evidencia.
3. `npm run openspec:ready:archive` ejecuta `debt-gate`: exige el assessment y falla con
   Blockers/Majors del flujo que sigan abiertos en el registro, deuda transversal critica o deuda
   confirmada nueva abierta sobre un plan pausado (tambien en flujos de saneamiento).
4. `npm run opsx:finish` ejecuta la red de seguridad `postfinish` tras el merge: recalcula el estado y
   sincroniza el expediente GitHub sin persistir backrefs (corre sobre la rama protegida). La primera
   deteccion de una pausa (issue creado en esa ejecucion) o un fallo de sync en modo `required`
   producen FAIL con exit distinto de cero; una pausa ya reconocida se reporta como WARN visible y el
   cierre termina. Los backrefs de issue se persisten despues con `npm run debt:sync` desde una rama
   de trabajo.

## Politica (aprobada en #128)

- Minor verificado: 1 unidad. Minor recurrente (2+ flujos) o transversal: 2 unidades. Umbral: 5.
- Blockers, Majors y deuda transversal critica bloquean de inmediato; no consumen presupuesto.
- Disparan saneamiento: presupuesto >= 5; cinco flujos SDD con deuda residual; el mismo hallazgo en
  tres flujos; una excepcion vencida; deuda transversal critica; Blocker/Major verificado.
- La pausa afecta solo al plan duenio; la deuda transversal critica pausa todos los planes.
- La pausa se deriva del registro (sin flag editable). Borrar o corromper el registro produce FAIL de
  validacion, nunca reanudacion.

## Pausa y reanudacion

Con un plan pausado, `debt-pre-propose` bloquea nuevos changes de producto de ese plan; solo pasan
issues con labels de la allowlist (`debt-remediation`, `security`, `incident`, `rollback`). El issue de
saneamiento (uno por plan, idempotente, marcador `<!-- debt-control:plan:<id> -->`) impone la regla
NO GENERAR MAS DEUDA TECNICA y exige revisiones adversariales hasta resolver Blockers y Majors.

La reanudacion exige todas estas condiciones; `debt:check` las lista una a una en cada plan pausado:

- La deuda objetivo fue resuelta (`resolves` con evidencia), refutada (`false-positive`) o aceptada con
  una excepcion valida (motivo, owner, aprobador, expiracion ISO dentro de 365 dias, recuperacion).
- El presupuesto del plan quedo bajo el umbral.
- No quedan Blockers, Majors ni excepciones expiradas.
- El saneamiento no introdujo deuda nueva: un item abierto nacido en un flujo `remediation` mantiene
  la pausa (trigger `remediation-new-debt`) aunque el presupuesto haya bajado del umbral.

## Ruteo de issues a planes

`planRouting.labelMap` mapea labels de issue a plan (primera coincidencia gana, en el orden declarado);
`default` cubre el resto. Configuracion vigente: `ux-ui` -> plan UX/UI; `infra` y `testing` -> plan de
preparacion operativa SDD/harness (tambien default). Los planes de auth y del constructor estan
declarados como owners de items; si su trabajo gana labels propias, agrega el mapeo por PR normal.

## Modos GitHub

- `required` (PlanearIA): `gh` ausente, sin autenticar o con fallo de API produce FAIL con recuperacion.
- `advisory`: la misma condicion produce WARN y el expediente local queda como fuente.
- `off`: SKIP explicito; solo registro local.
- `auto` (repos generados por el constructor): resuelve a `required` si existe
  `.project-os/github/product-os.json`, y a `off` en caso contrario.

Cambiar de modo es una edicion normal de `.project-os/debt/config.json` via PR. La sincronizacion usa
`gh` con argumentos explicitos sin shell; el texto de issues y del registro es dato inerte.

## Guia de continuidad para el solo dev

`debt:handoff` recomienda de forma determinista:

- **Mismo chat** solo para correcciones pequenas, locales y previas al archive: sin Blockers/Majors,
  pocos Minors del mismo plan y contexto declarado sano (`--context ok`).
- **Chat nuevo** para saneamiento de lote, deuda transversal, decisiones nuevas, revision adversarial
  independiente o contexto degradado/desconocido. El prompt de relevo se renderiza solo desde el
  registro, la politica y los assessments (nunca desde memoria del chat) y redacta secretos.

## Actualizacion, migracion y rollback

- **Actualizar politica:** editar `.project-os/debt/config.json` por PR normal (umbral, ruteo, modo).
- **Migrar esquema:** un cambio de `schemaVersion` exige migracion explicita versionada; el motor
  rechaza esquemas desconocidos en vez de reescribirlos silenciosamente.
- **Rollback del motor:** revertir el PR de #128 restaura los gates y el cierre previos; sin
  `.project-os/debt/config.json` todos los comandos y gates reportan SKIP explicito. Los assessments,
  el registro y los issues creados no se borran al revertir.
- **Degradar GitHub:** pasar `github.mode` a `advisory` u `off` mediante PR si la automatizacion causa
  friccion; el registro local sigue siendo la fuente canonica.

## Baseline

El baseline inicial de PlanearIA vive en `.project-os/debt/assessments/baseline-planearia-2026-07.json`
con `kind: "baseline"`: cada candidato historico fue reproducido y clasificado; los ya corregidos
quedaron como `resolvedPreviously` y los no verificables como `false-positive` con evidencia. Solo la
deuda confirmada consume presupuesto. Si el baseline activa un trigger, el issue de saneamiento del
plan afectado se crea automaticamente (modo `required`) y ese plan queda pausado hasta remediar.
