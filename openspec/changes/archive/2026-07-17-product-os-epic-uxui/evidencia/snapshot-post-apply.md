# Snapshot post-apply (2026-07-17)

Estado resultante tras ejecutar la matriz de mutaciones. Comparar con `snapshot-pre-apply.md`.

## Epic creado

- [#101](https://github.com/RitualBoat/PlanearIA/issues/101) `[Plan Maestro] UX/UI y Navegacion Global` (labels `epic`, `ux-ui`, `plan-maestro`), agregado al Project `PlanearIA Product OS`.
- Sub-issues (12, via GraphQL `addSubIssue`): #78, #79, #80 (CLOSED), #81, #82, #83, #84, #85, #86, #87, #88, #89 (OPEN). `subIssues.totalCount = 12`.

## Milestones (antes -> despues)

| # | Titulo | Antes | Despues |
| --- | --- | --- | --- |
| 4 | Ciclo 3 - UX/Navegacion Global | open, 0/0 | open, 5 abiertos (#85-#89), nombre intacto |
| 10 | UX/UI Ola 0 - Fundaciones | no existia | closed, 3 cerrados (#78-#80) |
| 11 | UX/UI Ola 1 - Shell y componentes | no existia | open, 4 abiertos (#81-#84) |

## Issues (milestone antes -> despues)

| # | Estado | Milestone antes | Milestone despues |
| --- | --- | --- | --- |
| 78-80 | CLOSED | none | UX/UI Ola 0 - Fundaciones |
| 81-84 | OPEN | none | UX/UI Ola 1 - Shell y componentes |
| 85-89 | OPEN | none | Ciclo 3 - UX/Navegacion Global |

## Idempotencia verificada

- Reasignar #81 al milestone `UX/UI Ola 1 - Shell y componentes` (ya conforme): sin cambio de estado, no genera mutacion efectiva.
- Re-enlazar #89 como sub-issue de #101 (ya conforme): la API responde `VALIDATION: Failed to add sub-issue #89 to parent #101. Issue may not contain duplicate sub-issues`, es decir, la mutacion se rechaza sin duplicar (guarda idempotente nativa).

## Sin efectos colaterales (verificado)

- Milestones ajenos intactos: `Ciclo 4 - Auth y Seguridad` (#7, open, 4 cerrados), `Readiness Gate M` (#8, open, 2 abiertos / 3 cerrados).
- Issues ajenos intactos: #35 (OPEN, sin milestone), #42 (OPEN, sin milestone, epic de readiness), #46 y #47 (OPEN, `Readiness Gate M`, no movidos), #66 (sin cambios por este change).
- No se renombro, borro ni fusiono ningun milestone o issue.

## Pendiente al final del flujo

- #89 se cierra con comentario de decision durante `opsx:finish` (tras merge del PR).
- La fila `pr-link` de `readiness.json` se completa con el PR real de `opsx:finish`.
