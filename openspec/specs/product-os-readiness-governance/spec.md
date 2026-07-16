# Product OS Readiness Governance Specification

## Purpose

Define the operational governance that keeps the readiness plan, its Product OS tracking,
milestones, and post-wave debt aligned without losing history or opening unrelated work.

## Requirements

### Requirement: El Product OS representa el estado ejecutable del plan de readiness

PlanearIA SHALL mantener una fotografia verificable que relacione la epic #42, los issues de Gate M/Ola 0/Ola 1, sus estados en `PlanearIA Product OS` y los milestones relevantes. La fotografia SHALL distinguir trabajo cerrado, activo, aparcado y deuda posterior sin inferir completitud solo desde el titulo de un item.

#### Scenario: Mantenedor prepara el siguiente change de readiness

- **WHEN** un mantenedor consulta la documentacion operativa y la epic #42 antes de iniciar un change
- **THEN** puede identificar el estado ejecutable o archivado de #65 mediante su issue, PR y artefactos OpenSpec
- **AND** identifica que #46 y #47 permanecen abiertos y `Parked` porque bloquean R2, no R0/R1

#### Scenario: El Project contiene trabajo ajeno al plan

- **WHEN** el Project incluye un issue abierto que no pertenece a la epic de readiness
- **THEN** la fotografia lo excluye de los conteos y decisiones del plan #42
- **AND** no modifica ese issue para aparentar que el plan tiene menos trabajo abierto

### Requirement: Los milestones tienen una disposicion conservadora y reversible

Antes de cerrar, conservar o aparcar un milestone, PlanearIA SHALL registrar su numero, conteo de issues abiertos/cerrados, relacion con el plan activo y decision justificada. SHALL cerrar solamente un milestone historico sin issues abiertos y sin plan aun activo; SHALL conservar abiertos los milestones de UX, Auth o Gate M mientras su plan/gate tenga una razon vigente. SHALL NOT renombrar milestones por estetica.

#### Scenario: Milestone historico completamente terminado

- **WHEN** la consulta GitHub confirma que un milestone historico solo contiene issues cerrados o no contiene items
- **THEN** la matriz autoriza su cierre y conserva el snapshot previo para reabrirlo si aparece una referencia omitida
- **AND** no elimina los issues asociados ni su historial

#### Scenario: Gate manual aun pendiente

- **WHEN** `Readiness Gate M` conserva #46 o #47 abiertos en `Parked`
- **THEN** la matriz conserva abierto el milestone Gate M
- **AND** no trata el aparcamiento como satisfaccion del gate R2

### Requirement: La deuda post-Ola 0 permanece separada y trazable

PlanearIA SHALL conservar #66 abierta en `Backlog`, sin asignarla retroactivamente al milestone `Readiness Ola 0` y sin cerrarla como efecto de normalizar #65. SHALL clasificar sus hallazgos de GitNexus y Expo como remediaciones candidatas independientes, cada una sujeta a su propio issue enriquecido, Definition of Ready y change OpenSpec cuando sea autorizada.

#### Scenario: GitNexus devuelve una salida semantica de error con codigo cero

- **WHEN** el diagnostico de GitNexus imprime `Not a git repository` o una firma equivalente aunque termine con codigo cero
- **THEN** #66 conserva el hallazgo como deuda abierta y enlaza una futura remediacion del doctor separada de #65
- **AND** la gobernanza no declara el harness sano ni modifica GitNexus durante este change

#### Scenario: Expo requiere alineacion por SDK

- **WHEN** la compatibilidad detecta una dependencia Expo fuera de la version esperada por el SDK
- **THEN** #66 conserva una remediacion independiente que usa el flujo compatible de Expo y validacion proporcional
- **AND** #65 no actualiza dependencias ni ejecuta un upgrade masivo a `latest`

### Requirement: Las acciones externas dejan evidencia y no destruyen historial

Las mutaciones de GitHub previstas por este change SHALL verificar el estado justo antes de ejecutarse, registrar el resultado posterior y ser idempotentes. SHALL limitarse a la matriz aprobada; SHALL NOT borrar, fusionar o cerrar issues/items ajenos, ni exponer tokens o secretos. El rollback SHALL restaurar documentos y reabrir solo milestones cerrados por el change cuando sea necesario.

#### Scenario: El estado externo ya coincide con la decision

- **WHEN** una consulta previa muestra que un milestone ya esta cerrado o un item ya conserva el estado requerido
- **THEN** la tarea registra la conformidad y no repite una mutacion innecesaria
- **AND** adjunta la evidencia posterior a la misma matriz de decisiones

#### Scenario: Una edicion concurrente invalida la matriz

- **WHEN** el snapshot previo a una mutacion difiere de la evidencia capturada durante propose
- **THEN** apply se detiene antes de sobrescribir cambios ajenos
- **AND** el mantenedor actualiza la propuesta o solicita una nueva decision externa antes de continuar
