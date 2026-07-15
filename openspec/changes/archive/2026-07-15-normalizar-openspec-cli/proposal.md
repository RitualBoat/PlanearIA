## Why

El flujo SDD no es reproducible: el proyecto depende de una invocacion global inexistente y `agent:opsx:update` usa el paquete incorrecto `openspec@1.5.0`. Esto puede hacer que distintos agentes generen artefactos o workflows incompatibles y bloquea un arranque confiable de la Ola 0.

## What Changes

- Instalar y fijar la CLI oficial `@fission-ai/openspec` como dependencia de desarrollo del repositorio.
- Exponer comandos npm estables para version, diagnostico, validacion y actualizacion de los workflows opsx.
- Corregir `agent:opsx:update` para usar exclusivamente la CLI local fijada y conservar el parche post-update mientras siga siendo necesario.
- Normalizar los workflows generados para que invoquen `npm exec --yes=false -- openspec` y no presupongan ni descarguen un binario global.
- Agregar un smoke check determinista con errores accionables para detectar una instalacion, version o configuracion invalida.
- Actualizar la documentacion operativa para que agentes e IDEs usen los comandos del repositorio y no dependan de una instalacion global ni de `npx ...@latest`.

## No objetivos

- No cambiar el comportamiento funcional de PlanearIA ni sus pantallas.
- No redisenar el flujo SDD, archivar changes activos ni modificar specs de producto ajenas.
- No actualizar otras dependencias ni corregir GitNexus, CodeGraph o Graphify en este change.
- No eliminar el parche del comando continue zombi sin demostrar primero que la version fijada ya no genera esas referencias.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `agent-harness-parity`: el contrato de generacion y validacion de workflows opsx pasa a exigir la CLI oficial fijada en el repositorio, comandos npm reproducibles y un smoke check accionable.

## Impact

- Issue operativa: GitHub #49.
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (Ola 0; publicado inicialmente en PR #53).
- Archivos previstos: `package.json`, `package-lock.json`, scripts de diagnostico/patch opsx, workflow de paridad, documentacion operativa y delta spec `agent-harness-parity`.
- Dependencia afectada: CLI oficial `@fission-ai/openspec`, fijada a una version exacta compatible con Node 20.
- Riesgo principal: una actualizacion del generador puede producir cambios masivos en archivos por harness; el design definira limites de diff y rollback antes de ejecutar `update --force`.
