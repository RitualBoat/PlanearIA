# Evidencia local: baseline y validación cross-platform

Fecha: 2026-07-23. Change: `endurecer-gates-harness-ci`, issue #136.

## Reproducción antes de corregir

- `git show 948813e:<script>` confirmó el guard manual con `process.argv[1].replaceAll(...)` en los cuatro scripts objetivo.
- Para un `argv[1]` POSIX absoluto, la concatenación legada forma `file:////home/runner/...`; la URL de archivo POSIX correcta es `file:///home/runner/...`. Esa diferencia deja el bloque CLI sin ejecutar.
- `.github/workflows/agent-harness-parity.yml` tenía siete claves `continue-on-error: true`.
- `npm ls baseline-browser-mapping --all` reportó `2.8.22`; lint y Jest emitían el aviso de datos de más de dos meses.
- `NODE_OPTIONS=--trace-warnings npm test -- --runInBand` localizó `ExperimentalWarning: localStorage is not available...` en `docx` al cargar `planeacionExportService` desde `jest-environment-node`.
- `sourceEncoding.test.ts` heredaba las seis líneas intencionales del fixture positivo porque `execFileSync` propagaba su stderr.

## Cambios aplicados y señales resultantes

- Los cuatro guards ahora comparan con `pathToFileURL(process.argv[1]).href` y la prueba `scripts/testHarnessCliEntrypoints.mjs` comprueba marcadores de proceso reales.
- El caso negativo de la prueba aserta que un resultado `status: 0` sin salida provoca fallo; no puede pasar por vacuidad.
- `baseline-browser-mapping` quedó como devDependency `2.11.1`, sin tocar `expo@54.0.36` ni ejecutar `npm audit fix`.
- `scripts/runJest.mjs` desactiva únicamente `--experimental-webstorage` cuando el runtime conoce su flag; Node 20 mantiene la ruta normal. No usa `--no-warnings` ni filtros.
- El fixture de codificación usa `spawnSync` con pipes y aserta las seis referencias archivo:línea sin imprimirlas en Jest.
- La validación reveló adicionalmente `DEP0190` de `shell: true` en `harnessDoctor`; el runner ahora ejecuta `cmd.exe` explícitamente con `shell: false`, acepta solo tokens sin metacaracteres de `cmd.exe` y `harness:doctor` ya no usa `--no-warnings`. La prueba de proceso ejecuta `--json --entrypoint-test`, valida JSON/checks/código/stderr y usa un runner determinista que deja toda verificación operativa —incluidos `codegraph` y `mcp-smoke`— como `FAIL` explícito; ese modo no puede declarar salud remota ni depender de herramientas del host. `--help` mantiene la cobertura de salida rápida y `testHarnessDoctor.mjs` cubre el diagnóstico operativo completo.
- El inventario final de claves YAML `continue-on-error` es **0**. El workflow usa matriz `ubuntu-latest` y `windows-latest` y no modifica branch protection ni checks remotos.

## Validaciones PASS

| Comando o prueba | Resultado |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint -- --quiet` | PASS; sin aviso `baseline-browser-mapping` |
| `npm test -- --runInBand` | PASS: 121 suites, 843 tests; sin `ExperimentalWarning` ni seis líneas del fixture |
| `npm run backend:check` | PASS; aislamiento por `userId` completo |
| `npm run test:debt-control` | PASS: 58 tests |
| `npm run agent:harness:check` | PASS: 36 mirrors |
| `npm run agent:opsx:patch:check` | PASS |
| `npm run openspec:validate` | PASS: 47 artefactos; TLDR PASS |
| `npm run test:openspec-cli` / `test:openspec-readiness` / `test:gitnexus` | PASS |
| `npm run test:harness:cli` | PASS en Windows Node 26 y Node 20 |
| Ubuntu/WSL Node 20 temporal | `npm run test:harness:cli` PASS; runtime eliminado después |
| `npm run agent:harness:sync` seguido de `agent:harness:check` | PASS, sin cambios de estado entre runs |
| `npm audit --json` | 1 low, 20 moderate, 0 high, 0 critical; sin drift |

La repetición final posterior al último ajuste pasó `typecheck`, lint quiet, `test:harness:cli`,
`test:harness:doctor`, Jest completo (121 suites / 843 tests), `backend:check` y
`openspec:validate`. La segunda generación de harness no produjo cambios y su comprobación,
`agent:opsx:patch:check`, las 58 pruebas de deuda, `test:openspec-cli`,
`test:openspec-readiness` y `test:gitnexus` también pasaron.

`npm run debt:capture -- --flow endurecer-gates-harness-ci --input ...` capturó el assessment
`kind: remediation`, resolvió `debt-2887d890144e` y dejó el plan
`preparacion-operativa-sdd-harness` en 0/5, sin flujos con deuda abierta. Su artefacto inmutable es
`.project-os/debt/assessments/endurecer-gates-harness-ci.json`.

La versión final de `test:harness:cli` exige que `--entrypoint-test` reporte los diez checks
operativos como `FAIL` y solo `graphify` como `SKIP`; también pasó en Windows con Node 26 y Node 20,
y en Ubuntu/WSL con Node 20.20.2 temporal. El runtime Linux se eliminó al terminar la prueba.

## Limitación resuelta

Ubuntu estaba instalado sin Node. Se descargó Node 20.20.2 de forma temporal bajo el workspace para ejecutar la prueba real en WSL; el directorio temporal se eliminó tras el PASS. No se instaló runtime ni paquetes en Ubuntu.
