# Matriz de cobertura por ola y gate

> Una fila por ola UX/UI y por gate. "Evidencia" remite a `log-auditoria.md` (comandos) y documentos citados. "Issues" usa los IDs #78-#89 de `matriz-hallazgos.md` (numeros GitHub al crearse) y numeros existentes.

| Ola / Gate | Objetivo | Depende de | Evidencia consultada | Riesgo principal | Issues relacionados |
| --- | --- | --- | --- | --- | --- |
| Gate R0 (operativo, cerrado) | Baseline verde: historial, 93 suites/608 tests, Git/Projects/OpenSpec/code-intel/CI | — | #48-#52 CLOSED (snapshot); roadmap; plan readiness 1.10 | Regresion del baseline (mitigada: suite verde re-verificada hoy) | #48-#52 (cerrados) |
| Gate R1 (operativo, cerrado) | Doctor determinista, DoR/DoD ejecutable, cronologia IHC, mapa DDD ligero | R0 | #62-#65 CLOSED; specs `openspec-readiness-gates`, `ux-ihc-chronology`, `strategic-domain-map`; gate propose PASS en vivo con #76 | Confiar en R1 sin re-verificar doctor (verificado: FAIL solo expo, #75) | #62-#65 (cerrados), #74/#75/#66 (deuda doctor abierta) |
| Ola 0 UX/UI: fundaciones | Theming runtime, breakpoints reactivos, tokens completos (sin UI visible) | R0/R1 cerrados (satisfecho) | rg: 65 COLORS/18 reactivos/10 responsive; src/themes solo colors+types; piloto CuentaScreen archivado (`settings-accessibility-preferences`) | Arrancar Ola 1 sin fundaciones -> pantallas nuevas con deuda a11y/responsive (H11) | #78, #79, #80 |
| Ola 1 UX/UI: shell y componentes | AppShell adaptativo, biblioteca base, sync UI, AssignSheet | Ola 0 | rg: 60 rutas hermanas, FeedTab inicial, FloatingActionIcons vivo, returnToClassroom en 6 archivos; SyncContext 5 estados; M3/WCAG (F2/F3) | El change mas delicado (`app-shell-navegacion`); QA visual aun sin harness (H3) | #81, #82, #83, #84, #85 |
| Hitos pre-Ola 2 (manuales) | Prototipo Figma navegable + concept boards; preparacion entrevistas | Decisiones de shell (#81) | Plan seccion "Hitos pre-Ola 2"; doctor WARN figma OAuth; context/ sin indices office/asistente | Tratar los hitos como changes de codigo o darlos por hechos documentandolos | #86, #87, ref #46/#47 |
| Gate #46 (manual, Parked) | Frames Figma aprobados y accesibles via MCP autenticado | Decisiones de shell | Issue #46 (Parked, snapshot); doctor WARN OAuth; plan D11/1.5 | Implementar Ola 2 sin ground truth aprobado (anti-patron del plan) | #46 (no se toca), #86 |
| Gate #47 (manual, Parked) | 3-5 docentes reclutados, consentimiento, agenda, guion IHC | Prototipo navegable (#86) | Issue #47 (Parked); IHC seccion 5; NN/g F5 (5 usuarios ~85% hallazgos; cubrir 3 perfiles) | Reclutar tarde y cerrar Ola 2 sin entrevistas (viola cronologia canonica) | #47 (no se toca), #86 |
| Gate R2 (operativo, pendiente) | Figma aprobado + golden journeys + senal de tests + reclutamiento listo, antes de UI visible de Ola 2 | #46, #47, #85 | Roadmap; spec `ux-ihc-chronology`; H3 (sin golden journeys); H14 (tests verdes hoy) | R2 no tiene hoy definicion ejecutable de "golden journeys" (H3) | #85, ref #46/#47 |
| Ola 2 UX/UI: nucleo visible | Escritorio, Office home + Crear, onboarding; entrevistas antes de cerrar | Ola 1 + R2 | Plan backlog Ola 2; cronologia canonica | UI de alto costo sin validacion docente si #47 se atrasa | (issues se crean al activarse la ola; regla Product OS) |
| Ola 3 UX/UI: experiencias nucleo | NotasPLAN, CalcuPLAN, Clases, AsistePLAN base | Ola 2 + sintesis entrevistas | Plan backlog Ola 3; H5 (office-ground-truth inexistente); H6 (xlsx vulnerable afecta `calcuplan-hoja`); R6/R7 del plan | Backend nuevo del Asistente (R6) y spike tentap (R7) sin dimensionar todavia | #87, #88 (preparacion); resto al activarse |
| Ola 4+ UX/UI: resto de la suite | Cuenta, ConectaPLAN, AgendaPLAN, Presenta/DisenaPLAN, Reporta, landing | Ola 3 | Plan backlog Ola 4+ | Crear issues prematuros violaria la regla de tablero (solo ola activa + siguiente) | Ninguno a proposito (regla Product OS) |

## Notas de cobertura

- Las dimensiones transversales del issue #76 (accesibilidad, estados loading/empty/error/offline, MVVM, offline/sync, IA revisable, QA) se auditaron dentro de cada fila y en H9/H10/H14/H15/H16; no requieren filas propias.
- Ninguna celda queda vacia; los "N/A" no existen: las olas futuras declaran explicitamente por que no reciben issues ahora.
