# TLDR: auditoria-plan-uxui-pre-ola1

## Proposal — que problema resuelve este change

El Plan Maestro UX/UI esta listo para arrancar su Ola 1, pero nadie lo ha revisado de forma independiente contra el codigo real, los gates pendientes y la investigacion con docentes. Este change es una auditoria (issue #76): no cambia la app, sino que detecta ambiguedades, riesgos y oportunidades antes de gastar esfuerzo implementando. El resultado es un reporte versionado y un backlog completo de issues priorizados P0-P3 en Product OS, mas la recomendacion del primer issue que conviene ejecutar.

## Design — como se hara la auditoria

La auditoria trabaja con reglas claras: cada afirmacion se marca como evidencia (con fuente verificable) o inferencia (con confianza declarada). El codigo se consulta primero con GitNexus; CodeGraph solo si aquel falla, y se anota el motivo. La investigacion web usa fuentes primarias citadas con su aplicabilidad a PlanearIA, sin copiar codigo. Los issues nuevos se deduplican y llevan metadata uniforme. Las decisiones que requieren juicio humano (como crear el epic UX/UI) se registran abiertas, no se resuelven solas.

## Spec — que comportamiento queda garantizado

La spec `uxui-plan-audit` exige: matriz de cobertura sin huecos para cada ola y gate; hallazgos trazables que separan evidencia de inferencia; fuentes web primarias con explicacion de por que aplican; backlog completo P0-P3 en `Backlog` sin que ningun issue se ejecute; estados externos existentes intactos (plan, issues, milestones, #46/#47); decisiones abiertas documentadas sin resolverse; y una recomendacion unica del primer issue ejecutable de Ola 1 con justificacion.

## Tasks — plan de trabajo practico

Seis bloques ejecutados: (1) baseline de no-mutacion y esqueleto del reporte; (2) auditoria por dimensiones con GitNexus y conteos directos (olas/gates, shell y accesibilidad, arquitectura y sync/IA, Figma/IHC, QA/CI, calidad de issues); (3) siete fuentes web primarias con aplicabilidad; (4) matrices, roadmap, ocho decisiones abiertas y reporte ejecutivo; (5) doce issues #78-#89 creados deduplicados en Product OS como Backlog, con verificacion de que nada existente cambio; (6) validacion (openspec estricto, paridad de harness), revision adversarial y gate de archive.

## Resumen integral del change

Este change audito el Plan Maestro UX/UI antes de iniciar sus olas. El veredicto: el plan es ejecutable y sus suposiciones tecnicas siguen vigentes; el bloqueo real era operativo (no existia backlog en el tablero). Produce el reporte versionado en `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/` con 16 hallazgos trazables, crea los issues #78-#89 en Backlog sin ejecutarlos y recomienda #78 (`theming-runtime`) como primer ejecutable. No toco UI, codigo, el plan maestro ni estados externos existentes; todo se revierte con el PR.
