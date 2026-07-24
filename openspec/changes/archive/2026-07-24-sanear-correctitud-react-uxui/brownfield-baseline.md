# Brownfield baseline: sanear-correctitud-react-uxui

## Superficies tocadas

- `src/context/SyncContext.tsx` (refs latest-value de render a efecto post-commit).
- `src/components/AnimatedTopPill.tsx` (unificar cleanup del listener de focus y la animacion).
- `src/hooks/useContenidoViewModel.ts` (cleanup reconocible del listener NetInfo).
- `src/screens/planeaciones/DocEditorScreen.tsx` (cleanup reconocible del listener `beforeRemove`).
- `src/hooks/useDocEditorViewModel.ts` (maquina de historial a `useReducer` puro).
- `src/screens/feed/RetoResolucionScreen.tsx` (updater del temporizador puro + efecto de parada).
- Tests nuevos/actualizados en `src/__tests__/` para las seis superficies.

## Fuentes de verdad actuales

- Codigo real en `development@99e49c5` (GitNexus reindexado y verificado fresco).
- `npx react-doctor@latest --scope full --json --no-score --no-dead-code --no-supply-chain`
  (2026-07-24): 11 errores / 199 warnings; los 11 errores son 4 `no-ref-current-in-render`
  (SyncContext.tsx:83-86), 3 `effect-needs-cleanup` (AnimatedTopPill:72, useContenidoViewModel:181,
  DocEditorScreen:268) y 4 `no-impure-state-updater` (useDocEditorViewModel:146,264,275;
  RetoResolucionScreen:76).
- Registro de deuda `.project-os/debt/registry.json`: `debt-9be074c6e888`, `debt-d6e2309f9e15`,
  `debt-ff7731773cc5` (todos `open`, plan `uxui-navegacion-global`).

## Comportamiento vigente

- SyncContext escribe cuatro refs durante render para que `syncNow` (callback estable) lea el ultimo
  estado sin recrearse; funciona en la practica pero es inseguro bajo render concurrente/replay.
- Los tres efectos marcados YA retornan cleanup, pero con rutas condicionales/multiples o un patron
  unsubscribe-arrow que la regla no verifica estaticamente.
- El editor mantiene undo/redo/dirty con setState anidado dentro de updaters de otro setState; el
  temporizador del reto llama `clearInterval` dentro del updater de `setTimeLeft`.

## Comportamiento objetivo

- SyncContext sincroniza los refs en un efecto post-commit; `syncNow` sigue estable y observa solo
  estado committeado; interval/foreground/connectivity no se re-suscriben.
- Los tres efectos liberan su suscripcion/animacion al desmontar con una ruta de cleanup reconocible;
  React Doctor deja de marcarlos.
- Los updaters del editor y del temporizador son puros e idempotentes; historial (limite 30),
  dirty-state y cuenta regresiva permanecen correctos bajo doble invocacion. React Doctor full 0
  errores.

## Compatibilidad legacy

- No cambia la API publica de `SyncContext` (`useSyncStatus`), el contrato de `syncNow`, el modelo
  `PlaneacionDocumento`, el contrato de `useDocEditorViewModel` ni el flujo de guardado/autoguardado.
- No toca `src/sync` (motor, colas, storage), ni claves `@planearia:*`, ni contratos por `userId`.
- No cambia UI visible: mismos textos, iconos, tono, estados loading/empty/error/offline y
  accesibilidad. La capa `sync-status-presentation` queda intacta.

## Owner de spec y contexto

- Spec nueva: `react-render-safety-remediation` (este change).
- Contexto DDD: infraestructura de sincronizacion (SyncContext), Office Docente/Planeaciones (editor)
  y Feed/Contenido (pill, contenido, reto); sin contratos nuevos entre bounded contexts (`design.md`).
- Plan owner: `uxui-navegacion-global`. Issue: #143. Epic: #141.

## Evidencia actual

- React Doctor full 2026-07-24: 11 errores enumerados arriba (baseline guardado como evidencia antes).
- Lectura de codigo de los seis archivos confirmando la naturaleza de cada hallazgo y que los tres
  cleanups ya existen (por eso el enfoque es refactor reconocible, no anadir cleanup ausente).
- Suite verde en `development@99e49c5` (CI: CI, CD Builds, React Doctor, Agent Harness Parity =
  success; typecheck exit 0).

## Fuera de alcance

- Warnings de React Doctor no rastreados como deuda (`rn-prefer-reanimated`, `rn-prefer-expo-image`,
  `no-giant-component`, `prefer-module-scope-pure-function`, `exhaustive-deps`,
  `no-loading-flag-reset-outside-finally`, `no-set-state-after-await-in-effect`, etc.).
- Theming/breakpoints (Ola 2: `debt-b279f64f815b`, `debt-3d3ea5ba87ac`/#106) y el optional-improvement
  `debt-5862d25288fa`.
- Cambios de UI visible, `src/sync`, SQLite, subir Expo SDK, el saneamiento del harness (cerrado).
