## Why

`npm run harness:doctor` reporta `PASS gitnexus` mientras el indice local esta stale (indexado en
`cca8116`, checkout en `6b6e23c`), porque el check solo busca una lista cerrada de subcadenas de error
en `gitnexus:diagnose` y ninguna de ellas describe la frescura. El siguiente agente lee ese verde y
decide blast radius con un grafo atrasado. Ademas `npm run gitnexus:repair`, la recuperacion
documentada, termina en exito anunciando `FTS indexes repaired successfully` y deja el indice stale:
la ruta de recuperacion no recupera. Ver issue #112.

Esto no es una funcionalidad ausente sino deriva entre spec e implementacion:
`openspec/specs/gitnexus-index-health/spec.md` ya exige que GitNexus se declare sano **solo cuando**
frescura, FTS, una consulta estructural conocida y un `impact` desambiguado por UID tengan exito, y que
"An up-to-date commit alone SHALL NOT be reported as a healthy structural-query path".
`gitnexus:verify` cumple parte de ese contrato; el doctor, que es el consumidor que los agentes leen
primero, no cumple ninguna de las cinco condiciones salvo dos firmas de error.

## What Changes

- El check `gitnexus` del doctor clasifica la frescura del indice en tri-estado explicito (`fresh`,
  `stale`, `unclassifiable`) leyendo la linea `Status:` del diagnostico, en lugar de aplicar una lista
  de subcadenas de fallo. `stale` y `unclassifiable` producen `FAIL`; nunca `PASS` ni `WARN`.
- El doctor ejecuta ademas una verificacion estructural determinista (consulta MVVM e `impact` por UID)
  antes de declarar `PASS`. Un indice fresco que no resuelve el fixture tampoco pasa.
- Esa verificacion estructural se extrae de `scripts/gitNexusFts.mjs` como funcion exportada unica,
  compartida por `gitnexus:verify` y por el doctor, para que no existan dos definiciones de
  "estructuralmente sano". El guardia sobre archivos de agente permanece solo en `verify`.
- El doctor sigue siendo estrictamente read-only: no ejecuta `analyze`, `--repair-fts` ni reindex y no
  escribe en `.gitnexus`. Se anade una prueba que lo afirma inspeccionando los comandos invocados.
- **BREAKING (contrato de tooling local):** `npm run gitnexus:repair` pasa de `analyze --repair-fts
  --index-only` a un reindex `analyze --index-only`, porque la evidencia del issue demuestra que la
  ruta FTS-only deja el indice stale y la ruta de reindex lo devuelve a `up-to-date`. `--index-only` se
  conserva, asi que la garantia de no inyectar archivos de agente no se relaja. No se anade un segundo
  comando de recuperacion: la secuencia sigue siendo `repair` y luego `verify`.
- Se corrigen los fixtures que blindaban el defecto: `scripts/testGitNexusFts.mjs:19` deja de afirmar
  que `Status: stale` es sano y se conserva su cobertura de ruta con espacios en Windows.
  `scripts/testHarnessDoctor.mjs` gana los casos stale, fresco-pero-roto y fresco-y-sano.
- `harness-doctor.config.json` deja de expresar la salud como lista de fallos conocidos; su firma
  `query returned no structural context`, hoy inalcanzable porque el doctor nunca consulta, se vuelve
  alcanzable.
- `.agents/instructions/core.md` describe el contrato de recuperacion corregido y `AGENTS.md` y
  `CLAUDE.md` se regeneran con `npm run agent:harness:sync`, nunca a mano.

## Capabilities

### New Capabilities

Ninguna. El comportamiento requerido ya esta especificado; lo que falta es que el consumidor lo cumpla.

### Modified Capabilities

- `gitnexus-index-health`: la clasificacion de frescura pasa a ser tri-estado y vinculante para todo
  consumidor del diagnostico, no solo para `gitnexus:verify`; una salida de estado no interpretable deja
  de contar como salud. El requisito de reparacion deja de prescribir `--repair-fts --index-only` y pasa
  a exigir que la reparacion restaure la frescura conservando el aislamiento de archivos de agente.
- `harness-readiness-doctor`: el check GitNexus del doctor debe clasificar frescura y ejecutar la
  verificacion estructural compartida antes de reportar `PASS`, conservando su caracter read-only y una
  remediacion que nombre la secuencia de recuperacion real.

## Impact

- `scripts/harnessDoctor.mjs`: `checkGitNexus` e `isGitNexusFailure`.
- `scripts/gitNexusFts.mjs`: clasificador de frescura nuevo, verificacion estructural extraida como
  export compartido, cuerpo de `repair`.
- `harness-doctor.config.json`: manifest del check GitNexus.
- `scripts/testGitNexusFts.mjs` y `scripts/testHarnessDoctor.mjs`: fixtures corregidos y ampliados.
- `.agents/instructions/core.md` y sus espejos generados `AGENTS.md` y `CLAUDE.md`.
- Costo operativo: el check `gitnexus` del doctor pasa de ~5 s a ~19 s por las dos invocaciones `npx`
  adicionales en frio. Es deliberado y se declara.
- Sin impacto en producto: no se toca `src/`, backend, `src/sync`, datos, claves `@planearia:*`,
  proyecto nativo ni workflows de CI de entrega. El indice `.gitnexus` es local e ignorado.
- Plan maestro: ninguno de forma directa. El change protege la ruta de contexto estructural sobre la que
  se apoya `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` para decidir blast radius.

## No objetivos

- No cambiar la version fijada de GitNexus (`1.6.10-rc.23`) sin evidencia.
- No dotar al doctor de auto-reparacion, auto-reindex ni de ninguna escritura.
- No volver Graphify obligatorio ni alterar su `SKIP`.
- No promover CodeGraph a ruta primaria ni cambiar el ruteo GitNexus-primero.
- No modificar `FIXTURE_UID` ni `FIXTURE_QUERY` salvo que se demuestren irresolubles.
- No tocar producto, `src/`, backend, `src/sync`, datos, claves `@planearia:*` ni proyecto nativo.
- No modificar `scripts/checkOpenSpecReadiness.mjs` ni ningun otro gate compartido.
- No anadir un segundo comando de recuperacion ni editar `AGENTS.md` o `CLAUDE.md` a mano.
- No crear ni modificar workflows de CI de entrega.
- No reabrir ni reeditar la evidencia archivada de changes previos de GitNexus.
