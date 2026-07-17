# Hacer determinista la espera de checks en opsx:finish

Issue: [#96](https://github.com/RitualBoat/PlanearIA/issues/96)

## Why

`npm run opsx:finish` consulta los checks del PR inmediatamente despues de hacer push, cuando GitHub todavia puede no haber registrado el `statusCheckRollup` del commit. En esa ventana `gh pr checks` falla en vez de esperar, y el script lo presenta como un stack trace de `execFileSync`. El mismo comando, sobre el mismo estado correcto, tiene dos resultados segun el tiempo de registro de GitHub: reintentar funciona, pero el paso final del flujo SDD no es determinista para un agente.

El problema no se resuelve con `--watch`: el error de rollup vacio se devuelve desde `populateStatusChecks`, antes del bucle de watch. Y no se puede clasificar por codigo de salida: `gh` usa exit 1 tanto para "checks aun no registrados" como para "checks fallidos" (`SilentError`). El unico discriminante es el `stderr`.

## What Changes

- `opsx:finish` clasifica el resultado de `gh pr checks` por evidencia (par exit code + `stderr`) en cuatro estados: aprobados, pendientes, aun no registrados y fallidos.
- Antes de concluir que no hay checks, el script sondea con reintentos acotados por un deadline configurable. Solo el estado "aun no registrados" reintenta.
- El primer rollup no vacio entrega el control a `gh pr checks --watch --fail-fast`, que conserva intacta la espera actual de checks.
- Agotar el sondeo aborta con diagnostico accionable (PR, commit, tiempo esperado, que revisar) y **sin merge**. "Sin checks" nunca se interpreta como "checks en verde".
- Checks fallidos abortan nombrando el fallo, sin stack trace crudo.
- La clasificacion y el bucle de sondeo viven en `scripts/lib/` con reloj y ejecutor inyectados, con pruebas para checks tardios, timeout y checks fallidos.

No hay cambios de comportamiento cuando los checks ya estan registrados: ese camino es identico al actual.

## Capabilities

### New Capabilities

- `opsx-change-closure`: cierre de un change OpenSpec mediante PR hacia la rama protegida, incluida la espera determinista de checks, la clasificacion de sus estados y la prohibicion de push directo al target.

### Modified Capabilities

Ninguna. Ninguna spec vigente en `openspec/specs/` describe hoy el comportamiento de `opsx:finish`.

## Impact

Codigo afectado:

- `scripts/opsxFinishChange.mjs`: reemplaza la invocacion directa de la linea 81 por la espera clasificada.
- `scripts/lib/prChecksWait.mjs` (nuevo): clasificacion y sondeo puros, sin procesos ni relojes reales.
- `scripts/testOpsxFinish.mjs` (nuevo): pruebas con ejecutor y reloj inyectados.
- `package.json`: script `test:opsx-finish`.
- `Documentacion/02-operacion/`: documenta la espera y el diagnostico de timeout.

Sin impacto en: proteccion de rama, checks requeridos (`TypeScript`, `ESLint`, `Jest`, `Backend smoke`), workflows de CI, app RN, backend ni datos. Las pruebas nuevas son gate local, igual que `test:harness:doctor`; no entran a CI.

Dependencia externa: el contrato observable de `gh` (mensaje de rollup vacio en `stderr`, exit 8 para pendientes). Se verifico contra `cli/cli` `pkg/cmd/pr/checks/checks.go` y `gh` 2.96.0. El diseno degrada de forma segura si ese contrato cambia: un `stderr` no reconocido se trata como fallo y aborta, nunca como "sin checks" silencioso.
