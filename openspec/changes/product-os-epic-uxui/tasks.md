# Tasks: product-os-epic-uxui

## 1. Preparacion y snapshot

- [ ] 1.1 Capturar snapshot pre-apply con gh CLI (milestones 4/7/8, issues #78-#89 con estado/milestone/labels, epic #42) y guardarlo en `evidencia/snapshot-pre-apply.md`; si difiere del estado registrado en propose (2026-07-17), detener apply y reportar antes de mutar.

## 2. Mutaciones de gobernanza en GitHub

- [ ] 2.1 Crear el issue epic `[Plan Maestro] UX/UI y Navegacion Global` con labels `epic`, `ux-ui`, `plan-maestro`, cuerpo que referencia el plan maestro y la convencion, y agregarlo al Project `PlanearIA Product OS`.
- [ ] 2.2 Crear el milestone `UX/UI Ola 0 - Fundaciones`, asignarlo a #78, #79 y #80, y cerrarlo de inmediato como registro historico.
- [ ] 2.3 Crear el milestone `UX/UI Ola 1 - Shell y componentes` y asignarlo a #81, #82, #83 y #84.
- [ ] 2.4 Asignar el milestone `Ciclo 3 - UX/Navegacion Global` a #85, #86, #87, #88 y #89 sin renombrarlo ni tocar Ciclo 4 / Readiness Gate M.
- [ ] 2.5 Enlazar #78-#89 como sub-issues del epic via GraphQL (`addSubIssue`); si la API no esta disponible, aplicar el fallback documentado (task-list en el epic + nota para reintentar) y registrarlo.

## 3. Documentacion de la convencion

- [ ] 3.1 Documentar en `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` la convencion reutilizable (epic con sub-issues, nomenclatura `UX/UI Ola N - <nombre>`, creacion lazy al activar cada ola, transversales en `Ciclo 3 - UX/Navegacion Global`, prohibicion de renombrar) y el estado resultante de este change.
- [ ] 3.2 Agregar la nota minima de resolucion (fecha 2026-07-17 + referencia #89) a la fila DA1 de `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/decisiones-abiertas.md`, sin reescribir la auditoria.

## 4. Evidencia y validacion

- [ ] 4.1 Capturar snapshot post-apply con gh CLI y registrar en `evidencia/` el antes/despues por mutacion, incluida la comprobacion de idempotencia (mutaciones ya conformes se omiten y se registran).
- [ ] 4.2 Completar `readiness.json` (evidencia `docs-verification` y refs definitivas) y ejecutar las validaciones del perfil docs: `openspec validate --all --strict` y `npm run agent:harness:check`, ambas en verde.
- [ ] 4.3 Revisar y actualizar `TLDR.md` si el alcance, los archivos o el resultado esperado cambiaron durante apply.
