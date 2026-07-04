## Why

Los controles de cuenta/accesibilidad son transversales: tema, tamano de letra y daltonismo deben propagarse en runtime, no ser switches decorativos. CodeGraph muestra que los contexts existen, pero no hay pruebas focalizadas que den evidencia para el flujo SDD de OpenSpec.

## What Changes

- Agregar una capacidad OpenSpec pequena para preferencias de accesibilidad en configuracion.
- Cubrir con tests los providers de tema, tamano de letra y daltonismo, verificando persistencia y propagacion en runtime.
- Documentar el proceso completo como smoke test del flujo SDD de PlanearIA.
- No hay cambios de API, backend, sincronizacion ni dependencias productivas.

## Capabilities

### New Capabilities

- `settings-accessibility-preferences`: Preferencias locales de cuenta/accesibilidad para tema, tamano de letra y daltonismo.

### Modified Capabilities

- Ninguna.

## Impact

- Codigo afectado: `src/context/ThemeContext.tsx`, `src/context/FontSizeContext.tsx`, `src/context/DaltonismoContext.tsx` mediante tests focalizados.
- Tests nuevos o actualizados bajo `src/__tests__/`.
- Documentacion de validacion SDD bajo `Documentacion/`.
- Sin impacto en `src/sync`, backend, IA gateway, SQLite default, rutas de navegacion o CI/CD.

## No objetivos

- No redisenar la pantalla de configuracion ni crear nuevas opciones visuales.
- No cambiar tokens de color, copy visible, navegacion ni persistencia existente.
- No activar SQLite como almacenamiento default.
- No introducir MCPs adicionales ni automatizaciones de deploy.
