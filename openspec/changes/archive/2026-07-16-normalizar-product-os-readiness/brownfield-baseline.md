# Baseline brownfield: normalizar-product-os-readiness

## Superficies tocadas

- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` y `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`.
- Artefactos de este change y metadatos externos de la epic #42, #65, #66, Project 1 y los milestones enumerados en `design.md`.

## Fuentes de verdad actuales

- Epic #42, issues #44, #46 a #52 y #62 a #66, y Project `RitualBoat/1` consultados con GitHub CLI.
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`, el plan de Preparacion Operativa y `meta_guia_planes.md`.
- `openspec/specs/harness-readiness-doctor/spec.md` para el hecho que origina #66, sin cambiar ese contrato.

## Comportamiento vigente

La epic #42 esta abierta/en progreso; #65 y #66 estan en Backlog; #46/#47 estan abiertos y Parked. Ola 0 y parte de Ola 1 estan cerradas, pero existen milestones historicos abiertos sin issues abiertos. #66 registra el falso verde GitNexus y la desalineacion Expo sin milestone ni change de resolucion.

## Comportamiento objetivo

La documentacion y GitHub reflejan una sola iniciativa versionable activa, milestones historicos cerrados solo con evidencia, gates vivos preservados y #66 abierto como tracking post-Ola 0 de dos remediaciones futuras separadas.

## Compatibilidad legacy

Se preservan URLs, numeros, titulos, estados de issues y su historial. El cambio no migra datos ni cambia contratos de la app; los milestones cerrados se pueden reabrir a partir del snapshot si se descubre una referencia vigente.

## Owner de spec y contexto

La capacidad es gobernanza operativa transversal. El owner documental es el plan de Preparacion Operativa y la guia Product OS; no transfiere ownership de entidades de los bounded contexts del mapa DDD ni requiere contrato cruzado.

## Evidencia actual

- `npm run openspec:ready:propose -- --issue 65 --json`: PASS, 9 verificaciones.
- Consultas `gh` del 2026-07-15: Project 1 con 38 items, #42 en progreso, #65/#66 en Backlog y conteos de milestones.
- `npm run gitnexus:diagnose`: salida `Not a git repository` con codigo 0, registrada en #66.

## Fuera de alcance

No se modifica codigo de aplicacion, backend, CI, GitNexus, Expo, UI, datos, sync, IA, autenticacion, SQLite ni las soluciones futuras de #66. No se borran o fusionan issues/items y no se crean todos los issues de olas posteriores.
