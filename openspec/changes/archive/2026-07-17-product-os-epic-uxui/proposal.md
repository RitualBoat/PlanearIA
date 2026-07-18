# Proposal: product-os-epic-uxui

Issue: [#89](https://github.com/RitualBoat/PlanearIA/issues/89). Plan maestro afectado: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (seguimiento en Product OS, no su contenido).

## Why

La decision abierta DA1 (OQ-A) de la auditoria #76 dejo el seguimiento del plan UX/UI sin estructura en Product OS: no existe epic del plan, el milestone `Ciclo 3 - UX/Navegacion Global` esta vacio y los issues de Ola 0/1 (#78-#88) no tienen agrupacion, por lo que la vista Roadmap por epic no funciona para UX/UI. El 2026-07-17 el responsable tomo la decision humana (entrevista estructurada registrada en #89): opcion (a), epic + milestone por ola. Este change la ejecuta y la vuelve convencion reutilizable.

## What Changes

- Se crea el issue epic `[Plan Maestro] UX/UI y Navegacion Global` (labels `epic`, `ux-ui`, `plan-maestro`; Project `PlanearIA Product OS`) y los issues #78-#89 se enlazan como sub-issues.
- Se crean dos milestones con nomenclatura `UX/UI Ola N - <nombre del plan>`: `UX/UI Ola 0 - Fundaciones` (recibe #78-#80 cerrados y se cierra de inmediato) y `UX/UI Ola 1 - Shell y componentes` (activo; recibe #81-#84). Las olas futuras se crean lazy al activarse.
- `Ciclo 3 - UX/Navegacion Global` se conserva sin renombrar como milestone transversal del plan y recibe #85-#89.
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` documenta la convencion reutilizable para las siguientes olas.
- La fila DA1 de `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/decisiones-abiertas.md` recibe una nota minima de resolucion (fecha + issue), sin reescribir la auditoria.
- Al archivar, #89 se cierra con comentario de decision y evidencia.

## Capabilities

### New Capabilities

- `product-os-uxui-tracking`: gobernanza del seguimiento del plan UX/UI en Product OS: epic del plan con sub-issues, milestones por ola con nomenclatura y creacion lazy, milestone transversal sin renombrar, enlazado retroactivo de Ola 0 y convencion reutilizable para olas futuras.

### Modified Capabilities

Ninguna. `product-os-readiness-governance` (plan de readiness #42) no cambia sus requisitos; este change los respeta como restricciones: mutaciones idempotentes con snapshot previo/posterior, sin renombrar milestones y sin tocar #35, #42, #46, #47 ni `Readiness Gate M`.

## Impact

- GitHub (mutaciones de gobernanza reversibles via gh CLI): 1 issue epic nuevo, 2 milestones nuevos, asignacion de milestone a #78-#89, parentesco de sub-issues, cierre de #89 al final.
- Docs: `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` (convencion) y `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/decisiones-abiertas.md` (nota de resolucion DA1).
- Sin codigo de la app, sin datos, sin dependencias, sin CI.

## No objetivos

- No renombrar ni borrar milestones o issues existentes; no fusionar items.
- No crear todavia milestones de Olas 2, 3 o 4+ (la convencion documenta como crearlos al activarse).
- No mover #46/#47 fuera de `Readiness Gate M`; no tocar la epic #42, #35 ni issues de otros planes.
- No editar `PLAN_UXUI_NAVEGACION_GLOBAL.md` ni sus conteos (DA2 sigue abierta).
- No resolver DA2, DA3 ni otras decisiones abiertas de la auditoria.
- No cambiar labels existentes de los issues enlazados (solo se agrega milestone y parentesco).
