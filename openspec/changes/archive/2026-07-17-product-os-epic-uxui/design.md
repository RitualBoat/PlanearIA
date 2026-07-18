# Design: product-os-epic-uxui

## Context

DA1 (OQ-A) quedo registrada en #89 tras la auditoria #76. Estado verificado 2026-07-17: la unica epic es #42 (readiness); `Ciclo 3 - UX/Navegacion Global` esta abierto con 0 issues; #78-#80 (Ola 0) estan cerrados y #81-#88 abiertos, todos sin epic ni milestone. La guia `GITHUB_PRODUCT_OS.md` exige un epic por plan maestro, milestones como release goals (no epicas), prohibe renombrar milestones y solo permite mutaciones reversibles con snapshot previo/posterior (requisitos ya formalizados en la spec `product-os-readiness-governance`). La decision humana del 2026-07-17 (entrevista en #89) fija la opcion (a) con siete precisiones.

## Goals / Non-Goals

**Goals:**

- Ejecutar la opcion (a) exactamente como quedo acordada en #89.
- Dejar una convencion reutilizable y documentada para las olas futuras (2, 3, 4+).
- Que la vista Roadmap por epic agrupe el plan UX/UI sin perder historial.

**Non-Goals:**

- Cambiar los requisitos de `product-os-readiness-governance` o el contenido del plan maestro.
- Crear milestones de olas no activas, renombrar o borrar nada existente, mover issues de otros planes.
- Automatizar la creacion futura de milestones (queda como convencion manual documentada).

## Decisions

1. **Epic como issue con sub-issues nativos.** El epic `[Plan Maestro] UX/UI y Navegacion Global` sigue el patron real de #42 (titulo `[Plan Maestro] ...`, label `epic`). Los issues #78-#89 se enlazan como sub-issues nativos de GitHub (no solo checklist en el cuerpo) porque Projects v2 permite agrupar el Roadmap por "Parent issue", que es lo que la vista "Roadmap por epic" de la guia necesita. Alternativa descartada: solo task-list en el cuerpo del epic (no agrupa el Roadmap y se desincroniza).
2. **Milestones por ola con prefijo `UX/UI Ola N - <nombre>`.** Nombres tomados literalmente de las olas del plan (`Fundaciones`, `Shell y componentes`, ...). El prefijo `UX/UI` deja explicito el plan si otros planes adoptan olas. Alternativas descartadas en entrevista: `Ola N - nombre` (ambiguo entre planes) y continuar la serie `Ciclo N` (mezcla convenciones y choca con el `Ciclo 3` existente).
3. **Creacion lazy.** Solo se crean `UX/UI Ola 0 - Fundaciones` y `UX/UI Ola 1 - Shell y componentes`. Ola 0 recibe #78-#80 y se cierra de inmediato (registro historico consistente con "cerrar solo milestones sin issues abiertos"). Las olas futuras se crean al activarse, segun la regla anti-ruido de la guia. Alternativa descartada: crear todas las olas ya (milestones vacios abiertos durante meses).
4. **`Ciclo 3 - UX/Navegacion Global` como milestone transversal.** No se renombra (regla dura de la guia) y recibe el trabajo del plan que no pertenece a una ola concreta: #85, #86, #87, #88 y #89. Se cerrara cuando el plan cierre. Alternativas descartadas: dejarlo vacio (milestone zombi sin proposito) o cerrarlo (exige excepcion contra la guia mientras el plan siga activo).
5. **Mutaciones idempotentes con snapshot.** Cada tarea de apply captura el estado con gh CLI justo antes de mutar, compara contra la matriz del change, ejecuta solo lo que falte y registra el estado posterior como evidencia. Si el estado externo difiere del snapshot de propose, apply se detiene (requisito de `product-os-readiness-governance`). Sub-issues via `gh api graphql` (mutation `addSubIssue`); si la API no esta disponible, fallback documentado: task-list en el cuerpo del epic y nota en el issue para reintentar.
6. **#89 se cierra al archivar, no antes.** El cierre lleva comentario con la decision, la convencion y los enlaces de evidencia, cumpliendo "cerrar el issue solo si quedo una convencion clara y reutilizable".

## Risks / Trade-offs

- [Edicion concurrente de issues/milestones durante apply] → snapshot previo por tarea; si difiere del estado esperado, detenerse y reportar en vez de sobrescribir.
- [API de sub-issues no disponible en el plan/token actual] → fallback a task-list en el epic + nota para reintentar; el resto del change no se bloquea.
- [Milestone `UX/UI Ola 0` cerrado podria ocultar los issues en vistas por defecto] → aceptado: es registro historico; el Roadmap por epic los sigue mostrando via sub-issues.
- [Asignar milestone a issues cerrados (#78-#80) altera metadatos historicos] → autorizado explicitamente en la entrevista (enlazado retroactivo); no cambia estado ni contenido.
- [Deriva futura de la convencion] → queda escrita en `GITHUB_PRODUCT_OS.md` como parte del flujo de activacion de cada ola.

## Migration Plan

Sin migracion de datos ni codigo. Despliegue = ejecutar la matriz de mutaciones en GitHub + merge del PR docs. Rollback: quitar asignaciones de milestone, quitar parentescos de sub-issue, cerrar milestones nuevos con nota de reversion (no borrarlos), cerrar el epic con comentario de reversion y `git revert` del commit docs. Nada de esto borra issues ni historial.

## Open Questions

Ninguna: las siete decisiones de la entrevista del 2026-07-17 cubren estructura, enlazado, proceso, destino de Ciclo 3, alcance lazy, nomenclatura y titulo del epic.
