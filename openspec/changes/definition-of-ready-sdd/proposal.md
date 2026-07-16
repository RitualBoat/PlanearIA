## Why

El flujo SDD ya exige issue, enrich, evidencia y archive, pero esos requisitos dependen de lectura manual y no existe un gate que compruebe la trazabilidad antes de `propose` ni la evidencia proporcional antes de `archive`. Esto permite abrir changes incompletos o cerrar trabajo sin rollback, excepciones explícitas o pruebas adecuadas al riesgo.

## What Changes

- Añadir gates locales, deterministas y de solo lectura para comprobar Definition of Ready antes de `propose` y Definition of Done antes de `archive`.
- Definir una metadata de readiness versionada que enlace issue, change, superficies afectadas, validaciones, evidencia, rollback y excepciones temporales justificadas.
- Comunicar el flujo y la matriz proporcional desde la fuente `.agents`, regenerar sus espejos y reforzar la guía de workflows OpenSpec mediante el parche post-update existente.
- Incorporar fixtures válidos e inválidos, mensajes de recuperación concretos y comandos npm explícitos, sin convertir el doctor general ni CI en un bloqueo nuevo.

## Capabilities

### New Capabilities

- `openspec-readiness-gates`: Gates de pre-propose y pre-archive que validan trazabilidad, metadata, excepciones y evidencia proporcional de un change.

### Modified Capabilities

- `agent-harness-parity`: Las instrucciones fuente y los workflows OpenSpec espejados también deben conservar la guía de DoR/DoD y sus comandos de gate después de regenerarse.

## Impact

- Instrucciones fuente `.agents/instructions/core.md` y espejos generados `AGENTS.md`, `CLAUDE.md` y `.github/copilot-instructions.md`.
- `scripts/patchOpsxWorkflows.mjs` y los destinos OpenSpec que normaliza; no se altera la propiedad de los workflows por la CLI.
- Nuevo checker Node read-only, contrato de metadata por change, comandos npm y tests con fixtures.
- `openspec/config.yaml` y documentación operativa/SDD afectada para publicar el contrato y la matriz de validación.
- No afecta runtime docente, frontend, sync académico, backend ni proveedores de IA.

## No objetivos

- No ejecutar `apply`, archive, merge, autenticación o cambios de GitHub automáticamente.
- No sustituir QA visual, revisión adversarial, aprobación de Figma ni decisiones humanas por un falso check automático.
- No endurecer CI global ni modificar specs archivadas manualmente.
- No duplicar el `harness:doctor` ni migrar los workflows fuera de la CLI OpenSpec y su parche post-update.

## Referencias

- Issue: #62 — Hacer ejecutable la Definition of Ready y Done de OpenSpec.
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`, secciones 1.6, 1.7 y Ola 1.
- Ground truth: `Documentacion/01-planes-maestros/meta_guia_planes.md` y `openspec/config.yaml`.
