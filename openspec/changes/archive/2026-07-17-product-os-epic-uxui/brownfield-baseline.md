# Brownfield baseline: product-os-epic-uxui

## Superficies tocadas

- GitHub (gobernanza Product OS, fuera del arbol del repo): 1 issue epic nuevo, 2 milestones nuevos (`UX/UI Ola 0 - Fundaciones`, `UX/UI Ola 1 - Shell y componentes`), asignacion de milestone a #78-#89, parentesco de sub-issues bajo el epic.
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`: nueva subseccion con la convencion de seguimiento del plan UX/UI.
- `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/decisiones-abiertas.md`: nota minima de resolucion en la fila DA1.
- `openspec/` (artefactos propios del change). Sin codigo de la app, sin CI, sin dependencias.

## Fuentes de verdad actuales

- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`: reglas de epics, milestones, labels y mutaciones reversibles.
- `openspec/specs/product-os-readiness-governance/spec.md`: gobernanza vigente de milestones y mutaciones externas (plan readiness).
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`: nombres y contenido de las olas.
- `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/decisiones-abiertas.md`: registro DA1.
- Estado vivo en GitHub consultable con gh CLI (issues, milestones, Project `PlanearIA Product OS`).

## Comportamiento vigente

Verificado 2026-07-17 con gh CLI: no existe epic del plan UX/UI (solo #42, de readiness); `Ciclo 3 - UX/Navegacion Global` abierto con 0 issues; `Ciclo 4 - Auth y Seguridad` y `Readiness Gate M` abiertos con sus issues; #78-#80 cerrados y #81-#88 abiertos, todos sin epic ni milestone; #89 abierto con la decision DA1 ya tomada y registrada. La vista Roadmap por epic no agrupa el plan UX/UI y la guia no documenta convencion de olas.

## Comportamiento objetivo

Epic `[Plan Maestro] UX/UI y Navegacion Global` en el Project con #78-#89 como sub-issues; `UX/UI Ola 0 - Fundaciones` cerrado con #78-#80; `UX/UI Ola 1 - Shell y componentes` abierto con #81-#84; `Ciclo 3 - UX/Navegacion Global` intacto de nombre y agrupando #85-#89; convencion reutilizable documentada en la guia; fila DA1 con nota de resolucion; #89 cerrado con comentario de decision tras archive.

## Compatibilidad legacy

Los milestones historicos cerrados y los activos `Ciclo 4 - Auth y Seguridad` y `Readiness Gate M` no se tocan; #46/#47 conservan Gate M; la epic #42 y los issues #35/#66 no se modifican. No se renombra ni borra ningun milestone o issue. La asignacion retroactiva de milestone a #78-#80 (cerrados) no cambia su estado ni contenido. Sin claves `@planearia:*`, sin datos de la app.

## Owner de spec y contexto

- Capability nueva: `product-os-uxui-tracking` (este change es su owner y crea `openspec/specs/product-os-uxui-tracking/` al archivar).
- Contexto relacionado: `product-os-readiness-governance` (no se modifica; actua como restriccion), guia `GITHUB_PRODUCT_OS.md` (owner operativo: responsable del repo, decision registrada en #89 el 2026-07-17).

## Evidencia actual

- Issue #89 enriquecido con la decision de la entrevista 2026-07-17 y manifest `openspec-readiness:pre-propose` (gate `openspec:ready:propose` en PASS el 2026-07-17).
- Snapshot pre-propose via gh CLI 2026-07-17: milestones 4 (`Ciclo 3`, 0 issues), 7 (`Ciclo 4`, 4 cerrados), 8 (`Readiness Gate M`, 2 abiertos / 3 cerrados); issues #78-#88 sin milestone ni epic.
- `harness:doctor` PASS 2026-07-17 (WARN conocido OAuth expo/figma).
- Auditoria origen: `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/` via #76.

## Fuera de alcance

- Milestones de Olas 2, 3 y 4+ (se crean lazy al activarse, siguiendo la convencion documentada).
- Renombrar o borrar milestones/issues; mover #46/#47; tocar #35, #42, #66 o issues de otros planes.
- Editar `PLAN_UXUI_NAVEGACION_GLOBAL.md` o sus conteos (DA2), y las decisiones DA2-DA8.
- Codigo de la app, sync, backend, CI y dependencias.
