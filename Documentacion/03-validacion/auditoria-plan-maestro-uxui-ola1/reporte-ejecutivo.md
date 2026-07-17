# Reporte ejecutivo — Auditoria del Plan Maestro UX/UI antes de Ola 1

> Issue [#76](https://github.com/RitualBoat/PlanearIA/issues/76) | Change `auditoria-plan-uxui-pre-ola1` | 2026-07-16

## Veredicto

**El Plan Maestro UX/UI es ejecutable y sus suposiciones tecnicas siguen vigentes.** La auditoria contrasto el plan contra el codigo real, el harness, Product OS y fuentes primarias: los cimientos que el plan "rescata" existen y funcionan (sync, gateway IA, WebScrollView, tentap; H15), la suite esta verde (93/608; H14) y las decisiones D7/1.9 estan alineadas con Material 3 y WCAG 2.2 (H16). No se encontro ningun hallazgo que invalide el blueprint.

**El bloqueo real no es tecnico sino operativo (H1, P0):** ninguna unidad del backlog del plan existe como issue en GitHub/Product OS, y la Definition of Ready exige issue + item de Project antes de cualquier enrich/propose. Esta auditoria lo resuelve creando el backlog completo.

## Lo que hay que saber (5 puntos)

1. **Nada del plan podia arrancar** por falta de issues (H1). Se crean #78-#84 (changes de Ola 0/1), #85-#87 (preparacion QA/Figma/ground truth), #88 (seguridad xlsx) e #89 (decision epic/milestones), todos en `Backlog`.
2. **El plan quedo como snapshot 2026-07:** los conteos derivaron (65 vs 60 archivos con `COLORS`, 60 vs ~50 rutas; H2). Los issues creados llevan los numeros vigentes; corregir el plan es decision abierta DA2.
3. **R2 tiene un hueco ejecutable:** exige "golden journeys" y QA visual, pero no existe pipeline reproducible ni definicion de esos journeys (H3 -> #85). #46/#47 siguen siendo gates manuales con su propia evidencia; el doctor confirma que Figma MCP ni siquiera esta autenticado aun.
4. **Deuda de seguridad que el plan amplificara:** `xlsx@0.18.5` tiene CVE de prototype pollution al leer archivos (el flujo de import docente lo ejercita hoy) y el fix vive fuera de npm (H6 -> #88, decision DA6). No bloquea Ola 0/1; debe resolverse antes de `calcuplan-hoja`.
5. **Terminologia de olas confunde a agentes** (readiness Ola 0/1 vs UX/UI Ola 0/1; H11): cada issue creado declara su ola UX/UI explicita y el orden vive en `mapa-dependencias-roadmap.md`.

## Primer issue ejecutable recomendado

**#78 — `theming-runtime` (Ola 0 UX/UI).** Justificacion: es la raiz del grafo de dependencias (#79-#82 y toda pantalla nueva dependen de el); su patron ya esta pilotado y archivado (`settings-accessibility-preferences` en CuentaScreen), o sea es despliegue de algo probado, no invencion; resuelve el bloqueo R1 tecnico del plan (tema/fuente/daltonismo no se propagan) que de otro modo contamina cada pantalla de Ola 1+; y no depende de gates manuales. Nota H11: aunque #76 dice "antes de Ola 1", la primera unidad ejecutable real es de Ola 0 (fundaciones); `app-shell-navegacion` (#81) seria el primer issue estrictamente "de Ola 1" y requiere #78+#79 archivados.

## Cifras de la auditoria

- 16 hallazgos (1 P0, 5 P1, 4 P2, 4 P3, 2 confirmaciones positivas); 12 issues nuevos; 5 referencias a issues existentes sin duplicar (#46, #47, #66, #74, #75); 8 decisiones abiertas registradas; 7 fuentes primarias citadas con aplicabilidad.
- Verificacion de no-mutacion: `snapshot-post-auditoria.md` compara el tablero antes/despues; el diff del PR solo contiene esta carpeta y el change OpenSpec.

## Indice de artefactos

`matriz-cobertura.md` (olas/gates) · `matriz-hallazgos.md` (H1-H16) · `mapa-dependencias-roadmap.md` (grafo y camino critico) · `decisiones-abiertas.md` (DA1-DA8) · `investigacion-web.md` (F1-F7) · `log-auditoria.md` (comandos y consultas) · `snapshot-pre/post-auditoria.md` (no-mutacion).
