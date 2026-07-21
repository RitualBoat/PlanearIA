# Tasks: sanear-senal-tests-y-codificacion

## 1. Guardia de consola

- [x] 1.1 Crear `jest/helpers/consoleSignal.ts` (helper `expectConsoleError`/`expectConsoleWarn` con consumo por llamada y restauracion) y `jest.setup.consoleGuard.ts`; verificar la opcion de setup correcta con `npx jest --showConfig` antes de cablearlo en `package.json#jest`. (Ubicacion final del helper: `src/__tests__/helpers/consoleSignal.ts`; opcion verificada: `setupFilesAfterEnv`, vacia en el preset.)
- [x] 1.2 Crear `src/__tests__/harness/consoleSignalGuard.test.ts` con las pruebas de la propia guardia: error/warn inesperado falla, declarado pasa, declaracion no consumida falla, declaracion no silencia lo inesperado, aislamiento entre tests. Evidencia: 9/9 tests verdes.

## 2. Check de codificacion

- [x] 2.1 Crear `scripts/checkSourceEncoding.mjs` (funcion `findEncodingIssues` + CLI con exit 1 y reporte archivo:linea; regex con escapes Unicode, archivo ASCII-only).
- [x] 2.2 Crear fixtures `src/__tests__/harness/fixtures/encoding/mojibake.sample.tsx` (positivo) y `utf8-legitimo.sample.tsx` (negativo con el repertorio espanol completo) y excluirlos del escaneo.
- [x] 2.3 Crear `src/__tests__/harness/sourceEncoding.test.ts`: fixture positivo detectado con lineas correctas, fixture negativo en cero, escaneo de `src` en cero (gate permanente). Evidencia: positivo y negativo verdes; el gate de repo queda rojo hasta la tarea 3, por diseno.

## 3. Correccion de mojibake (5 archivos verificados)

- [x] 3.1 Corregir `src/components/editor/sections/SeccionCurricular.tsx` y `src/screens/planeaciones/ExportarPlaneacionScreen.tsx` al texto espanol previsto (script con conteo exacto de ocurrencias). Evidencia: `node scripts/checkSourceEncoding.mjs` en cero para ambos.
- [x] 3.2 Corregir `src/__tests__/planeaciones/ExportarPlaneacionScreen.test.tsx`, `src/__tests__/planeaciones/useListaPlaneacionesViewModel.test.tsx` y `src/__tests__/sync/syncEngine.test.ts` (aserciones y comentarios al texto correcto). Evidencia: `node scripts/checkSourceEncoding.mjs` => "Sin doble codificacion UTF-8 en src"; suites de planeaciones verdes; syncEngine pasa los 24 tests de logica y solo falla la guardia de ruido (tarea 4).

## 4. Limpieza de suites ruidosas

- [x] 4.1 Corregir warnings `act()` en `src/__tests__/grupos/useDetalleGrupoViewModel.test.tsx` (18 ocurrencias) y en cualquier otra suite donde aparezcan al activar la guardia. Evidencia: montaje envuelto en `await act(async () => {})` via helper `renderViewModel`; suite verde sin warnings `act()` ni allowances que los encubran.
- [x] 4.2 Declarar/limpiar la salida esperada en las suites restantes identificadas el 2026-07-20: `perfil/PerfilScreen`, `settings/cuentaScreenRuntimeTheming`, `components/assign/assignSheet`, `notificaciones/NotificacionesIntegration` (warns de expo-notifications con justificacion), `components/base/estados`, `components/sync/componentesSync`, `components/base/controles`, `alumnos/useImportarAlumnosViewModel`, `planeaciones/PlaneacionesContext.clonarPlaneacion`, `planeaciones/useCrearPlaneacionViewModel`, `grupos/grupoExportService`, `hooks/useAssignSheet`, `sync/syncEngine`, `sync/offlineSyncFlow`, `grupos/gruposService`, `grupos/grupoAsignacionesService`, `grupos/gruposSync`. Evidencia: `console.error`/`console.warn` esperados declarados por test con el helper (`useAssignSheet`, `syncEngine`, `notificaciones`); ruido de `console.log` del logger espiado/restaurado por suite; cada suite pasa sin lineas `console.*` no declaradas.
- [x] 4.3 Corrida completa `npm test -- --runInBand`: 118 suites / 827 tests verdes (116/815 base + 2 suites/12 tests de harness) y salida sin `console.error`/`console.warn` no declarados (`grep -cE "console.(error|warn)"` sobre la salida = 0). Adjuntar resumen al PR.

## 5. Cierre

- [x] 5.1 `npm run typecheck` y `npm run lint -- --quiet` verdes. Evidencia: ambos exit 0 el 2026-07-20.
- [x] 5.2 `npm run test:debt-control`, `npm run agent:harness:check` y `npm run agent:opsx:patch:check` verdes (superficie harness). Evidencia: debt-control 58/58; harness `OK (36 mirrors in parity)`; opsx-patch `OK (CLI local y sin comandos zombi)`.
- [x] 5.3 Revision adversarial independiente documentada en el issue #132 con veredicto y clasificacion de hallazgos; cero Blockers/Majors. Evidencia: veredicto PASS, 0 Blockers / 0 Majors / 4 Minors rastreados (scope del check a `src/`, texto sin acento no-mojibake en `EJES_ARTICULADORES`, semantica de consumo de la guardia, refs de readiness); publicada en #132.
- [x] 5.4 Assessment `kind: remediation` capturado con `npm run debt:capture` resolviendo `debt-cbe0188191b5` y `debt-f466da64b58a` con evidencia, sin candidatos confirmados nuevos. Evidencia: `capture: PASS ... resolved:debt-cbe0188191b5, resolved:debt-f466da64b58a`; `debt:check` PASS con el plan harness activo 3/5.
- [x] 5.5 `npm run openspec:ready:archive -- --change sanear-senal-tests-y-codificacion --run-local` en PASS y `readiness.json` completo.
