# Constructor reutilizable de proyectos

> **Estado:** Ola 0 en implementación.
> **Alcance:** preparar el entorno de ingeniería sin preguntar por el producto.
> **Issue:** [#103](https://github.com/RitualBoat/PlanearIA/issues/103).

## Entradas principales

1. [Plan maestro](../../01-planes-maestros/PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md).
2. [Auditoría as-is](AUDITORIA_AS_IS.md).
3. [Matriz de transferibilidad](MATRIZ_TRANSFERIBILIDAD.md).
4. [Gap analysis](GAP_ANALYSIS.md).
5. [Runbook](RUNBOOK_CONSTRUCTOR.md).
6. [Prompt 00](PROMPT_00_BOOTSTRAP_ENTORNO.md).
7. [Prompt 01 inerte](../../../tools/project-constructor/blueprint/core/docs/engineering/PROMPT_01_DISCOVERY_PROYECTO.md).
8. [Guía manual](GUIA_MANUAL_USUARIO.md).

## Operación y gobierno

- [Actualización y rollback](ACTUALIZACION_Y_ROLLBACK.md).
- [Compatibilidad por agente y SO](COMPATIBILIDAD_AGENTES_SO.md).
- [Costos, licencias, secretos y scanners](COSTOS_LICENCIAS_SEGURIDAD.md).

## Estado real

Estos documentos describen el contrato de Ola 0. Mientras
`tools/project-constructor/` y sus fixtures no estén implementados y validados, los comandos del runbook
son comportamiento objetivo, no evidencia de una instalación funcional. El Prompt 00 falla de forma
cerrada si no encuentra el CLI; no reimplementa templates desde conversación.

`PROMPT_01_DISCOVERY_PROYECTO` se materializa como handoff inerte y fuente única dentro del blueprint.
Su ejecución y sus resultados pertenecen a Ola 1; Ola 0 no debe preguntar todavía qué producto se
construirá.
