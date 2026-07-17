## Why

El CLI de Expo SDK 54 informa que `expo-localization@17.0.8` no coincide con el rango recomendado `~17.0.9`. #75 corrige solo esa discrepancia y mantiene independiente el aviso de `expo@54.0.35` frente a `~54.0.36`.

## What Changes

- Actualizar exclusivamente `expo-localization` mediante el flujo compatible de Expo y conservar manifiesto y lockfile coherentes.
- Verificar que el chequeo deja de listar localization como incompatible.
- Mantener visible el aviso independiente de `expo`, sin actualizar SDK ni otras dependencias.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `harness-readiness-doctor`: la compatibilidad de localization se mantiene separada de las discrepancias independientes de Expo.

## Impact

Durante apply solo se esperan cambios en `package.json` y `package-lock.json`. No hay cambios de UI, internacionalización, API, backend, sync, datos ni archivos nativos.
