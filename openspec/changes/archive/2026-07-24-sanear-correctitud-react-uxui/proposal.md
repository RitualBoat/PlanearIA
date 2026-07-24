# Proposal: sanear-correctitud-react-uxui

Issue: #143 (Ola 1 del epic de saneamiento #141, plan `uxui-navegacion-global`).

## Why

El plan `uxui-navegacion-global` esta pausado 5/5 por `budget-threshold`. Tres hallazgos de
correctitud React del backlog del plan son, en conjunto, la totalidad de los errores (severity
`error`) que reporta React Doctor full sobre `development@99e49c5`:

- `debt-9be074c6e888`: `SyncContext.tsx:83-86` muta cuatro refs durante render
  (`no-ref-current-in-render` x4). React puede repetir o descartar trabajo de render, asi que una
  mutacion durante render puede filtrarse desde una UI que nunca commitea y hacer que el estado que
  observa la sincronizacion no corresponda al commit visible.
- `debt-d6e2309f9e15`: tres efectos con cleanup que React Doctor no puede verificar
  (`effect-needs-cleanup` x3 en `AnimatedTopPill.tsx:72`, `useContenidoViewModel.ts:181`,
  `DocEditorScreen.tsx:268`). Una suscripcion o timer no liberado puede fugarse tras un unmount.
- `debt-ff7731773cc5`: cuatro actualizadores de estado impuros (`no-impure-state-updater` x4 en
  `useDocEditorViewModel.ts:146,264,275` y `RetoResolucionScreen.tsx:76`). React puede invocar un
  updater mas de una vez; los efectos laterales dentro de un updater se repiten o observan estado
  externo inconsistente, corrompiendo historial (undo/redo), dirty-state o el temporizador.

Los 11 errores son exactamente estos tres hallazgos; ningun otro error de React Doctor existe. La
definicion de terminado es React Doctor full con 0 errores, sin regresiones.

## What Changes

- **SyncContext**: mover las cuatro escrituras de refs de la fase de render a un unico `useEffect`
  post-commit, preservando el patron latest-value ref y la estabilidad de `syncNow`.
- **Cleanup de efectos**: refactor que preserva el comportamiento hacia una forma de cleanup que la
  regla reconoce, en los tres efectos marcados, con pruebas de montaje/desmontaje.
- **Updaters puros**: sacar `clearInterval` del updater del temporizador del reto (updater puro +
  efecto de parada separado); reemplazar la maquina de historial impura del editor
  (`updateDoc`/`undo`/`redo`) por un `useReducer` con transiciones puras y atomicas.
- **Pruebas**: cobertura de frescura de estado en sync, cleanup en unmount, undo/redo, dirty-state,
  limite de historial e idempotencia del temporizador.

## No Objetivos

- No usar `react-doctor` autofix (un autofix a ciegas rompio 259 tests en un incidente previo).
- No refactorizar mas alla de los artefactos de cada hallazgo: los warnings de React Doctor no
  rastreados como deuda (`rn-prefer-reanimated`, `rn-prefer-expo-image`, `no-giant-component`,
  `prefer-module-scope-pure-function`, `exhaustive-deps`, `no-loading-flag-reset-outside-finally`,
  `no-set-state-after-await-in-effect`, etc.) quedan fuera de alcance.
- No cambiar UI visible, ni el contrato de `src/sync`, ni almacenamiento persistente.
- No resolver los hallazgos de theming/breakpoints (Ola 2) ni el optional-improvement
  `debt-5862d25288fa`.
- No subir Expo SDK. No editar el registro de deuda para forzar reanudacion.
