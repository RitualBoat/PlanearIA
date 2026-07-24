# Tasks: sanear-correctitud-react-uxui

Cada `[x]` requiere evidencia de comando. No usar `react-doctor` autofix.

## 1. SyncContext: refs latest-value a efecto post-commit (debt-9be074c6e888)

- [x] 1.1 Eliminar las cuatro asignaciones de refs en render (`SyncContext.tsx:83-86`).
- [x] 1.2 Anadir un unico `useEffect` post-commit con deps `[isOnline, syncEnabled, status, authError]`
  que sincroniza los cuatro refs, declarado antes de los efectos que llaman `syncNow`.
- [x] 1.3 Test de `SyncContext`: (a) los refs no se mutan en render; (b) `syncNow` observa el ultimo
  estado committeado; (c) los efectos de interval/foreground/connectivity no se re-suscriben al cambiar
  estado. Evidencia: `src/__tests__/context/SyncContext.test.tsx` (2 tests verdes).
- [x] 1.4 React Doctor sobre `src/context/SyncContext.tsx`: `no-ref-current-in-render` desaparece (0).
  Evidencia: react-doctor full 4 no-ref-current-in-render -> 0; SyncContext sin diagnosticos.

## 2. Cleanup de efectos verificable (debt-d6e2309f9e15)

- [x] 2.1 `AnimatedTopPill.tsx:72`: subscripcion de focus movida a helper de modulo `subscribeFocus`; el
  efecto tiene una unica cleanup que hace `unsubscribeFocus?.()` y detiene la animacion.
- [x] 2.2 `useContenidoViewModel.ts:181`: subscripcion NetInfo en helper de modulo `subscribeIsOffline`;
  el efecto retorna el unsubscribe. Semantica offline sin cambios.
- [x] 2.3 `DocEditorScreen.tsx:268`: subscripcion `beforeRemove` en helper de modulo `subscribeBeforeRemove`;
  el efecto retorna el unsubscribe. Guard de cambios sin guardar intacto.
- [x] 2.4 Tests de montaje/desmontaje: `src/__tests__/components/AnimatedTopPill.test.tsx` (2) y
  `src/__tests__/contenido/useContenidoViewModel.test.tsx` (unsubscribe al desmontar).
- [x] 2.5 React Doctor sobre los tres archivos: `effect-needs-cleanup` desaparece (0) en cada uno.
  La regla dispara sobre `.addListener`/`.addEventListener` DENTRO de un useEffect; moverlas a un helper
  de modulo (mismo patron que `subscribeConnectivity`) las saca del cuerpo del efecto sin silenciar ni
  cambiar comportamiento.

## 3. Updaters puros (debt-ff7731773cc5)

- [x] 3.1 `RetoResolucionScreen.tsx:76`: updater de `setTimeLeft` puro; efecto separado que limpia el
  interval al llegar a cero; cleanup por unmount conservado.
- [x] 3.2 Test de `RetoResolucionScreen`: cuenta atras, se detiene en cero sin negativo, limpia el
  interval al desmontar. Evidencia: `src/__tests__/feed/RetoResolucionScreen.test.tsx` (+3 tests).
- [x] 3.3 `useDocEditorViewModel.ts`: maquina de historial (`documento`/`past`/`future`/`isDirty`)
  reemplazada por `useReducer` puro con acciones `update`, `undo`, `redo`, `reset`, `markSaved`.
- [x] 3.4 Boot/hidratacion, autoguardado y `guardarDocumento` cableados al reducer (dispatch reset/
  markSaved) sin cambiar el contrato observable.
- [x] 3.5 Test de `useDocEditorViewModel`: undo/redo, dirty-state, limite de 30, no-op e idempotencia
  bajo StrictMode. Evidencia: `src/__tests__/hooks/useDocEditorViewModel.test.tsx` (5 tests verdes).
- [x] 3.6 React Doctor sobre `useDocEditorViewModel.ts` y `RetoResolucionScreen.tsx`:
  `no-impure-state-updater` desaparece (0). Ademas se eliminaron 9 warnings
  `no-side-effect-in-state-updater-function` co-localizados.

## 4. Validacion y evidencia

- [x] 4.1 `npx react-doctor@latest --scope full ...`: 11 errores -> 0; warnings 199 -> 190 (sin nuevos
  diagnosticos). Baseline y final guardados en el scratchpad de la sesion.
- [x] 4.2 `npm run typecheck` (exit 0) y `npm run lint -- --quiet` (exit 0) verdes.
- [x] 4.3 `npm test -- --runInBand`: 855/856 verdes, sin ruido de consola no declarado. La unica falla es
  `harness/spreadsheetDependency.test.ts` (issue preexistente de `tar` en Windows del #133 cerrado, verde
  en CI Linux; reproducida en la base con los cambios en stash, no es regresion de esta ola).
- [x] 4.4 `npm run test:sync -- --runInBand`: 23/23 verdes.
- [x] 4.5 `npm run agent:harness:check` (36 mirrors) y `npm run openspec:validate` (51/0, TLDR OK) verdes.
  `test:debt-control` no existe como script en el repo (tests internos del motor
  `create-project-engineering-os`, no afectados por cambios de app); la paridad la cubre `agent:harness:check`.
- [x] 4.6 Revision adversarial (contexto limpio) PASS con 0 Blockers / 0 Majors (1 Minor rastreado).
  Referencia: https://github.com/RitualBoat/PlanearIA/issues/143#issuecomment-5074377978.
- [x] 4.7 Assessment `kind: remediation`, `result: clean` que resuelve los tres IDs con evidencia.
  `npm run debt:capture` PASS: resolved debt-9be074c6e888, debt-d6e2309f9e15, debt-ff7731773cc5.
  El presupuesto del plan bajo de 5/5 a 2/5 (por debajo del umbral).
- [x] 4.8 `npm run openspec:ready:archive -- --change sanear-correctitud-react-uxui --run-local`: PASS.
