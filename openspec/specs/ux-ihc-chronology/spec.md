# UX/IHC Chronology Specification

## Purpose

Define the documentation contract that aligns PlanearIA UX/UI waves, Figma prototype preparation, and teacher interviews without treating manual gates as code implementation.

## Requirements

### Requirement: Las fuentes activas declaran una cronologia UX/UI e IHC unica

El plan UX/UI, IHC Discovery, el roadmap y las instrucciones fuente de agentes SHALL declarar una secuencia coherente: el gate operativo R1, definido por el plan de Preparacion SDD, precede Ola 1; durante Ola 1 se coordinan shell, recorridos IHC y la preparacion del prototipo Figma navegable; el gate operativo R2 precede la implementacion visible de Ola 2; las entrevistas se realizan con el prototipo antes de cerrar Ola 2; y la sintesis de hallazgos precede el inicio de Ola 3. Estos gates no se confunden con los riesgos R1/R2 del plan UX/UI.

#### Scenario: Un agente prepara trabajo de Ola 1

- **WHEN** un agente consulta cualquiera de las fuentes activas para planificar Ola 1 de UX/UI
- **THEN** identifica que las decisiones de shell, recorridos IHC y preparacion del prototipo pueden avanzar en paralelo
- **AND** no interpreta que debe esperar a implementar pantallas visibles de Ola 2 para preparar el estimulo de investigacion

#### Scenario: Un mantenedor decide iniciar la implementacion visible de Ola 2

- **WHEN** un mantenedor revisa la transicion de Ola 1 a Ola 2
- **THEN** las fuentes identifican R2 como gate previo con frames Figma aprobados y accesibles, golden journeys, senal de tests limpia y reclutamiento IHC preparado
- **AND** las fuentes conservan que las entrevistas deben completarse antes del cierre de Ola 2 y preferentemente antes de comprometer pantallas de mayor costo

#### Scenario: La sintesis informa el backlog posterior

- **WHEN** concluyen las entrevistas con el prototipo navegable
- **THEN** la cronologia exige sintetizar los hallazgos y ajustar el backlog antes de iniciar Ola 3

### Requirement: Los gates manuales de Figma e IHC permanecen separados del change documental

La documentacion SHALL distinguir la preparacion versionable de la cronologia de los gates manuales #46 y #47. El change no SHALL afirmar que un frame esta aprobado, que el MCP de Figma esta autenticado, que docentes fueron contactados ni que las entrevistas se realizaron sin la evidencia requerida por cada gate.

#### Scenario: Aun no existe ground truth aprobado

- **WHEN** #46 continua pendiente o no hay frames Figma aprobados y accesibles
- **THEN** la documentacion lo muestra como condicion de R2
- **AND** ningun artefacto de este change lo trata como una tarea de implementacion completada

#### Scenario: Aun no hay participantes IHC

- **WHEN** #47 continua Parked o no existe agenda y consentimiento anonimizados
- **THEN** la documentacion conserva que el reclutamiento e investigacion son trabajo humano pendiente
- **AND** no marca el gate como satisfecho por actualizar documentos

### Requirement: El estandar visual tiene jerarquia y referencias internas no ambiguas

El plan UX/UI SHALL mantener `1.9 Estandar de Excelencia Visual` con subsecciones `1.9.1` a `1.9.5`, y `1.10 Plan de transicion conceptual` como la seccion siguiente. Las referencias internas SHALL apuntar a las secciones existentes despues de la renumeracion.

#### Scenario: Un agente sigue el estandar visual

- **WHEN** un agente consulta requisitos de intensidad, traduccion al stack, checklist anti-diseno-generico, motion o herramientas
- **THEN** encuentra esas subsecciones bajo 1.9
- **AND** las referencias desde prototipos, validacion y agentes no apuntan a subsecciones 1.10.x inexistentes

### Requirement: Las instrucciones de agentes propagan la cronologia desde su fuente neutral

La regla de cronologia SHALL vivir en `.agents/instructions/core.md` y SHALL propagarse a `AGENTS.md` y `CLAUDE.md` mediante el generador del harness, sin editar los espejos como fuente de verdad.

#### Scenario: Se actualiza la regla de cronologia

- **WHEN** un mantenedor edita la fuente neutral y ejecuta `npm run agent:harness:sync`
- **THEN** `AGENTS.md` y `CLAUDE.md` contienen la misma regla normativa de cronologia
- **AND** `npm run agent:harness:check` termina sin reportar drift
