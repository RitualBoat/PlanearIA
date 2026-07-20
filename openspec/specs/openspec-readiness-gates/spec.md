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

### Requirement: El gate pre-propose bloquea planes pausados por deuda

Cuando el motor de deuda esta configurado, el gate read-only de propose SHALL resolver el plan duenio
del issue mediante el ruteo declarado en la politica de deuda y SHALL fallar con causa y recuperacion
cuando ese plan este pausado, salvo que el issue lleve una label de la allowlist de saneamiento,
seguridad, incidentes o rollback. Ante deuda transversal critica, el bloqueo SHALL aplicar a todos los
planes. Si el namespace de deuda no existe, el gate SHALL reportar la verificacion como omitida de
forma explicita, nunca como exito implicito.

#### Scenario: Feature de plan pausado

- **WHEN** el gate de propose evalua un issue cuyo plan esta pausado por presupuesto agotado
- **THEN** el gate falla nombrando el plan, el trigger activo y el issue de remediacion a ejecutar

#### Scenario: Saneamiento permitido

- **WHEN** el issue lleva la label de remediacion declarada en la politica
- **THEN** el gate de deuda pasa aunque el plan este pausado

#### Scenario: Plan distinto no afectado

- **WHEN** el plan del issue no tiene triggers activos y otro plan si esta pausado
- **THEN** el gate de deuda pasa para ese issue

#### Scenario: Motor no configurado

- **WHEN** el repositorio no tiene `.project-os/debt/config.json`
- **THEN** el gate reporta la verificacion de deuda como omitida con esa causa

### Requirement: El gate de archive exige un assessment de deuda sin bloqueos

Cuando el motor de deuda esta configurado, el gate read-only de archive SHALL exigir un assessment
valido del flujo, incluso con resultado `clean`, y SHALL fallar cuando el flujo tenga Blockers o
Majors que sigan abiertos en el registro, cuando exista deuda transversal critica abierta o cuando
cualquier change (incluido el de saneamiento, por la regla NO GENERAR MAS DEUDA TECNICA) deje deuda
confirmada nueva abierta sobre un plan pausado. Como el assessment es evidencia historica inmutable,
el bloqueo SHALL evaluarse contra el estado vivo del registro: un Blocker o Major capturado y despues
resuelto, refutado o aceptado con excepcion valida SHALL NOT dejar el archive en bloqueo permanente.
El gate SHALL seguir siendo read-only y SHALL NOT ejecutar contenido declarado por el registro de
deuda.

#### Scenario: Cierre limpio

- **WHEN** el change tiene un assessment valido con resultado `clean`
- **THEN** la verificacion de deuda del archive pasa

#### Scenario: Blocker abierto del flujo

- **WHEN** el assessment del change confirma un Blocker o Major abierto
- **THEN** el gate de archive falla con el item, su evidencia y la recuperacion

#### Scenario: Blocker capturado y despues resuelto

- **WHEN** el assessment confirmo un Blocker o Major que un flujo de saneamiento posterior resolvio o
  refuto con evidencia en el registro
- **THEN** el gate de archive deja de bloquear sin editar la evidencia historica

#### Scenario: Assessment ausente

- **WHEN** el change no tiene assessment capturado
- **THEN** el gate falla indicando el comando de captura como recuperacion

