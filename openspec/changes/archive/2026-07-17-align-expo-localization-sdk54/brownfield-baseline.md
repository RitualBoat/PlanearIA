## Superficies tocadas

`package.json`, `package-lock.json` y la comprobación Expo del harness.

## Fuentes de verdad actuales

El manifiesto y lockfile fijan `expo-localization` en `~17.0.8`/`17.0.8`; el doctor usa `npx expo install --check` sin mutar dependencias.

## Comportamiento vigente

Expo informa localization frente a `~17.0.9` y también informa una discrepancia independiente de `expo`.

## Comportamiento objetivo

Localization deja de ser informada como incompatible y el aviso de Expo permanece visible si persiste.

## Compatibilidad legacy

No hay migración ni cambio nativo; revert y `npm ci` restauran el árbol previo.

## Owner de spec y contexto

El owner es `harness-readiness-doctor`; no hay bounded context de dominio ni contrato cruzado.

## Evidencia actual

#75 contiene la línea base y pertenece al Backlog de PlanearIA Product OS; #66 es el tracking de origen.

## Fuera de alcance

Actualizar Expo SDK, Expo, React Native u otras dependencias; tocar UI, código, backend, sync, datos o archivos nativos.
