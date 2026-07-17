# Tasks: espera determinista de checks en opsx:finish

## 1. Logica pura de clasificacion y sondeo

- [x] 1.1 Crear `scripts/lib/prChecksWait.mjs` con `classifyChecksOutcome({ exitCode, stderr })` que devuelva `passed` | `pending` | `not-registered` | `failed`, reconociendo las dos variantes del mensaje de rollup vacio de `gh` y tratando todo `stderr` no reconocido como `failed`. Documentar en comentario el porque del `stderr` como unico discriminante.
- [x] 1.2 Agregar a ese modulo `waitForChecks({ runChecks, sleep, now, deadlineMs, intervalMs })` que reintente solo mientras el estado sea `not-registered`, salga de inmediato ante cualquier otro estado y reporte el tiempo esperado al agotar el deadline. Sin `child_process` ni reloj real.

Evidencia: `scripts/lib/prChecksWait.mjs`. `node --check` OK. El modulo no importa `child_process` ni usa `Date.now()`.

## 2. Pruebas de la logica

- [x] 2.1 Crear `scripts/testOpsxFinish.mjs` con ejecutor y reloj inyectados, cubriendo: checks tardios (varios `not-registered` y luego rollup presente), timeout agotado con diagnostico, y checks realmente fallidos que abortan sin agotar el deadline.
- [x] 2.2 Cubrir tambien los casos de frontera: exit 0 (`passed`), exit 8 (`pending`), `stderr` no reconocido con exit distinto de cero (`failed`, nunca `not-registered`) y `deadlineMs: 0` (una sola consulta, comportamiento previo).
- [x] 2.3 Registrar `test:opsx-finish` en `package.json` y verificar que la prueba corre sin red ni procesos y termina de inmediato.

Evidencia: `npm run test:opsx-finish` -> `opsx-finish checks wait: OK (clasificacion, checks tardios, timeout, checks fallidos y fronteras)`. La suite no lanza procesos ni duerme en tiempo real (reloj virtual). Una asercion inicial del timeout estaba mal calculada (esperaba 6 consultas/25s); el codigo era correcto y se corrigio la prueba a 7 consultas/30s: con deadline 30s e intervalo 5s se consulta en t=0,5,10,15,20,25,30.

## 3. Integracion en el script de cierre

- [x] 3.1 Cablear `waitForChecks` en `scripts/opsxFinishChange.mjs` reemplazando la invocacion directa de la linea 81: fase 1 de sondeo con `gh pr checks <n>` capturando `stderr`, fase 2 con `gh pr checks <n> --watch --fail-fast` sin cambios. Conservar `abort()` como unica salida de fallo.
- [x] 3.2 Agregar banderas `--checks-deadline` y `--checks-interval` con defaults 120 s y 5 s, aceptando `0` para reproducir el comportamiento previo.
- [x] 3.3 Verificar que el timeout aborta con diagnostico que nombra PR, commit, tiempo esperado y via de verificacion, y que ningun camino nuevo alcanza el merge sin `passed`.
- [x] 3.4 Confirmar que `npm run opsx:finish:dry` sigue cortando antes de esperar CI y que no se agrego `--required` ni se altero el merge ni la limpieza de ramas.

Evidencia:

- La fase 2 conserva la invocacion original, ahora en `try/catch` que aborta con mensaje en vez de volcar la pila. No se agrego `--required`: se siguen esperando todos los checks.
- Validacion de banderas: `--checks-deadline abc` -> `ABORTADO: --checks-deadline espera segundos no negativos; recibio 'abc'.`; `--checks-deadline -5` -> mismo abort con `'-5'`.
- `npm run opsx:finish:dry` -> `PR seria creado; dry-run termina antes de esperar CI.` El corte ocurre en la rama `catch` de creacion del PR, antes del sondeo.
- `npm run opsx:finish:dry -- --checks-deadline 0` -> mismo corte, sin efectos.
- El merge (`--merge --match-head-commit`), `--keep-remote` y la limpieza de ramas quedan sin tocar; solo se alcanzan tras un `passed` de la fase 2.

## 4. Documentacion y validacion

- [x] 4.1 Documentar en `Documentacion/02-operacion/` la espera de checks, el significado de cada estado y el diagnostico de timeout con su ruta de recuperacion.
- [x] 4.2 Ejecutar y adjuntar evidencia de `npm run test:opsx-finish`, `npm run lint -- --quiet`, `npm run openspec:validate` y `npm run agent:harness:check`.
- [x] 4.3 Ejecutar `npm run harness:doctor` y confirmar que no aparecen `FAIL` nuevos respecto de la linea base (WARN conocido de expo/figma).
- [x] 4.4 Ejecutar `/adversarial-review` sobre el change y registrar el resultado en el issue #96 antes de archive.

Evidencia:

- `Documentacion/02-operacion/OPENSPEC_CLI.md`: seccion "Cierre del change y espera de checks" (tabla de los cuatro estados, banderas y diagnostico de timeout), entrada en "Comandos diarios" y dos filas nuevas en "Errores frecuentes".
- `npm run test:opsx-finish` -> OK. `npm run lint -- --quiet` -> sin hallazgos. `npm run openspec:validate` -> `Totals: 23 passed, 0 failed` + `openspec-tldr: OK`. `npm run agent:harness:check` -> `OK (36 mirrors in parity)`. `npm run agent:opsx:patch:check` -> `OK (CLI local y sin comandos zombi)`.
- `npm run harness:doctor` -> `Harness doctor: PASS`. Sin `FAIL`. Unicos WARN: `mcp-smoke` (expo/figma, conocido y clasificado en el change #94) y `git-worktree` por cambios locales sin commitear durante la ejecucion.
- Revision adversarial: registrada en el issue #96 (ver `readiness.json`).
