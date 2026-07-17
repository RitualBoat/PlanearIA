# Proposal: auditoria-plan-uxui-pre-ola1

Issue: [#76](https://github.com/RitualBoat/PlanearIA/issues/76) — [UX/UI][Spike] Auditar y preparar Plan Maestro antes de Ola 1.
Plan maestro afectado (solo lectura): `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.

## Why

El gate operativo R1 esta cerrado y el Plan Maestro UX/UI esta activo con su backlog de changes en Olas 0-4+, pero ningun change de producto ha iniciado. Antes de comprometer shell, navegacion, prototipo o pantallas falta una revision independiente y basada en evidencia que conecte el plan con el codigo real, los gates R2/#46/#47, la investigacion IHC, el harness SDD y practicas actuales verificables. Sin esa auditoria, las ambiguedades del plan se pagan durante la implementacion, cuando corregir cuesta mas.

## What Changes

- Se audita el Plan Maestro UX/UI completo: olas y dependencias, R1/R2 y orden real de ejecucion; shell, navegacion, responsive, accesibilidad y estados loading/empty/error/offline; MVVM, datos offline/sync, IA revisable y limites arquitectonicos; Figma, prototipo, IHC y gates manuales #46/#47; QA visual, Playwright, golden journeys, tests, CI y evidencia; calidad del desglose de issues y ambiguedades para agentes.
- Se versiona el reporte de auditoria fuera del plan maestro en `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/`: reporte ejecutivo, matriz de cobertura por ola/gate, matriz de hallazgos (evidencia vs inferencia, P0-P3, confianza, costo, dependencia, ola, accion), mapa de dependencias y roadmap, decisiones abiertas y log de investigacion web con fuentes primarias citadas y su aplicabilidad a PlanearIA.
- Se crean todos los issues sugeridos P0-P3, deduplicados, enlazados al plan, con metadata completa, agregados a PlanearIA Product OS como `Backlog`; ninguno se inicia dentro de este change.
- Se entrega una recomendacion explicita del primer issue ejecutable de Ola 1 UX/UI.
- El estado actual del codigo se verifica con GitNexus como fuente estructural primaria; CodeGraph solo como fallback justificado.

## Capabilities

### New Capabilities

- `uxui-plan-audit`: contrato del artefacto de auditoria pre-Ola 1 del Plan Maestro UX/UI — cobertura minima, trazabilidad evidencia/inferencia, priorizacion P0-P3, creacion de backlog en Product OS sin ejecutarlo, registro de decisiones abiertas y recomendacion de secuencia.

### Modified Capabilities

Ninguna. La auditoria lee `ux-ihc-chronology`, `product-os-readiness-governance`, `openspec-readiness-gates`, `strategic-domain-map` y `brownfield-surface-baseline` sin cambiar sus requirements.

## Impact

- **Documentacion:** carpeta nueva `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/`. El Plan Maestro UX/UI, los planes maestros y los documentos de fundamentos NO se modifican.
- **GitHub / Product OS:** issues nuevos P0-P3 en `Backlog`; el issue #76 avanza de estado. Ningun issue existente, milestone, ni los gates #46/#47 se modifican o cierran.
- **OpenSpec:** change `auditoria-plan-uxui-pre-ola1` con spec delta `uxui-plan-audit`; `readiness.json`, `brownfield-baseline.md` y `TLDR.md` en la raiz del change.
- **Codigo de producto:** cero. No se toca UI, navegacion, backend, sync, IA, datos ni configuracion de app.

## No objetivos

- No implementar UI ni modificar pantallas, navegacion, backend, sync o IA.
- No editar el Plan Maestro UX/UI ni ningun otro plan maestro o documento de fundamentos.
- No modificar ni cerrar issues existentes, milestones, #46 o #47.
- No crear, modificar o aprobar frames Figma; no contactar docentes.
- No iniciar, enriquecer, proponer ni aplicar los issues nuevos creados por la auditoria.
- No copiar codigo de repositorios externos; las referencias son inspiracion citada.
- No resolver por inferencia decisiones que requieren juicio humano (producto, costo, privacidad, Figma, IHC, epic/milestones de olas): se registran como decisiones abiertas.
