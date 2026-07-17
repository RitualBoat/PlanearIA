# Tasks: auditoria-plan-uxui-pre-ola1

> Protocolo 2.5 de `meta_guia_planes.md`: una tarea a la vez, `[x]` solo con evidencia (comando, archivo o enlace). El apply solo escribe en `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/`, en `openspec/changes/auditoria-plan-uxui-pre-ola1/` y en issues/items NUEVOS de GitHub/Product OS.

## 1. Preparacion y baseline de no-mutacion

- [x] 1.1 Capturar snapshot pre-auditoria de Product OS (issues, estados, milestones, #46/#47) con `gh` y guardarlo en la carpeta de la auditoria como baseline de comparacion. Evidencia: `snapshot-pre-auditoria.md`.
- [x] 1.2 Verificar frescura de GitNexus (`npm run gitnexus:diagnose`); si esta stale, reparar con `npm run gitnexus:repair` y registrar la salida en el log de la auditoria. Evidencia: `log-auditoria.md` (stale -> repair -> reindex PowerShell -> up-to-date en 93c68af; reproduccion del bug #74 desde Git Bash).
- [x] 1.3 Crear el esqueleto de `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/` (reporte-ejecutivo, matriz-cobertura, matriz-hallazgos, mapa-dependencias-roadmap, decisiones-abiertas, investigacion-web) con encabezados y metodologia. Evidencia: `README.md` y `log-auditoria.md` de la carpeta.

## 2. Auditoria del plan por dimensiones

- [x] 2.1 (Evidencia: matriz-cobertura.md filas R0/R1/R2 y olas; H11.) Auditar olas, dependencias entre changes, gates R1/R2 y orden real de ejecucion contra roadmap, plan de readiness, issues cerrados y specs `ux-ihc-chronology`/`openspec-readiness-gates`; volcar filas a la matriz de cobertura.
- [x] 2.2 (Evidencia: log-auditoria.md conteos; H2/H10/H16.) Auditar shell, navegacion, responsive, accesibilidad y estados loading/empty/error/offline: contrastar lo que el plan promete (D7, 1.4, 1.9, R1/R2 tecnicos) con el codigo real via GitNexus (navegacion actual, consumidores de `COLORS`/`responsive.ts`, `FloatingActionIcons`).
- [x] 2.3 (Evidencia: log-auditoria.md; H15.) Auditar limites MVVM, datos offline/sync e IA revisable: verificar con GitNexus que las suposiciones del plan sobre `SyncContext`, `SYNC_ENTITIES`, `aiGateway`/`aiUsageLimiter` y Contexts siguen vigentes; registrar desviaciones.
- [x] 2.4 (Evidencia: matriz-cobertura.md filas #46/#47; H4/H5.) Auditar Figma, prototipo, investigacion IHC y gates manuales #46/#47: estado real de ground truths en `context/`, cronologia IHC, y que exige cada gate sin cerrarlos ni modificarlos.
- [x] 2.5 (Evidencia: log-auditoria.md tests/doctor/CI; H3/H14.) Auditar QA visual, Playwright, golden journeys, tests, CI y evidencia: que exige el plan por change de UI, que existe hoy en el harness (doctor, perfiles de readiness, CI) y que brechas quedan.
- [x] 2.6 (Evidencia: H11/H12; decisiones-abiertas.md.) Auditar la calidad del desglose actual de issues/backlog del plan y las ambiguedades que confundirian a un agente (criterios no observables, dependencias implicitas, nombres inconsistentes); registrar cada ambiguedad como hallazgo.

## 3. Investigacion web con fuentes primarias

- [x] 3.1 (Evidencia: `investigacion-web.md`, 7 fuentes primarias con aplicabilidad + 2 descartadas con motivo.) Investigar practicas actuales verificables aplicables a las decisiones del plan (navegacion adaptativa RN/Expo, theming runtime, accesibilidad movil, pipelines de diseno-a-codigo, research con prototipos) usando fuentes primarias y repositorios relevantes; registrar cada fuente con enlace y aplicabilidad a PlanearIA en `investigacion-web.md`, descartando con motivo las que no apliquen.

## 4. Sintesis: matrices, roadmap y reporte

- [x] 4.1 (Evidencia: matriz-hallazgos.md, 16 hallazgos H1-H16.) Consolidar `matriz-hallazgos.md`: cada hallazgo con evidencia/inferencia, severidad P0-P3, confianza, costo, dependencia, ola recomendada y accion propuesta.
- [x] 4.2 (Evidencia: matriz-cobertura.md, 11 filas sin celdas vacias.) Completar `matriz-cobertura.md` con todas las olas y gates, verificando que no queden celdas vacias ni N/A sin justificar.
- [x] 4.3 (Evidencia: mapa-dependencias-roadmap.md y decisiones-abiertas.md DA1-DA8.) Construir `mapa-dependencias-roadmap.md` (orden recomendado de changes/olas con dependencias) y `decisiones-abiertas.md` (incluyendo OQ-A/OQ-B/OQ-C del design y las que surjan).
- [x] 4.4 (Evidencia: reporte-ejecutivo.md con I1 theming-runtime como primer ejecutable.) Redactar `reporte-ejecutivo.md` con la recomendacion explicita y justificada del primer issue ejecutable de Ola 1 UX/UI.

## 5. Backlog en Product OS

- [x] 5.1 (Evidencia: busquedas gh en log; referencias sin duplicar a #46/#47/#66/#74/#75 en matriz.) Deduplicar hallazgos accionables contra issues existentes (`gh search issues`) y entre si; documentar en la matriz que hallazgo mapea a que issue existente o nuevo.
- [x] 5.2 (Evidencia: #78-#89 creados con plantilla uniforme y metadata completa.) Crear todos los issues P0-P3 con la plantilla uniforme del design (prioridad, severidad, confianza, costo, dependencias, ola, evidencia enlazada, no objetivos, nota de activacion humana) y enlazarlos al plan maestro.
- [x] 5.3 (Evidencia: 12/12 en Product OS status Backlog; 0 asignados; sin ramas.) Agregar cada issue nuevo a PlanearIA Product OS con estado `Backlog` y verificar con `gh` que ninguno quedo iniciado, asignado ni con rama/change asociado.
- [x] 5.4 (Evidencia: snapshot-post-auditoria.md con comparacion; unica mutacion ajena: #74 cerrado por PR #77 concurrente.) Comparar el snapshot post-auditoria contra el baseline de 1.1: issues previos, milestones y #46/#47 sin cambios; adjuntar la comparacion al reporte.

## 6. Validacion, TLDR y cierre proporcional

- [ ] 6.1 Actualizar `TLDR.md` si el alcance, archivos o resultado esperado cambiaron durante el apply.
- [ ] 6.2 Ejecutar validacion del perfil docs: `npm exec --yes=false -- openspec validate --all --strict --no-interactive` y `npm run agent:harness:check`; registrar salidas como evidencia `docs-verification` en `readiness.json`.
- [ ] 6.3 Registrar en `readiness.json` la evidencia final (issue-link, pr-link, docs-verification) y confirmar que `brownfield-baseline.md` sigue reflejando la superficie tocada.
- [ ] 6.4 Ejecutar revision adversarial independiente (`/adversarial-review`) sobre reporte, matrices e issues creados; resolver o registrar hallazgos y anotar la referencia en `readiness.json`.
- [ ] 6.5 Ejecutar `npm run openspec:ready:archive -- --change auditoria-plan-uxui-pre-ola1 --run-local` hasta PASS (o EXCEPTION valida) antes de archivar.
