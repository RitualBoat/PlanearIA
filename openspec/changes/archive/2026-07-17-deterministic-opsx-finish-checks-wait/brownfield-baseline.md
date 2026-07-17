# Brownfield baseline: deterministic-opsx-finish-checks-wait

Documenta solo la superficie que este change tocara. No inventaria el resto de la app ni sustituye la spec.

## Superficies tocadas

- `scripts/opsxFinishChange.mjs`: paso de espera de checks (linea 81) y parseo de banderas.
- `scripts/lib/prChecksWait.mjs` (nuevo): clasificacion y sondeo puros.
- `scripts/testOpsxFinish.mjs` (nuevo): pruebas con ejecutor y reloj inyectados.
- `package.json`: script `test:opsx-finish`.
- `Documentacion/02-operacion/`: documentacion de la espera y del diagnostico de timeout.

## Fuentes de verdad actuales

- `scripts/opsxFinishChange.mjs`: comportamiento real del cierre.
- `CLAUDE.md` y `AGENTS.md`, seccion OpenSpec SDD: contrato declarado de `opsx:finish` ("publica la rama, crea o reutiliza un PR hacia `development`, espera los checks requeridos y ordena el merge a GitHub. Nunca hace push directo al target protegido").
- `cli/cli`, `pkg/cmd/pr/checks/checks.go` (gh 2.96.0): contrato observable de `gh pr checks`.
- `gh api repos/RitualBoat/PlanearIA/branches/development/protection`: checks requeridos vigentes.
- `scripts/lib/mcpFailureClassification.mjs` y `scripts/testHarnessDoctor.mjs`: precedente de logica pura extraida con dependencias inyectadas.

## Comportamiento vigente

`opsx:finish` valida la rama y el arbol, hace `git push -u origin <rama>`, crea o reutiliza el PR y llama una sola vez a `gh pr checks <n> --watch --fail-fast` mediante `execFileSync`, sin `try/catch`.

Si GitHub aun no registro el `statusCheckRollup` del commit recien empujado, `gh` devuelve exit 1 con el mensaje de rollup vacio desde `populateStatusChecks` (antes del bucle de watch) y Node imprime un stack trace. `gh` usa exit 1 tanto para ese caso como para checks fallidos (`SilentError`) y exit 8 para pendientes: el codigo de salida no discrimina.

Reintentar el comando funciona porque para entonces el rollup ya existe. El resultado depende del tiempo de registro de GitHub, no del estado del repositorio.

## Comportamiento objetivo

El paso de checks clasifica por evidencia (exit code + `stderr`) en aprobados, pendientes, aun no registrados y fallidos. Solo "aun no registrados" reintenta, con deadline e intervalo configurables (120 s / 5 s por defecto). El primer rollup no vacio entrega el control a `gh pr checks --watch --fail-fast`, sin cambios respecto de hoy.

Agotar el sondeo aborta con diagnostico (PR, commit, tiempo esperado, via de verificacion) y sin merge. Checks fallidos abortan nombrando el fallo. Ningun camino nuevo llega al merge sin un `passed`.

## Compatibilidad legacy

- El camino feliz con checks ya registrados es identico al actual: misma invocacion, mismas banderas.
- `npm run opsx:finish:dry` conserva su corte antes de esperar CI.
- El merge (`--merge --match-head-commit`), `--keep-remote` y la limpieza de ramas no cambian.
- `--checks-deadline 0` reproduce exactamente el comportamiento previo (fallar en la primera consulta), como via de desactivacion sin revertir.
- No se agrega `--required`: se siguen esperando todos los checks, no solo los requeridos.
- Sin datos, claves `@planearia:*`, migraciones ni estado persistente involucrados.

## Owner de spec y contexto

- Spec: nueva capability `opsx-change-closure` en `openspec/specs/` tras archive.
- Contexto DDD: ninguno. Es tooling del harness; no toca contextos delimitados de producto ni requiere contrato cruzado (ver `design.md`).
- Owner tecnico: harness de desarrollo (`scripts/`), mismo owner que `harness:doctor` y `agent:harness:*`.

## Evidencia actual

- `scripts/opsxFinishChange.mjs` lineas 17-28 (`execute` con `execFileSync`) y linea 81 (llamada sin `try/catch`).
- `pkg/cmd/pr/checks/checks.go`: mensaje de rollup vacio en `populateStatusChecks`; `SilentError` para `counts.Failed > 0`; `PendingError` para `counts.Pending > 0`.
- `gh pr checks --help` (gh 2.96.0): "Additional exit codes: 8: Checks pending".
- Checks requeridos en `development`: `TypeScript`, `ESLint`, `Jest`, `Backend smoke`.
- Linea base del doctor antes del change: `Harness doctor: PASS` con `WARN mcp-smoke` conocido (expo/figma).

## Fuera de alcance

- Proteccion de rama de `development` y sus checks requeridos.
- Push directo al target; el cierre sigue siendo por PR.
- Filtrar la espera a checks requeridos (`--required`).
- Convertir fallos de CI en advertencias, reintentar checks fallidos o relanzar workflows.
- Mover `harness:doctor` o estas pruebas a CI.
- El resto de `scripts/opsxFinishChange.mjs`: validacion de rama, creacion del PR, merge y limpieza.
- Los workflows de `.github/workflows/` y la app RN, backend y datos.
