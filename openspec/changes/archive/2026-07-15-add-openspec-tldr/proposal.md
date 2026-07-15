## Why

Los artefactos OpenSpec resuelven preguntas distintas, pero hoy no dejan una entrada breve que explique su función y el plan completo de un change. Añadir un único `TLDR.md` al flujo reduce esa fricción sin sustituir el contrato técnico de `proposal.md`, `design.md`, las specs ni `tasks.md`.

## What Changes

- Definir un contrato humano para un único `TLDR.md` en la raíz de cada change nuevo, con cinco secciones ordenadas: Proposal, Design, Spec, Tasks y un resumen integral.
- Hacer que las instrucciones de propose creen el TLDR junto con los artefactos requeridos; las de apply lo revisen cuando el alcance cambie; y las de archive confirmen que se traslada con el directorio.
- Mantener esas instrucciones desde las fuentes canónicas y el parche determinista posterior a `openspec update`, regenerando los espejos sin editar `AGENTS.md` ni `CLAUDE.md` a mano.
- Añadir una validación y fixtures reproducibles que revisen únicamente que cada change activo tenga `TLDR.md` exactamente en su raíz y ofrezcan una remediación clara.

## Capabilities

### New Capabilities

- `openspec-change-tldr`: Contrato, ciclo de vida y validación de ubicación de un resumen humano por change OpenSpec.

### Modified Capabilities

- `agent-harness-parity`: Las instrucciones OpenSpec y sus espejos generados deberán conservar la convención TLDR después de sincronizar o actualizar los workflows.

## Impact

- Afecta las fuentes de instrucciones OpenSpec bajo `.agents/`, el parche post-`openspec update`, los scripts npm y Node de validación, sus pruebas/fixtures y la especificación de paridad del harness.
- Los mirrors se regenerarán con los comandos existentes; `AGENTS.md` y `CLAUDE.md` sólo cambiarán como salidas de `npm run agent:harness:sync`.
- No modifica la aplicación, backend, datos, sincronización, autenticación, dependencias ni el contenido histórico de changes archivados.
- Plan maestro afectado: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (gobernanza y flujo SDD).

## No objetivos

- Reescribir, completar o validar retrospectivamente TLDRs de changes activos o archivados previos.
- Medir automáticamente tono, calidad, encabezados, orden o el límite de 120 palabras; esos aspectos quedan en la instrucción y revisión humana.
- Reemplazar o reducir `proposal.md`, `design.md`, specs o `tasks.md`, ni cambiar el esquema OpenSpec instalado o su versión.
