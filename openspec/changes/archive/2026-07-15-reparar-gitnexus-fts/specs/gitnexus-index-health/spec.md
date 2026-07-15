## ADDED Requirements

### Requirement: GitNexus health distinguishes index freshness from query capability

The repository SHALL evaluate GitNexus as healthy only when the index freshness check, FTS availability, a known structural query, and an UID-disambiguated impact command all succeed. An up-to-date commit alone SHALL NOT be reported as a healthy structural-query path.

#### Scenario: Current index has unavailable FTS

- **WHEN** GitNexus reports the indexed commit as current but emits an FTS-unavailable or FTS-indexes-missing diagnostic for the known query
- **THEN** the health command fails with an actionable FTS reason
- **AND** it does not report the structural-query path as healthy

#### Scenario: Index and query path are healthy

- **WHEN** the status check is current, no FTS degradation is emitted, and the known query returns relevant definitions
- **THEN** the health command reports GitNexus as healthy
- **AND** the evidence records the CLI version, Node version, and indexed commit

### Requirement: FTS repair is isolated from tracked agent context

The repository SHALL provide an explicit GitNexus FTS repair command that uses the approved CLI invocation with `analyze --repair-fts --index-only` and confines generated changes to the local GitNexus index.

#### Scenario: Repair succeeds without agent-file injection

- **WHEN** an agent runs the approved repair command for PlanearIA
- **THEN** it rebuilds the local FTS index without an extension error
- **AND** it does not modify tracked `AGENTS.md`, `CLAUDE.md`, generated Copilot instructions, or GitNexus skills

#### Scenario: Repair leaves unexpected tracked changes

- **WHEN** the repair workflow detects tracked agent-context changes after execution
- **THEN** verification fails and reports the changed paths
- **AND** the workflow does not accept the repair as complete

### Requirement: Structural verification uses stable fixtures

The repository SHALL verify a known MVVM query and an exact GitNexus impact fixture after repair. The impact fixture SHALL use a UID or an explicit file/kind disambiguator when a symbol name has multiple candidates.

#### Scenario: Known MVVM query returns useful evidence

- **WHEN** verification runs after successful FTS repair
- **THEN** the known MVVM query returns relevant definitions or files instead of an empty degraded result
- **AND** the evidence identifies the query and the returned structural context

#### Scenario: Impact name is ambiguous

- **WHEN** an impact lookup returns more than one candidate for a symbol name
- **THEN** verification reruns it with the approved UID or explicit file/kind
- **AND** it records the resulting dependants and risk classification

### Requirement: Failed repair remains visible and recoverable

The repository SHALL record a failed FTS repair with recovery instructions and retain CodeGraph only as a documented fallback. A failed repair SHALL NOT silently change the primary code-intelligence policy.

#### Scenario: No compatible repair path is available

- **WHEN** the approved repair command cannot make FTS available on the active runtime
- **THEN** the evidence captures the CLI version, Node version, failure output, and index state
- **AND** the Project item is moved to `Blocked` pending an explicit runtime or policy decision
- **AND** CodeGraph may be used only for the affected immediate lookup

#### Scenario: Local index recovery is needed

- **WHEN** a failed repair leaves the local GitNexus index unusable
- **THEN** the documented cleanup and index-only reindex procedure restores only generated local index state
- **AND** application source, backend data, and academic records remain unchanged
