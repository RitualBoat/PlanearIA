# gitnexus-index-health Specification

## Purpose
TBD - created by archiving change reparar-gitnexus-fts. Update Purpose after archive.
## Requirements
### Requirement: GitNexus health distinguishes index freshness from query capability

The repository SHALL execute the GitNexus status diagnostic from the verified root of the active checkout. It SHALL evaluate GitNexus as healthy only when that rooted diagnostic, index freshness check, FTS availability, a known structural query, and an UID-disambiguated impact command all succeed. An up-to-date commit alone SHALL NOT be reported as a healthy structural-query path, and a semantic `Not a git repository` result SHALL fail the diagnostic even when its child process exits with code zero.

Index freshness SHALL be derived by classifying the status output into exactly one of three states: `fresh`, `stale`, or `unclassifiable`. The classification SHALL be anchored to the status line emitted by the CLI and SHALL NOT depend on the incidental presence of a freshness keyword elsewhere in the output. Health SHALL NOT be expressed as the absence of an enumerated list of failure signatures: any output that the classifier cannot resolve to `fresh` SHALL fail.

This contract SHALL bind every consumer of the diagnostic, including the harness doctor, and SHALL NOT be satisfied by a consumer that only matches known error signatures. The structural query and the UID-disambiguated impact fixture SHALL be evaluated through a single shared implementation, so that consumers cannot drift into divergent definitions of a healthy structural path.

#### Scenario: Windows diagnostic runs from the checkout root

- **WHEN** a maintainer runs `npm run gitnexus:diagnose` from a valid PlanearIA checkout on Windows
- **THEN** the wrapper and `npx` invocation execute from that verified checkout root without an intermediate shell
- **AND** the diagnostic does not emit `Not a git repository` because of an inherited or ambiguous working directory

#### Scenario: Status emits a semantic repository error with exit zero

- **WHEN** the GitNexus status output contains `Not a git repository` while its child process exits with code zero
- **THEN** the diagnostic exits with a non-zero code and an actionable failure
- **AND** no consumer reports the structural path as healthy

#### Scenario: Current index has unavailable FTS

- **WHEN** GitNexus reports the indexed commit as current but emits an FTS-unavailable or FTS-indexes-missing diagnostic for the known query
- **THEN** the health command fails with an actionable FTS reason
- **AND** it does not report the structural-query path as healthy

#### Scenario: Index is stale against the current checkout

- **WHEN** the status output classifies the index as `stale` because the indexed commit or branch differs from the active checkout
- **THEN** every consumer of the diagnostic reports GitNexus as failed and names index freshness as the cause
- **AND** the result is not degraded to a warning that keeps the aggregate verdict green

#### Scenario: Status output cannot be classified

- **WHEN** the status output contains no status line that the classifier resolves to `fresh` or `stale`
- **THEN** the freshness classification is `unclassifiable` and the consumer reports GitNexus as failed
- **AND** the absence of a known failure signature is not accepted as evidence of health

#### Scenario: The health gate runs against a stale index

- **WHEN** the structural verification command runs on a checkout whose index is classified as `stale`
- **THEN** it fails on freshness before evaluating its fixtures
- **AND** the fact that its fixtures would still resolve does not make it report the structural path as healthy

#### Scenario: Structural verification issues only read commands

- **WHEN** the shared structural verification runs in any outcome
- **THEN** the only GitNexus subcommands it issues are the known query and the UID-disambiguated impact
- **AND** it never issues an analyze, repair, or reindex invocation

#### Scenario: Fresh index fails the structural fixture

- **WHEN** the index is classified as `fresh` but the known MVVM query returns no structural context or the UID-disambiguated impact fixture does not resolve exactly
- **THEN** the consumer reports GitNexus as failed and names the unresolved fixture as the cause
- **AND** it does not report the structural-query path as healthy

#### Scenario: Index and query path are healthy

- **WHEN** the rooted status check classifies the index as `fresh`, no FTS degradation or semantic repository error is emitted, and the shared structural verification resolves both the known query and the UID-disambiguated impact fixture
- **THEN** the health command reports GitNexus as healthy
- **AND** the evidence records the CLI version, Node version, and indexed commit

### Requirement: FTS repair is isolated from tracked agent context

The repository SHALL provide a single explicit GitNexus recovery command that restores index freshness and full-text search capability together, using an approved CLI invocation that confines generated changes to the local GitNexus index. The recovery command SHALL NOT report success while leaving the index classified as `stale`. The repository SHALL NOT expose a second parallel recovery command; the documented recovery sequence SHALL be that command followed by the structural verification command.

#### Scenario: Repair succeeds without agent-file injection

- **WHEN** an agent runs the approved recovery command for PlanearIA
- **THEN** it rebuilds the local index and its full-text search capability without an extension error
- **AND** it does not modify tracked `AGENTS.md`, `CLAUDE.md`, generated Copilot instructions, or GitNexus skills

#### Scenario: Recovery restores freshness

- **WHEN** the approved recovery command completes successfully on a checkout whose index was classified as `stale`
- **THEN** the subsequent status diagnostic classifies the index as `fresh` at the current commit
- **AND** the structural verification command succeeds against that index

#### Scenario: Recovery reports success without restoring freshness

- **WHEN** the recovery command exits successfully but the index remains classified as `stale`
- **THEN** the recovery is treated as failed and reports the persisting staleness
- **AND** the workflow does not accept the recovery as complete

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

### Requirement: El CLI de salud GitNexus ejecuta portablemente
El entrypoint de `gitNexusFts.mjs` SHALL reconocer una invocación directa mediante una file URL normalizada por Node y SHALL ejecutar `diagnose` tanto en Windows como en POSIX. Su prueba de proceso SHALL exigir un reporte de frescura o un fallo accionable, nunca una salida vacía.

#### Scenario: Diagnose ejecutado como proceso hijo
- **WHEN** la prueba CLI ejecuta `gitNexusFts.mjs diagnose` en Windows o Linux
- **THEN** el proceso emite el reporte de diagnóstico del checkout
- **AND** la prueba falla si el guard no ejecuta `main`

