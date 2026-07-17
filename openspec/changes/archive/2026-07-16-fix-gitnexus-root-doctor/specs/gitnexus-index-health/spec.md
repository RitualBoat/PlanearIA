## MODIFIED Requirements

### Requirement: GitNexus health distinguishes index freshness from query capability

The repository SHALL execute the GitNexus status diagnostic from the verified root of the active checkout. It SHALL evaluate GitNexus as healthy only when that rooted diagnostic, index freshness check, FTS availability, a known structural query, and an UID-disambiguated impact command all succeed. An up-to-date commit alone SHALL NOT be reported as a healthy structural-query path, and a semantic `Not a git repository` result SHALL fail the diagnostic even when its child process exits with code zero.

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

#### Scenario: Index and query path are healthy

- **WHEN** the rooted status check is current, no FTS degradation or semantic repository error is emitted, and the known query returns relevant definitions
- **THEN** the health command reports GitNexus as healthy
- **AND** the evidence records the CLI version, Node version, and indexed commit
