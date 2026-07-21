# Proposal: sanear-senal-tests-y-codificacion

> Issue: [#132](https://github.com/RitualBoat/PlanearIA/issues/132) (child del epic de saneamiento [#129](https://github.com/RitualBoat/PlanearIA/issues/129)).
> Plan maestro: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (Ola 2 `limpiar-senal-tests` + parte de Ola 3 `baseline-knip-mojibake`).
> Deuda objetivo: `debt-cbe0188191b5` (ruido de consola/act() en suites) y `debt-f466da64b58a` (mojibake en codigo y tests).

## Why

Las 116 suites / 815 tests pasan verdes pero ~18 suites emiten `console.log/warn/error` sin que nada falle: el ruido esconde regresiones reales y gasta contexto de agentes. Ademas, 5 archivos de `src` contienen mojibake UTF-8 doble verificado (textos visibles como "EvaluaciÃ³n" en vez de "Evaluación") y ningun check impide que se propague. Ambos hallazgos degradan la misma cosa: la senal de calidad del repositorio. Sin guardias, cada change nuevo puede reintroducir ruido o basura de codificacion sin que nadie lo note.

## What Changes

- Correccion del mojibake verificado en exactamente 5 archivos: `src/components/editor/sections/SeccionCurricular.tsx`, `src/screens/planeaciones/ExportarPlaneacionScreen.tsx`, `src/__tests__/planeaciones/ExportarPlaneacionScreen.test.tsx`, `src/__tests__/planeaciones/useListaPlaneacionesViewModel.test.tsx`, `src/__tests__/sync/syncEngine.test.ts`.
- Nuevo check determinista de codificacion (`scripts/checkSourceEncoding.mjs`) con fixtures de prueba positivos y negativos, cableado como test de Jest para que corra en la suite normal y en CI.
- Nueva guardia de consola para Jest (setup file) que hace fallar `console.error`/`console.warn` inesperados, con un helper explicito para declarar logs esperados por test.
- Limpieza de las ~18 suites ruidosas: logs esperados espiados/declarados, warnings `act()` reales corregidos al quedar expuestos.

## Capabilities

### New Capabilities

- `test-console-signal-guard`: guardia de Jest que convierte `console.error`/`console.warn` inesperados en fallos de test y ofrece un mecanismo local y explicito para declarar salida esperada sin silenciar la inesperada.
- `source-encoding-integrity`: check determinista que rechaza patrones de doble codificacion UTF-8 en fuentes de `src`, con fixtures que demuestran deteccion (positivos) y ausencia de falsos positivos sobre UTF-8 legitimo (negativos).

### Modified Capabilities

(ninguna: no cambia comportamiento de producto especificado; la correccion de mojibake restaura los textos previstos que los tests existentes ya esperaban corrompidos, y se actualizan esas aserciones al texto correcto)

## Impact

- **Codigo:** 5 archivos con mojibake (2 de producto, 3 de tests); ~18 suites de `src/__tests__`; `package.json#jest` (setupFiles); nuevos `scripts/checkSourceEncoding.mjs`, `src/__tests__/harness/sourceEncoding.test.ts` (+ fixtures) y `jest/consoleSignalGuard` (setup + helper).
- **APIs/contratos:** ninguno. No se toca `src/utils/logger.ts` ni su contrato.
- **Dependencias:** ninguna nueva; se usa solo la toolchain vigente (Jest via jest-expo, Node).
- **Sistemas:** CI (`ci.yml`) hereda el check de codificacion al correr Jest; sin workflows nuevos.

## No objetivos

- No migrar suites a otra estructura ni reescribir tests de producto.
- No silenciar warnings de terceros dentro de `node_modules`.
- No activar Knip como gate (el baseline Knip queda para su propio change).
- No tocar comportamiento visual de pantallas; la correccion de mojibake restaura el string previsto y se valida con las aserciones de texto existentes (sin cambio de layout, por lo que no aplica gate visual Playwright).
- No refactorizar `src/utils/logger.ts` ni cambiar su contrato `__DEV__`.
- No corregir deuda de otros planes (`uxui-navegacion-global`) ni los otros tres hallazgos de #129 (Olas 2 y 3).
