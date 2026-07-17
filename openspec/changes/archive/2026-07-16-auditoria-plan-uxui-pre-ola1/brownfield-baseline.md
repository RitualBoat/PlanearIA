# Brownfield baseline: auditoria-plan-uxui-pre-ola1

Registro de la superficie que este change tocara. No inventaria toda la app ni sustituye la spec.

## Superficies tocadas

- `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/` (carpeta nueva: reporte, matrices, decisiones abiertas, log de investigacion).
- `openspec/changes/auditoria-plan-uxui-pre-ola1/` (artefactos SDD del propio change).
- GitHub / PlanearIA Product OS: issues NUEVOS P0-P3 agregados como `Backlog` y el avance de estado del propio #76. Ningun archivo de codigo, plan maestro, issue existente, milestone o gate manual.

## Fuentes de verdad actuales

- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (plan auditado, solo lectura).
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`, `IHC_DISCOVERY_DOCENTE.md`, `MAPA_DDD_ESTRATEGICO_LIGERO.md`.
- `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (DoR/DoD, gates R0-R2).
- `openspec/specs/` (21 specs vigentes, en particular `ux-ihc-chronology`, `openspec-readiness-gates`, `product-os-readiness-governance`).
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` y el Project `PlanearIA Product OS` (estados, milestones, gates #46/#47).
- Codigo real via GitNexus (CodeGraph como fallback documentado).

## Comportamiento vigente

El plan UX/UI existe como blueprint + backlog sin auditoria independiente: R1 esta cerrado, ningun change de producto de las olas ha iniciado, #46/#47 estan en Parked bloqueando R2, no hay epic UX/UI en Product OS y `Documentacion/03-validacion/` guarda auditorias previas de otros temas. Las ambiguedades del plan (dependencias implicitas, criterios no observables, brechas de evidencia) no estan catalogadas.

## Comportamiento objetivo

Existe una auditoria versionada y trazable del plan completo: matriz de cobertura por ola/gate, matriz de hallazgos con evidencia/inferencia y P0-P3, mapa de dependencias y roadmap, decisiones abiertas registradas, investigacion web citada, backlog completo P0-P3 en Product OS como `Backlog` sin ejecutar, y recomendacion explicita del primer issue ejecutable de Ola 1. El plan maestro y los estados externos existentes permanecen intactos.

## Compatibilidad legacy

No aplica deuda de codigo: el change no toca codigo ni datos. Compatibilidad a conservar: el Plan Maestro UX/UI y sus decisiones D1-D15 siguen siendo la fuente de verdad de producto (la auditoria recomienda, no decide); los issues y milestones existentes conservan numeracion, estado y contenido; las auditorias previas de `03-validacion/` no se renombran ni reorganizan.

## Owner de spec y contexto

- Spec nueva: `uxui-plan-audit` (owner: este change; describe el contrato del artefacto de auditoria, no datos docentes).
- Contexto DDD: ningun bounded context de datos afectado; sin contrato cruzado (ver design.md).
- Gobernanza Product OS: `product-os-readiness-governance` sigue siendo owner de las reglas de estados; este change solo crea items nuevos bajo esas reglas.

## Evidencia actual

- `npm run openspec:ready:propose -- --issue 76` en PASS (2026-07-16) tras el enrich con manifest pre-propose.
- Issue #76 en `In progress` en PlanearIA Product OS (movido 2026-07-16).
- `openspec list` al proponer mostraba este change y `fix-gitnexus-root-doctor` (0/7, issue #74); durante el apply, #74 se resolvio en paralelo (PR #77 mergeado 2026-07-17) y aparecio `align-expo-localization-sdk54` (change de #75 en vuelo). Sin colision de superficie en ningun caso: aquellos tocan `scripts/`/dependencias, este solo documentacion e issues nuevos.
- R1 verificable por issues cerrados #48-#52 y #62-#65.

## Fuera de alcance

Editar el plan maestro o cualquier documento de fundamentos; modificar/cerrar issues existentes, milestones, #46 o #47; implementar UI, navegacion, backend, sync o IA; crear/aprobar Figma o contactar docentes; iniciar los issues nuevos; copiar codigo externo; resolver decisiones humanas por inferencia; tocar `openspec/changes/fix-gitnexus-root-doctor/`.
