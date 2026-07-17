# Design: espera determinista de checks en opsx:finish

## Context

`scripts/opsxFinishChange.mjs` cierra un change mediante PR. Tras `git push -u origin <rama>` (linea 62) y crear o reutilizar el PR, espera CI con una sola invocacion (linea 81):

```js
gh('pr', 'checks', String(pullRequest.number), '--watch', '--fail-fast', { capture: false });
```

`execute()` (lineas 17-28) usa `execFileSync`, que lanza ante cualquier exit distinto de cero. Esa llamada no esta en `try/catch`, asi que el fallo sale como stack trace de Node sin diagnostico.

Contrato observable de `gh` verificado en `cli/cli`, `pkg/cmd/pr/checks/checks.go` (gh 2.96.0):

| Estado real | Salida de `gh` | Distinguible por |
| --- | --- | --- |
| Todos aprobados | exit 0 | codigo |
| Alguno pendiente | exit 8 (`PendingError`) | codigo |
| Alguno fallido | exit 1 (`SilentError`, sin mensaje) | codigo insuficiente |
| Rollup aun vacio | exit 1 + `stderr` con el mensaje de rollup vacio | solo `stderr` |

Dos hechos fijan el diseno:

1. `--watch` no ayuda. El error de rollup vacio se devuelve desde `populateStatusChecks`, que corre **antes** del bucle de watch y aborta el comando. No existe una bandera de `gh` que espere a que los checks aparezcan.
2. El exit code no discrimina entre rollup vacio y checks fallidos: ambos son exit 1. Colapsar los dos casos es exactamente el bug. El unico discriminante disponible es el `stderr`.

Restriccion operativa: `development` es rama protegida con checks requeridos `TypeScript`, `ESLint`, `Jest`, `Backend smoke`. Un PR sano hacia ese target siempre termina con rollup no vacio, asi que "sin checks" no es un estado final legitimo.

### Contextos delimitados afectados

Ninguno de `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`. El change es tooling del harness de desarrollo: no toca entidades de producto, `userId`, `src/sync`, permisos ni confirmacion IA, y no cruza contextos. **No requiere contrato cruzado.** Los invariantes del mapa DDD no aplican porque no hay dato de producto involucrado.

## Goals / Non-Goals

**Goals:**

- Clasificar el resultado de `gh pr checks` por evidencia, no por codigo de salida solo.
- Absorber la ventana de registro del rollup con sondeo acotado, sin intervencion manual.
- Diagnostico accionable en cada camino de fallo; ningun stack trace crudo.
- Conservar sin cambios la espera de checks ya registrados.
- Logica testeable sin lanzar procesos ni dormir en tiempo real.

**Non-Goals:**

- Tocar proteccion de rama o checks requeridos.
- Push directo al target: el cierre sigue siendo por PR.
- Agregar `--required` a `gh pr checks`. Hoy se esperan **todos** los checks; filtrar a los requeridos ignoraria un check no requerido en rojo y debilitaria la espera.
- Convertir un fallo de CI en advertencia, reintentar checks fallidos o relanzar workflows.
- Mover `harness:doctor` o estas pruebas a CI: siguen siendo gate local.
- Cambiar el merge (`--merge --match-head-commit`) ni la limpieza de ramas.

## Decisions

### 1. Clasificar por (exit code, stderr), con `stderr` como unico discriminante del rollup vacio

`classifyChecksOutcome({ exitCode, stderr })` devuelve `passed` | `pending` | `not-registered` | `failed`.

Regla: exit 0 es `passed`; exit 8 es `pending`; exit 1 con `stderr` que coincida con el mensaje de rollup vacio de `gh` es `not-registered`; **cualquier otro** exit distinto de cero es `failed`.

Se reconocen las dos variantes que emite `gh`: rollup totalmente vacio y, por robustez, la variante de "no required checks reported" aunque este change no pase `--required`.

*Alternativa descartada:* consultar `gh pr checks --json` y contar nodos. Devuelve el mismo error ante rollup vacio, asi que no evita la clasificacion por `stderr` y agrega una llamada extra.

*Alternativa descartada:* tratar todo exit 1 como reintentable. Reintentaria checks fallidos hasta el timeout y convertiria un rojo claro en un timeout confuso. Inaceptable.

**El default es seguro:** un `stderr` desconocido cae en `failed` y aborta. Si `gh` cambia el texto del mensaje, el script vuelve al comportamiento actual (abortar), nunca a mergear sin checks. La direccion del fallo es la correcta.

### 2. Sondear solo el estado `not-registered`, con deadline

`waitForChecks({ runChecks, sleep, now, deadlineMs, intervalMs })` repite mientras el estado sea `not-registered` y no se agote el deadline. Cualquier otro estado sale del bucle de inmediato: `passed` continua, `failed` aborta, `pending` significa que el rollup ya existe.

Solo se reintenta la condicion transitoria por construccion. Un check fallido nunca se reintenta.

### 3. Sondeo y watch como fases separadas

Fase 1: sondeo corto (`gh pr checks <n>` sin `--watch`) hasta que el rollup exista. Fase 2: `gh pr checks <n> --watch --fail-fast`, identico a hoy.

Separarlas mantiene la espera actual intacta: el sondeo cubre **solo** la ventana previa al registro y desaparece en cuanto hay un rollup. Un solo bucle con `--watch` mezclaria "esperar a que aparezcan" con "esperar a que terminen" y arriesgaria debilitar la segunda.

Defaults: deadline 120 s, intervalo 5 s. Suficiente para el registro de GitHub (segundos) y corto frente a la duracion de CI. Ambos configurables por bandera para permitir 0 (comportamiento previo) y para las pruebas.

### 4. Timeout aborta sin merge, con diagnostico

Agotar el deadline usa el mismo `abort()` del script: mensaje, exit 1, sin merge. El mensaje nombra PR, commit (`headRefOid`), tiempo esperado y donde verificar. Ningun camino traduce "sin checks" a "checks en verde": el merge solo ocurre tras un `passed` de la fase de watch.

### 5. Logica pura en `scripts/lib/`, siguiendo el precedente del doctor

`scripts/lib/prChecksWait.mjs` no importa `child_process` ni usa el reloj real: recibe `runChecks`, `sleep` y `now` inyectados. Mismo patron que `scripts/lib/mcpFailureClassification.mjs`, que existe aparte precisamente para que doctor y pruebas la usen sin lanzar procesos.

`scripts/opsxFinishChange.mjs` conserva el `execFileSync` real y solo cablea las dependencias. Las pruebas corren instantaneas y son deterministas.

## Risks / Trade-offs

- **`gh` cambia el texto del mensaje de rollup vacio** → El sondeo deja de reconocerlo y el script aborta como hoy: se pierde la mejora, no la seguridad. Las pruebas fijan el string exacto, asi que una actualizacion de `gh` que lo cambie rompe la prueba antes que el flujo real.
- **El deadline no alcanza en un GitHub degradado** → Aborta con diagnostico y el operador reintenta, que es el comportamiento actual pero explicado. El deadline es configurable.
- **Un PR legitimamente sin checks nunca cerraria** → Imposible hacia `development`, que exige cuatro checks requeridos. Si algun dia existe un target sin checks, el diagnostico del timeout lo dice y la bandera de deadline permite optar por el camino previo. Preferimos fallar cerrado.
- **Acoplamiento al stderr de una herramienta externa** → Trade-off aceptado: `gh` no expone otro discriminante. Se acota a un modulo pequeno con pruebas propias y contrato documentado.

## Migration Plan

Sin migracion: no hay datos, estado persistente ni configuracion remota. El change entra por PR y aplica desde el siguiente `opsx:finish`.

**Rollback.** Revertir el commit del PR restaura la invocacion directa. Desactivacion parcial sin revertir: `--checks-deadline 0` reproduce el comportamiento previo de fallar al primer rollup vacio.

## Open Questions

Ninguna. Los defaults (120 s / 5 s) son ajustables por bandera si la evidencia operativa lo pide.
