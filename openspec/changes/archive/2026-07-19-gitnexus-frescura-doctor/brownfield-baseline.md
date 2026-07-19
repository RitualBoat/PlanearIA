# Brownfield baseline: gitnexus-frescura-doctor

Registro de la superficie vigente que este change toca. No inventaria la aplicacion ni sustituye la
spec.

## Superficies tocadas

- `scripts/harnessDoctor.mjs`: `isGitNexusFailure` (`:55-57`) y `checkGitNexus` (`:86-91`).
- `scripts/gitNexusFts.mjs`: `assertDiagnosticStatusHealthy` (`:21-28`), fixtures de consulta e impact
  (`:38-55`), `repair` (`:163-169`) y `verify` (`:171-194`).
- `harness-doctor.config.json`: clave `gitNexusFailurePatterns` (`:20-26`).
- `scripts/testGitNexusFts.mjs`: fixture de estado sano (`:19`).
- `scripts/testHarnessDoctor.mjs`: fixture de falso verde (`:62-68`).
- `.agents/instructions/core.md` (`:114-116`) y sus espejos generados `AGENTS.md` y `CLAUDE.md`.

Nada fuera de esta lista se modifica. No se toca `src/`, `backend/`, `src/sync`, datos, claves
`@planearia:*`, proyecto nativo ni workflows de CI de entrega.

## Fuentes de verdad actuales

- `openspec/specs/gitnexus-index-health/spec.md`: contrato de salud del indice y de la reparacion.
- `openspec/specs/harness-readiness-doctor/spec.md`: contrato del doctor, incluido su caracter
  read-only y el escenario "GitNexus devuelve falso verde".
- `openspec/specs/agent-harness-parity/spec.md`: paridad de los espejos generados desde `.agents/`.
- `scripts/syncAgentHarness.mjs`: generador de `AGENTS.md` y `CLAUDE.md`.
- Issue #112 y su comentario del 2026-07-19: evidencia del falso verde y del fallo de `repair`.

## Comportamiento vigente

Medido el 2026-07-19 sobre `development@6b6e23c`:

- `npm run harness:doctor` reporta `PASS gitnexus` con el indice stale.
- `npm run gitnexus:diagnose` reporta `Status: stale`, `Indexed commit: cca8116`,
  `Current commit: 6b6e23c`.
- `npm run gitnexus:verify` reporta `passed` pese a la staleness, porque solo comprueba consulta e
  impact.
- `checkGitNexus` ejecuta unicamente `gitnexus:diagnose` y clasifica por una lista de cinco subcadenas
  de fallo; ninguna describe frescura y `query returned no structural context` es inalcanzable porque el
  doctor nunca consulta.
- `assertDiagnosticStatusHealthy` no considera la frescura, y `testGitNexusFts.mjs:19` afirma
  explicitamente que `Status: stale` es sano.
- `gitnexus:repair` ejecuta `analyze --repair-fts --index-only`, termina en exito y deja el indice
  stale.
- Duraciones medidas: `gitnexus:diagnose` ~5 s; `gitnexus:verify` ~14 s.

## Comportamiento objetivo

- La frescura se clasifica en `fresh`, `stale` o `unclassifiable` anclada a la linea `Status:`.
- `stale` y `unclassifiable` producen `FAIL` en el doctor; nunca `PASS` ni `WARN`.
- El doctor ejecuta la verificacion estructural compartida antes de reportar `PASS`; un indice fresco
  que no resuelve el fixture tampoco pasa.
- `verify` y el doctor comparten una unica funcion de verificacion estructural; el guardia de archivos
  de agente permanece solo en `verify`.
- `gitnexus:repair` reindexa con `analyze --index-only` y deja el indice `fresh` sin tocar archivos de
  agente.
- La remediacion impresa nombra `npm run gitnexus:repair` seguido de `npm run gitnexus:verify`.
- El check `gitnexus` del doctor pasa de ~5 s a ~19 s, de forma declarada.

## Compatibilidad legacy

- La interfaz publica de los tres comandos (`gitnexus:diagnose`, `gitnexus:repair`, `gitnexus:verify`)
  no cambia: mismos nombres, mismos argumentos, mismos codigos de salida en exito.
- `verify` conserva su guardia de archivos de agente y su bandera `--allow-agent-change`.
- La forma del reporte del doctor (`PASS`/`FAIL`/`WARN`/`SKIP`, `--json`, orden de `checkOrder`) no
  cambia; solo cambia el veredicto del check `gitnexus` ante entradas que antes pasaban.
- Consecuencia esperada y deseada: cualquier checkout con indice stale pasa a fallar el doctor. La
  recuperacion es un comando ya existente, no uno nuevo.
- `FIXTURE_UID`, `FIXTURE_QUERY` y `GITNEXUS_VERSION` se conservan sin cambios.
- El indice `.gitnexus` es local y esta ignorado en `.git/info/exclude`; no se versiona ni se migra.

## Owner de spec y contexto

- Owner: Ignacio Barboza Espinoza (RitualBoat), desarrollador unico.
- Specs propietarias: `gitnexus-index-health` y `harness-readiness-doctor`.
- Contexto de agente: `.agents/instructions/core.md` como fuente; `AGENTS.md` y `CLAUDE.md` como
  espejos generados.
- Issue rector: #112, en `PlanearIA Product OS`.

## Evidencia actual

- Ejecuciones del 2026-07-19 citadas en "Comportamiento vigente", a registrar en `evidencia/` durante
  el apply (tarea 1.1).
- Comentario del 2026-07-19 en el issue #112: `repair` en exito con staleness persistente, y reindex
  explicito que restaura `up-to-date` con `verify` en verde.
- `.gitnexus/meta.json`: `lastCommit` y `branch` del indice local, que confirman el desfase.
- Changes archivados relacionados, como contexto historico que no se edita:
  `2026-07-15-reparar-gitnexus-fts` y `2026-07-16-fix-gitnexus-root-doctor`.

## Fuera de alcance

- Cambiar la version fijada de GitNexus (`1.6.10-rc.23`).
- Auto-reparacion, auto-reindex o cualquier escritura desde el doctor.
- El rol de CodeGraph como fallback y el ruteo GitNexus-primero.
- El `SKIP` de Graphify y su politica.
- El smoke y la paridad de MCP, la comprobacion Expo y el resto de checks del doctor.
- `scripts/checkOpenSpecReadiness.mjs` y cualquier otro gate compartido.
- Producto, backend, sync, datos docentes, proyecto nativo y workflows de CI de entrega.
- La evidencia archivada de los changes previos de GitNexus, que se corrige hacia adelante.
