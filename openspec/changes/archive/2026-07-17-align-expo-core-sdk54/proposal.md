## Why

El CLI de Expo SDK 54 informa que `expo@54.0.35` no coincide con el rango recomendado `~54.0.36`, y eso mantiene `FAIL expo-compatibility` en `npm run harness:doctor`. Es la ultima discrepancia Expo que #66 conserva tras cerrar #74 y #75. #92 corrige solo esa discrepancia.

## What Changes

- Actualizar exclusivamente `expo` mediante el flujo compatible de Expo y conservar manifiesto, lockfile y arbol resuelto coherentes.
- Verificar que el chequeo deja de listar `expo` como incompatible y que `harness:doctor` deja de reportar `FAIL expo-compatibility`.
- Reinstalar el arbol para que `node_modules` respete el lockfile vigente, sin modificar la declaracion de `expo-localization` ya alineada por #75.
- Mantener visible el `FAIL mcp-smoke` preexistente, sin actualizar SDK ni otras dependencias.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `harness-readiness-doctor`: la compatibilidad del paquete `expo` se alinea con la recomendacion del SDK instalado y se mantiene separada de la deuda MCP ajena.

## Impact

Durante apply solo se esperan cambios en `package.json` y `package-lock.json`, mas la reinstalacion de `node_modules` (no versionado). No hay cambios de UI, internacionalizacion, API, backend, sync, datos ni archivos nativos.
