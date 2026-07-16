# openspec-readiness-gates Specification

## Purpose

Define read-only Definition of Ready and Definition of Done gates for a PlanearIA OpenSpec issue and change.
## Requirements
### Requirement: Gates validate traceability and completion

The repository SHALL expose read-only propose and archive gates that validate issue/Project/enrich metadata, change confinement, OpenSpec artifacts, completed tasks, evidence, rollback and adversarial review.

#### Scenario: Complete issue and change
- **WHEN** an enriched issue and its change satisfy the applicable readiness contract
- **THEN** the gate reports PASS and exits successfully

#### Scenario: Missing required field
- **WHEN** an issue or change omits a required readiness field
- **THEN** the gate fails with the field and a safe recovery action

### Requirement: Validation profiles are proportional and safe

The gate SHALL use static profiles for docs, harness, UI, sync, IA and backend. A manifest SHALL declare only known validation IDs and evidence references, and SHALL NOT execute manifest-provided commands.

#### Scenario: Unknown command injection
- **WHEN** readiness metadata provides a command, executable path or unknown validation ID
- **THEN** the archive gate fails before executing it

### Requirement: Exceptions are visible and temporary

The gate SHALL accept only allowed exceptions containing field, reason, owner, approver, ISO expiry and recovery. Identity, artifact integrity and pending tasks SHALL NOT be eximible.

#### Scenario: Expired exception
- **WHEN** an exception is expired or incomplete
- **THEN** the gate fails and requests a corrected field or renewed approval

### Requirement: El gate de archive valida el baseline brownfield

El gate read-only de archive SHALL comprobar que el change contiene un `brownfield-baseline.md` confinado a su raíz y que incluye las secciones mínimas del contrato brownfield. SHALL informar la sección faltante o incompleta con una recuperación segura y SHALL NOT ejecutar contenido declarado por el baseline o por `readiness.json`.

#### Scenario: Baseline ausente

- **WHEN** un mantenedor ejecuta el gate de archive para un change que no contiene `brownfield-baseline.md`
- **THEN** el gate falla antes de archive e indica que debe crear el artefacto en la raíz del change
- **AND** no modifica archivos, tareas ni metadatos

#### Scenario: Baseline completo y enfocado

- **WHEN** un change contiene todas las secciones brownfield requeridas con contenido verificable
- **THEN** el gate registra PASS para el baseline
- **AND** continúa con las validaciones estáticas de tareas, evidencia, rollback y revisión adversarial

#### Scenario: Markdown no puede inyectar ejecución

- **WHEN** el baseline contiene bloques de código, enlaces o texto que parece un comando
- **THEN** el gate lo trata únicamente como documentación estructural
- **AND** ejecuta solo los comandos fijos permitidos por los perfiles de superficie
