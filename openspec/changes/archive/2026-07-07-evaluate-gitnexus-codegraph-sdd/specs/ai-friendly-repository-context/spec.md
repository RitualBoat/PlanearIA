## MODIFIED Requirements

### Requirement: Agent entrypoints route to the current SDD workflow
The repository SHALL provide concise entrypoints that route AI agents and human collaborators to the current PlanearIA source of truth hierarchy, OpenSpec SDD workflow, and approved code-intelligence policy.

#### Scenario: Codex starts from AGENTS
- **WHEN** Codex starts by reading `AGENTS.md`
- **THEN** it can identify `CLAUDE.md`, `Documentacion/README.md`, `openspec/config.yaml`, the approved knowledge-graph/tooling policy for structural exploration, GitHub issue tracking, OpenSpec changes, and mandatory evidence gates.

#### Scenario: Collaborator starts from README
- **WHEN** a collaborator opens `README.md`
- **THEN** it describes PlanearIA as a current connected teacher suite and links to active documentation without referencing missing documents.

#### Scenario: Lightweight assistant reads Copilot instructions
- **WHEN** GitHub Copilot or a similar assistant reads `.github/copilot-instructions.md`
- **THEN** it receives the same critical SDD, architecture, validation, no secrets, `src/sync`, `userId`, `aiGateway`, and approved code-intelligence policy rules as the other front doors.

### Requirement: CodeGraph exploration focuses on PlanearIA source
CodeGraph and any other approved structural code-exploration tool SHALL focus on PlanearIA application source, backend, types, shared contracts, and project configuration rather than external reference material.

#### Scenario: Structural explorer lists context files
- **WHEN** a structural exploration tool lists or indexes `context/`
- **THEN** external `context/referencias-opensource/**/source` implementation files are absent from normal PlanearIA implementation results or documented as a residual risk.

#### Scenario: Agent asks architecture question
- **WHEN** an agent uses the approved knowledge-graph policy for PlanearIA architecture or blast radius
- **THEN** results prioritize `src/`, `backend/`, `types/`, `shared/`, and project config rather than external reference repos.

#### Scenario: Approved tool policy changes
- **WHEN** the project adopts GitNexus, keeps CodeGraph, or defines a dual-tool routing policy
- **THEN** active entrypoints and SDD docs describe that policy consistently
- **AND** agents do not rely on stale CodeGraph-only instructions when the approved policy says otherwise.
