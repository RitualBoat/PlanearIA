# TLDR: product-os-epic-uxui

## Proposal: que decision ejecuta y por que

El issue #89 dejaba abierta la decision DA1: como agrupar en GitHub el trabajo del plan UX/UI. El 2026-07-17 el responsable decidio, mediante entrevista registrada en el issue, la opcion (a): crear un epic del plan y un milestone por ola. Este change ejecuta esa decision y la convierte en convencion escrita, para que la vista Roadmap funcione y las siguientes olas se agrupen igual sin volver a discutirlo.

## Design: como se ejecuta sin romper nada

Todo se hace con mutaciones reversibles en GitHub: se captura el estado antes y despues de cada paso, se omite lo que ya este conforme y se detiene si algo cambio por fuera. El epic usa sub-issues nativos (asi el Roadmap agrupa por padre), los milestones nuevos usan la nomenclatura `UX/UI Ola N - nombre` con los nombres literales del plan, y el milestone existente `Ciclo 3 - UX/Navegacion Global` no se renombra: queda para el trabajo transversal.

## Spec: comportamiento esperado al terminar

Existira el epic `[Plan Maestro] UX/UI y Navegacion Global` con #78-#89 como sub-issues. `UX/UI Ola 0 - Fundaciones` quedara cerrado con los tres issues terminados de Ola 0; `UX/UI Ola 1 - Shell y componentes` quedara abierto con los cuatro de Ola 1; `Ciclo 3` agrupara los cinco transversales. La guia de Product OS explicara como repetir esto al activar cada ola futura, y la fila DA1 de la auditoria quedara marcada como resuelta.

## Tasks: plan de trabajo practico

Cuatro grupos: (1) snapshot previo del estado de GitHub y freno si algo difiere; (2) mutaciones en orden: crear epic, crear y cerrar `UX/UI Ola 0`, crear `UX/UI Ola 1`, asignar `Ciclo 3` a los transversales, enlazar sub-issues; (3) documentar la convencion en la guia y anotar la resolucion de DA1 en la auditoria; (4) snapshot posterior, evidencia, validaciones docs (openspec estricto + paridad de harness) y refresco de este TLDR si algo cambia.

## Resumen integral del change

Este change cierra la decision DA1 del plan UX/UI: crea el epic del plan y los milestones `UX/UI Ola 0 - Fundaciones` (historico, cerrado) y `UX/UI Ola 1 - Shell y componentes` (activo), agrupa los transversales bajo el `Ciclo 3` existente sin renombrarlo, enlaza los issues #78-#89 como sub-issues del epic y deja la convencion escrita en la guia de Product OS para las olas futuras. No toca codigo, ni otros planes, ni milestones ajenos; todo es reversible y con evidencia. Al archivar, #89 se cierra con el comentario de decision.
