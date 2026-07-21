# Brownfield baseline: sanear-senal-tests-y-codificacion

## Superficies tocadas

- `package.json#jest` (setup de la guardia).
- Nuevos: `jest.setup.consoleGuard.ts`, `jest/helpers/consoleSignal.ts`, `scripts/checkSourceEncoding.mjs`, `src/__tests__/harness/consoleSignalGuard.test.tsx`, `src/__tests__/harness/sourceEncoding.test.ts`, `src/__tests__/harness/fixtures/encoding/*`.
- Mojibake: `src/components/editor/sections/SeccionCurricular.tsx`, `src/screens/planeaciones/ExportarPlaneacionScreen.tsx`, `src/__tests__/planeaciones/ExportarPlaneacionScreen.test.tsx`, `src/__tests__/planeaciones/useListaPlaneacionesViewModel.test.tsx`, `src/__tests__/sync/syncEngine.test.ts`.
- Suites ruidosas listadas en `tasks.md` 4.2 (declaraciones de salida esperada y correccion de `act()`).

## Fuentes de verdad actuales

- `package.json#jest` (preset jest-expo, roots `src`).
- `src/utils/logger.ts` (guarda `__DEV__`, activo en Jest).
- Salida real de `npm test -- --runInBand` del 2026-07-20: 116 suites / 815 tests verdes con ruido catalogado.
- Registro de deuda `.project-os/debt/registry.json` items `debt-cbe0188191b5` y `debt-f466da64b58a`.

## Comportamiento vigente

- Los tests pasan aunque emitan `console.error/warn/log`; los warnings `act()` no fallan nada.
- Ningun check detecta doble codificacion; el mojibake entra y persiste sin senal.
- Los tests de la pantalla de exportacion afirman textos corrompidos (p.ej. `Â¡PlaneaciÃ³n exportada!`).

## Comportamiento objetivo

- `console.error/warn` inesperado falla el test con el contenido capturado; la salida esperada se declara por test y la declaracion sin uso falla.
- El check de codificacion corre como test permanente: `src` limpio pasa, cualquier regresion falla con archivo:linea.
- Los textos corregidos afirman la forma espanola correcta.

## Compatibilidad legacy

- No cambia ningun contrato de producto, sync, storage ni `logger.ts`; solo se agrega setup de Jest y un script.
- Las suites no listadas no se modifican; si la guardia expone ruido en una suite no catalogada, se trata en la tarea 4.2 con el mismo criterio.

## Owner de spec y contexto

- Specs nuevas: `test-console-signal-guard`, `source-encoding-integrity` (este change).
- Contexto DDD: infraestructura de pruebas/repo; sin bounded context de dominio ni contrato cruzado (`design.md`).

## Evidencia actual

- `npm test -- --runInBand` (2026-07-20): PASS con lineas `console.*` en ~18 suites (sync, grupos, notificaciones, `useDetalleGrupoViewModel` con 18 warnings `act()`).
- `npx jest src/__tests__/grupos/useDetalleGrupoViewModel.test.tsx`: warnings `act()` reproducidos.
- Grep de patrones de doble codificacion sobre `src`: 5 archivos coincidentes; backend y scripts limpios.

## Fuera de alcance

- Knip como gate, refactor del logger, `console.log/info` con fallo duro, mocks pesados de terceros, cambios visuales de UI (sin gate Playwright: no hay cambio de layout), deuda de otros planes y las Olas 2-3 de #129.
