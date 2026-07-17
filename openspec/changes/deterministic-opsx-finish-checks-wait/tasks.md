# Tasks: espera determinista de checks en opsx:finish

## 1. Logica pura de clasificacion y sondeo

- [ ] 1.1 Crear `scripts/lib/prChecksWait.mjs` con `classifyChecksOutcome({ exitCode, stderr })` que devuelva `passed` | `pending` | `not-registered` | `failed`, reconociendo las dos variantes del mensaje de rollup vacio de `gh` y tratando todo `stderr` no reconocido como `failed`. Documentar en comentario el porque del `stderr` como unico discriminante.
- [ ] 1.2 Agregar a ese modulo `waitForChecks({ runChecks, sleep, now, deadlineMs, intervalMs })` que reintente solo mientras el estado sea `not-registered`, salga de inmediato ante cualquier otro estado y reporte el tiempo esperado al agotar el deadline. Sin `child_process` ni reloj real.

## 2. Pruebas de la logica

- [ ] 2.1 Crear `scripts/testOpsxFinish.mjs` con ejecutor y reloj inyectados, cubriendo: checks tardios (varios `not-registered` y luego rollup presente), timeout agotado con diagnostico, y checks realmente fallidos que abortan sin agotar el deadline.
- [ ] 2.2 Cubrir tambien los casos de frontera: exit 0 (`passed`), exit 8 (`pending`), `stderr` no reconocido con exit distinto de cero (`failed`, nunca `not-registered`) y `deadlineMs: 0` (una sola consulta, comportamiento previo).
- [ ] 2.3 Registrar `test:opsx-finish` en `package.json` y verificar que la prueba corre sin red ni procesos y termina de inmediato.

## 3. Integracion en el script de cierre

- [ ] 3.1 Cablear `waitForChecks` en `scripts/opsxFinishChange.mjs` reemplazando la invocacion directa de la linea 81: fase 1 de sondeo con `gh pr checks <n>` capturando `stderr`, fase 2 con `gh pr checks <n> --watch --fail-fast` sin cambios. Conservar `abort()` como unica salida de fallo.
- [ ] 3.2 Agregar banderas `--checks-deadline` y `--checks-interval` con defaults 120 s y 5 s, aceptando `0` para reproducir el comportamiento previo.
- [ ] 3.3 Verificar que el timeout aborta con diagnostico que nombra PR, commit, tiempo esperado y via de verificacion, y que ningun camino nuevo alcanza el merge sin `passed`.
- [ ] 3.4 Confirmar que `npm run opsx:finish:dry` sigue cortando antes de esperar CI y que no se agrego `--required` ni se altero el merge ni la limpieza de ramas.

## 4. Documentacion y validacion

- [ ] 4.1 Documentar en `Documentacion/02-operacion/` la espera de checks, el significado de cada estado y el diagnostico de timeout con su ruta de recuperacion.
- [ ] 4.2 Ejecutar y adjuntar evidencia de `npm run test:opsx-finish`, `npm run lint -- --quiet`, `npm run openspec:validate` y `npm run agent:harness:check`.
- [ ] 4.3 Ejecutar `npm run harness:doctor` y confirmar que no aparecen `FAIL` nuevos respecto de la linea base (WARN conocido de expo/figma).
- [ ] 4.4 Ejecutar `/adversarial-review` sobre el change y registrar el resultado en el issue #96 antes de archive.
