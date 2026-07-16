# Baseline brownfield: baseline-specs-brownfield-por-contacto

## Superficies tocadas

- Reglas e instrucciones de propose/archivo: `openspec/config.yaml`, `.agents/instructions/core.md`, sus espejos generados y `scripts/patchOpsxWorkflows.mjs`.
- Gate y pruebas: `scripts/checkOpenSpecReadiness.mjs` y `scripts/testOpenSpecReadiness.mjs`.
- Documentación de proceso y owners: `meta_guia_planes.md`, plan UX/UI, `Documentacion/02-operacion/BASELINE_BROWNFIELD_POR_CONTACTO.md` y su índice operativo.
- Artefactos OpenSpec: capability nueva `brownfield-surface-baseline` y delta a `openspec-readiness-gates`.

## Fuentes de verdad actuales

- `openspec/config.yaml` exige DoR, `readiness.json`, TLDR y perfiles de validación, pero no un baseline brownfield.
- `scripts/checkOpenSpecReadiness.mjs` valida issue, tareas, TLDR, superficies, evidencia, rollback y revisión adversarial durante archive.
- `scripts/patchOpsxWorkflows.mjs` mantiene las guías de propose/archive después de un update de OpenSpec, y `syncAgentHarness.mjs` regenera los espejos desde `.agents`.
- `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md` define Experiencia y Preferencias como owner de tema, accesibilidad y navegación; el plan UX/UI enumera sus primeras fundaciones.

## Comportamiento vigente

Un issue enriquecido declara superficies y el gate de archive comprueba metadatos de cierre, pero ninguna regla requiere que el change compare las fuentes actuales, el comportamiento que preserva y el comportamiento objetivo. Las primeras fundaciones UX tienen criterios y riesgos en el plan, sin una tabla brownfield de owner de spec y compatibilidad por superficie.

## Comportamiento objetivo

Todo change nuevo dispondrá de un baseline raíz breve creado durante propose. El gate de archive comprobará su presencia y las ocho secciones mínimas sin interpretar su contenido como instrucciones ejecutables. Las fundaciones UX iniciales tendrán owners de spec, fuentes y compatibilidades explícitas antes de aplicar código.

## Compatibilidad legacy

El contrato existente de `readiness.json`, perfiles de validación y changes archivados se conserva. El baseline es un requisito aditivo para changes nuevos; no reescribe archivos archivados ni elimina rutas, tokens, datos o compatibilidades de producto. Las migraciones futuras deberán declarar en su propio baseline cuándo pueden retirar una ruta o fallback legacy.

## Owner de spec y contexto

Este change es documentación/harness y no mueve entidades docentes. La tabla de fundaciones UX pertenece al contexto Experiencia y Preferencias: tema/accesibilidad, layout responsive, tokens y navegación. Office, Classroom, Sync e IA permanecen owners o capacidades según el mapa DDD y son consumidores/destinos del shell, no datos del shell. No existe contrato cruzado de dominio.

## Evidencia actual

- Issue #64 está en PlanearIA Product OS, conserva su historia original y pasó `npm run openspec:ready:propose -- --issue 64` con 9 PASS.
- Las dependencias #62 y #63 están cerradas; sus specs documentan el gate de readiness y el mapa DDD que este change extiende.
- La exploración verificó `openspec/config.yaml`, el checker, sus pruebas, el plan de preparación y el plan UX/UI; GitNexus no pudo resolver el checkout y CodeGraph se utilizó como fallback.
- La implementación validó `npm run test:openspec-readiness`, `npm run openspec:validate`, `npm run agent:harness:check`, `npm run agent:opsx:patch:check`, `npm run typecheck` y `npm run lint -- --quiet`.

## Fuera de alcance

No se aplica `theming-runtime`, `breakpoints-reactivos`, `tokens-completos` ni `app-shell-navegacion`. No se modifican pantallas, entidades, Contexts de datos, `src/sync`, backend, IA, AsyncStorage, SQLite, rutas de producto o CI global.
