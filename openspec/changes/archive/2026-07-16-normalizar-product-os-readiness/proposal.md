## Why

El plan de Preparacion Operativa SDD ya tiene una epic, gates, olas y un Project accesible, pero su gobernanza no refleja completamente el estado real: permanecen milestones historicos abiertos y la Ola 1 no esta trazada de forma uniforme en la epic. Ademas, el doctor produjo #66 con dos deudas independientes que no deben convertirse en un mega-change ni desaparecer al cerrar la Ola 0.

## What Changes

- Documentar una fotografia reproducible de la epic #42, sus issues de readiness, estados del Project y milestones abiertos; distinguir trabajo terminado, diferido, activo y fuera del plan.
- Establecer una matriz de decisiones externas idempotente para conservar, cerrar o aparcar milestones y items, sin borrar ni renombrar por estetica.
- Actualizar durante apply la trazabilidad documental y de GitHub de la Ola 1, preservando #42 abierta y #46/#47 aparcados hasta sus gates de R2.
- Clasificar #66 como deuda operacional post-Ola 0: permanece abierta en Backlog, sin milestone de Ola 0, y sus dos remediaciones se preparan como changes OpenSpec futuros e independientes.
- Registrar evidencia antes y despues de cada mutacion externa, junto con una estrategia de rollback que no elimine historial.

## Capabilities

### New Capabilities

- `product-os-readiness-governance`: Define el comportamiento observable para mantener el Project, epic, milestones y deuda posterior de readiness alineados con el plan activo sin abrir frentes paralelos.

### Modified Capabilities

- Ninguna. Este change no altera requisitos de producto, harness ni gates OpenSpec existentes.

## Impact

- Documentacion: `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` y `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` durante apply.
- GitHub externo: epic #42, issue #65, su item de `PlanearIA Product OS` y los milestones existentes; #66 solo se conserva y clasifica, no se implementa ni se cierra.
- OpenSpec: capability nueva, design, tareas, baseline brownfield, TLDR y `readiness.json` de este change.
- Validacion: OpenSpec estricto, consultas reproducibles de GitHub CLI, revision documental y revision adversarial; no se requieren cambios de UI, backend, sync, IA o datos.

## No objetivos

- No reparar el falso verde de GitNexus ni actualizar `expo-localization`; esas dos remediaciones siguen registradas en #66 y requeriran changes propios.
- No cerrar la epic #42, #65, #66, #46 ni #47; tampoco crear todos los issues de olas futuras.
- No borrar, fusionar ni renombrar issues, milestones o items sin una decision posterior explicitamente aprobada.
- No modificar codigo de aplicacion, CI, arquitectura MVVM, `src/sync`, almacenamiento, backend, autenticacion o IA.

## Referencias

- Issue: #65 — Normalizar epic, milestones y estados del plan en Product OS.
- Epic: #42 — Preparacion Operativa SDD y Harness Solo-Dev.
- Deuda relacionada pero fuera de alcance: #66 — Tracking de GitNexus y Expo.
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`, Ola 1.
