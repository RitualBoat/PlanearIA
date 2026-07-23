# Constructor reutilizable de proyectos

> **Estado:** distribución pública operativa.
> **Release consumible:** `create-project-engineering-os@0.1.4`.
> **Upstream:** [`RitualBoat/project-engineering-os`](https://github.com/RitualBoat/project-engineering-os).
> **Issue de distribución:** [#126](https://github.com/RitualBoat/PlanearIA/issues/126).

## Empezar

Para una persona que crea un repositorio nuevo:

1. leer el
   [README amigable del upstream](https://github.com/RitualBoat/project-engineering-os/tree/v0.1.4#readme);
2. ejecutar `npx --yes create-project-engineering-os@0.1.4 bootstrap --target .`;
3. instalar el lockfile generado con `npm ci`;
4. inicializar OpenSpec y adaptar sus archivos OPSX según
   [el runbook](RUNBOOK_CONSTRUCTOR.md);
5. ejecutar sync/check, doctor y debt check;
6. completar los gates humanos de [la guía manual](GUIA_MANUAL_USUARIO.md);
7. usar el
   [Prompt 01 fijado en `v0.1.4`](https://github.com/RitualBoat/project-engineering-os/blob/v0.1.4/docs/prompts/PROMPT_01_DISCOVERY_PROYECTO.md)
   solo después de aprobar Etapa A.

El [Prompt 00](PROMPT_00_BOOTSTRAP_ENTORNO.md) prepara el entorno y no pregunta por el producto.
El Prompt 01 es un handoff inerte durante bootstrap; su ejecución pertenece a discovery.

## Auditoría y decisiones de PlanearIA

1. [Plan maestro](../../01-planes-maestros/PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md).
2. [Auditoría as-is](AUDITORIA_AS_IS.md).
3. [Matriz de transferibilidad](MATRIZ_TRANSFERIBILIDAD.md).
4. [Gap analysis](GAP_ANALYSIS.md).
5. [Compatibilidad por agente y SO](COMPATIBILIDAD_AGENTES_SO.md).
6. [Costos, licencias, secretos y scanners](COSTOS_LICENCIAS_SEGURIDAD.md).
7. [Actualización y rollback](ACTUALIZACION_Y_ROLLBACK.md).

## Ownership vigente

- El paquete, blueprint, schemas, tests completos, prompts canónicos y migraciones pertenecen al upstream.
- PlanearIA fija `0.1.4`, conserva sus specs de contrato consumidor y ejecuta smokes de integración.
- `.project-os/debt/` sigue siendo estado e historia propios de PlanearIA; no se mueve al upstream.
- `.agents/` sigue siendo la fuente del harness específico de PlanearIA.
- OpenSpec sigue siendo el único owner de sus workflows OPSX generados.

No editar una copia local del runtime para “arreglar” PlanearIA. Una corrección del motor nace en el
upstream, publica un patch y vuelve a PlanearIA mediante dependencia exacta y PR.
