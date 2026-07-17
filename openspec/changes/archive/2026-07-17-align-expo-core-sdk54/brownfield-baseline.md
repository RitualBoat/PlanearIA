# Baseline brownfield: align-expo-core-sdk54

## Superficies tocadas

`package.json`, `package-lock.json`, el arbol resuelto `node_modules` (no versionado) y la comprobacion Expo del harness.

## Fuentes de verdad actuales

El manifiesto declara `expo: ~54.0.34`, el lockfile resuelve `54.0.35` y `node_modules/expo` tiene `54.0.35`; el doctor usa `npx expo install --check` sin mutar dependencias. Para `expo-localization` el manifiesto y el lockfile ya fijan `~17.0.9`/`17.0.9` desde #75, pero `node_modules` conserva `17.0.8`.

## Comportamiento vigente

Expo informa `expo@54.0.35` frente a `~54.0.36` y el doctor reporta `FAIL expo-compatibility`. El mismo chequeo informa `expo-localization@17.0.8` por el arbol obsoleto, no por su declaracion.

## Comportamiento objetivo

`expo` deja de ser informado como incompatible, `expo-localization` deja de aparecer al restaurar la coherencia del arbol y `expo-compatibility` deja de ser FAIL.

## Compatibilidad legacy

No hay migracion ni cambio nativo; revert y `npm ci` restauran el arbol previo. La declaracion de `expo-localization` alineada por #75 se conserva intacta.

## Owner de spec y contexto

El owner es `harness-readiness-doctor`; no hay bounded context de dominio ni contrato cruzado.

## Evidencia actual

#92 contiene la linea base y pertenece al Backlog de PlanearIA Product OS; #66 es el tracking de origen y #92 es su sub-issue. #74 y #75 ya estan cerradas.

## Fuera de alcance

Actualizar Expo SDK a 55, React Native u otras dependencias; tocar UI, codigo, backend, sync, datos o archivos nativos; remediar el `FAIL mcp-smoke` que provoca el OAuth interactivo del servidor MCP `expo`.
