## Why

La pausa legítima y trazada de UX/UI hace fallar el job `Project Constructor Advisory`, aunque ese
workflow se declara advisory y el plan constructor sigue activo. Esto bloquea indebidamente #126.
Este change implementa el issue [#142](https://github.com/RitualBoat/PlanearIA/issues/142).

## What Changes

- Mantener la ejecución visible de `debt:check` en la matriz advisory.
- Convertir solo esa señal dinámica en warning explícito, sin ocultar su recuperación.
- Conservar bloqueantes los contratos de instalación, consumidor y documentación.

## Capabilities

### New Capabilities

- `project-constructor-advisory-ci`: CI advisory distingue una pausa reconocida de un fallo contractual.

### Modified Capabilities

- Ninguna.

## Impact

`.github/workflows/project-constructor.yml`, evidencia CI y documentación de cierre; sin producto ni dependencias.

## No objetivos

No resuelve la deuda UX/UI, no cambia su política ni convierte el check advisory en required.
