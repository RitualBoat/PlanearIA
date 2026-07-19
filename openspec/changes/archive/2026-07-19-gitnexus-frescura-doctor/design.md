## Context

Tres archivos producen el falso verde del issue #112 y conviene tenerlos a la vista antes de decidir:

- `scripts/harnessDoctor.mjs:55-57,86-91`: `checkGitNexus` corre `npm run gitnexus:diagnose` y delega en
  `isGitNexusFailure`, que devuelve `true` solo si la salida contiene alguna de las subcadenas
  configuradas. Todo lo demas es `PASS`.
- `harness-doctor.config.json:20-26`: las cinco firmas configuradas son `Not a git repository`, tres
  variantes FTS y `query returned no structural context`. Ninguna describe frescura y la ultima es
  inalcanzable, porque solo la emite `verifyQueryResult` (`scripts/gitNexusFts.mjs:43`) y el doctor
  nunca invoca una consulta.
- `scripts/gitNexusFts.mjs:21-28`: `assertDiagnosticStatusHealthy` mira FTS y repositorio, nunca
  frescura. `scripts/testGitNexusFts.mjs:19` afirma explicitamente que `Status: stale` es sano.

La forma del defecto importa mas que su tamano: la salud se expresa como **ausencia de fallos
conocidos**. Bajo esa forma, cualquier modo de fallo no enumerado -- frescura hoy, cualquier otro
manana -- se reporta como verde. La correccion tiene que cambiar la forma, no solo anadir `stale` a la
lista.

Estado medido el 2026-07-19 sobre `development@6b6e23c`: `harness:doctor` -> `PASS gitnexus`;
`gitnexus:diagnose` -> `Status: stale`, `Indexed commit: cca8116`; `gitnexus:verify` -> `passed`.
Los tres a la vez. `verify` pasa con indice stale, lo que confirma que frescura y estructura son
senales independientes y que ninguna basta sola.

Restricciones vigentes: `openspec/specs/gitnexus-index-health/spec.md` ya exige las cinco condiciones
de salud; `openspec/specs/harness-readiness-doctor/spec.md` exige que el doctor sea read-only y que
"no instala, actualiza, autentica, repara ni reindexa"; `AGENTS.md` y `CLAUDE.md` son generados desde
`.agents/` por `scripts/syncAgentHarness.mjs`.

## Goals / Non-Goals

**Goals:**

- Que un indice stale nunca produzca `PASS` en el doctor.
- Que un indice fresco pero incapaz de resolver el fixture estructural tampoco produzca `PASS`.
- Que una salida de estado no interpretable falle en vez de pasar por omision.
- Que exista una sola definicion de "estructuralmente sano", compartida por `verify` y el doctor.
- Que la recuperacion documentada (`gitnexus:repair`) realmente devuelva el indice a `up-to-date`.
- Que el doctor conserve su caracter read-only con una prueba que lo verifique sobre los comandos, no
  solo sobre el resultado.

**Non-Goals:**

- Auto-reparacion o auto-reindex desde el doctor.
- Cambiar la version fijada de GitNexus, los fixtures `FIXTURE_UID`/`FIXTURE_QUERY`, el ruteo
  GitNexus-primero o el rol de CodeGraph.
- Tocar producto, backend, sync, datos o CI de entrega.

## Decisions

### D1. Clasificacion tri-estado por linea `Status:`, no lista de subcadenas de fallo

`classifyIndexFreshness(output)` devuelve `fresh`, `stale` o `unclassifiable`. Se ancla a la linea que
empieza por `Status:` y se ignora la decoracion que el CLI antepone; la salida real es
`Status: (advertencia) stale (re-run gitnexus analyze)` frente a `Status: up-to-date`.

Por que anclar a la linea y no buscar la palabra suelta: una ruta de repositorio, un nombre de rama o
un mensaje incidental pueden contener "stale" o "up to date" sin ser el estado del indice. Anclar
evita clasificaciones falsas en ambas direcciones.

Alternativas descartadas:

- **Anadir `stale` a `gitNexusFailurePatterns`.** Es la correccion minima y la trampa: conserva la
  forma "salud = ausencia de fallos conocidos", asi que el proximo modo de fallo no enumerado vuelve a
  ser verde. Se rechaza por forma, no por resultado.
- **Leer `.gitnexus/meta.json` (`lastCommit`, `branch`) y compararlo con `git rev-parse HEAD`.** Es
  deterministico y sin `npx`, pero acopla el doctor al formato interno del indice (hoy
  `schemaVersion: 6`), que no es contrato publico y puede cambiar sin aviso entre versiones del CLI.
  El `status` del CLI si es la interfaz declarada. Se descarta como fuente primaria; queda anotado como
  ruta de diagnostico manual.

### D2. `unclassifiable` es `FAIL`, no `WARN`

Un `WARN` conserva `ok: true` en el veredicto agregado, y el agente siguiente vuelve a leer un verde:
seria el mismo defecto con otro color. El unico `WARN` legitimo del doctor hoy es el de OAuth
interactivo, que exige **prueba positiva** de su causa (prompt de autorizacion con origen coincidente).
Aqui no hay prueba positiva de nada: la ausencia de evidencia de salud no es evidencia de salud.

### D3. La verificacion estructural se extrae como export compartido

Se extrae de `gitNexusFts.mjs` una funcion exportada -- p. ej. `runStructuralVerification(options)` --
que ejecuta los dos fixtures ya validados (consulta MVVM e `impact` por UID con
`verifyQueryResult`/`verifyImpactResult`) y devuelve un resultado clasificado en vez de lanzar. La usan
`verify` y `checkGitNexus`.

Por que compartir en vez de reimplementar en el doctor: dos definiciones de "estructuralmente sano"
derivarian entre si con el tiempo, que es exactamente la falla que este change corrige. Una sola
definicion hace que corregir el fixture una vez lo corrija en los dos consumidores.

### D4. El doctor NO reutiliza `gitnexus:verify` completo

`verify` incluye, ademas de los fixtures, un guardia sobre `git status --porcelain` que falla si hay
cambios sin versionar en `AGENTS.md`, `CLAUDE.md`, `.agents/` o `.codex/skills/`
(`scripts/gitNexusFts.mjs:187-191`). Eso es una preocupacion de **paridad de harness**, no de salud de
GitNexus.

Si el doctor lo heredara, editar `AGENTS.md` -- algo que este mismo change hace -- produciria
`FAIL gitnexus` con una causa que no tiene ninguna relacion con el indice, y el harness ya cubre esa
preocupacion en el check `harness-parity`. El guardia se queda solo en `verify`.

### D5. `gitnexus:repair` reindexa; `--index-only` se conserva

Evidencia del issue: `analyze --repair-fts --index-only` termino en exit 0 anunciando
`FTS indexes repaired successfully` y dejo `Status: stale`; `analyze --index-only` reconstruyo el
esquema (9,042 nodos, 15,862 edges, 298 clusters, 300 flows) y dejo `up-to-date`, con
`gitnexus:verify` en verde.

Un comando de recuperacion que termina en exito sin recuperar es peor que uno que falla: entrena al
agente a creerle. `repair` pasa a `analyze --index-only --name PlanearIA .`.

`--index-only` es la bandera que impide que `analyze` escriba en los archivos de agente, y se conserva:
la garantia de la spec ("does not modify tracked `AGENTS.md`, `CLAUDE.md`...") no se relaja y se sigue
verificando. `--repair-fts` se retira porque el reindex reconstruye el indice FTS de todos modos; si el
apply demuestra lo contrario, se conserva la bandera y se registra la evidencia.

Alternativa descartada: **anadir `gitnexus:reindex` junto a `gitnexus:repair`.** Dos comandos de
recuperacion obligan al agente a elegir por causa, y la remediacion impresa por el doctor tendria que
ramificar. Un solo comando, una sola secuencia: `repair` y luego `verify`.

### D6. Las pruebas cubren las tres transiciones, no solo la que falla hoy

`stale -> no PASS`, `fresco pero sin resolver el fixture -> no PASS`, `fresco y funcional -> PASS`. Sin
la tercera, una implementacion que devolviera `FAIL` siempre pasaria la suite. Se anaden con resultados
inyectados, sin lanzar procesos GitNexus reales, como ya hace `testHarnessDoctor.mjs`.

Ademas se afirma el caracter read-only **inspeccionando los comandos invocados** (que ninguno contenga
`analyze`, `--repair-fts` ni `--index-only`), no solo el estado devuelto: una asercion sobre el
resultado no distingue un doctor que reparo en silencio de uno que no toco nada.

### D7. Los fixtures se corrigen, no se borran

`testGitNexusFts.mjs:19` se invierte para afirmar que stale **no** es sano, conservando la ruta
`C:\Planear IA\PlanearIA`, que es la unica cobertura de Windows con espacios en la cadena de pruebas.
Borrar la linea perderia esa cobertura junto con el defecto.

### D8. La documentacion de agente se corrige en su fuente

`.agents/instructions/core.md:114-116` describe la reparacion como `--repair-fts --index-only`. Se
edita ahi y se regenera con `npm run agent:harness:sync`. `AGENTS.md` y `CLAUDE.md` no se tocan a mano,
y `npm run agent:harness:check` verifica la paridad resultante.

## Risks / Trade-offs

- **El check `gitnexus` del doctor pasa de ~5 s a ~19 s** (medido: `diagnose` ~5 s, `verify` ~14 s por
  dos invocaciones `npx` en frio) -> Es el costo deliberado de no declarar sana una ruta que no se
  probo. Se declara en el proposal y en la evidencia. Si resultara inaceptable, la palanca es cachear
  la verificacion estructural por commit indexado, no volver a la lista de subcadenas.
- **El parser de `Status:` se acopla al formato de salida del CLI de GitNexus** -> Mitigado por diseno:
  un formato que el parser no reconozca cae en `unclassifiable` y **falla ruidosamente** en vez de pasar
  en silencio. El modo de fallo del acoplamiento es visible, que es justo lo contrario del defecto
  actual.
- **Retirar `--repair-fts` podria dejar un indice FTS degradado en algun runtime** -> La evidencia del
  issue muestra el reindex dejando `verify` en verde (y `verify` comprueba FTS explicitamente). El apply
  reejecuta esa secuencia y registra la salida; si aparece degradacion, se reincorpora la bandera con su
  evidencia.
- **El doctor se vuelve mas ruidoso: un indice stale ahora rompe el veredicto agregado** -> Es el
  comportamiento buscado, no un efecto colateral. Se mitiga con una remediacion que nombre la secuencia
  exacta (`npm run gitnexus:repair` y luego `npm run gitnexus:verify`) sin ejecutarla.
- **Extraer la verificacion estructural podria alterar el comportamiento de `gitnexus:verify`** ->
  `verify` conserva su guardia de archivos de agente y su contrato de salida; la extraccion es una
  refactorizacion con la suite `test:gitnexus` como red. Se ejecuta antes y despues.

## Migration Plan

No hay migracion de datos ni de esquema. La secuencia de despliegue es el propio PR: al mergear, el
doctor empieza a fallar en cualquier checkout con indice stale, que es el resultado deseado. La primera
ejecucion posterior de cada agente exigira `npm run gitnexus:repair` seguido de `npm run gitnexus:verify`.

Rollback: revertir el commit del PR restaura la clasificacion anterior sin migracion ni perdida de
datos. Desactivacion parcial disponible, porque las piezas son independientes: se puede revertir solo el
cambio de `repair` conservando la clasificacion del doctor, o solo la verificacion estructural
conservando la clasificacion de frescura. El indice `.gitnexus` es local e ignorado en
`.git/info/exclude`, asi que ningun rollback lo arrastra.

## Open Questions

- Ninguna bloqueante. La unica incognita empirica -- si el reindex sin `--repair-fts` deja FTS sano en
  este runtime -- se resuelve durante el apply ejecutando `repair` seguido de `verify`, y su resultado
  se registra como evidencia. La decision D5 ya declara que se hace si la respuesta es negativa.
