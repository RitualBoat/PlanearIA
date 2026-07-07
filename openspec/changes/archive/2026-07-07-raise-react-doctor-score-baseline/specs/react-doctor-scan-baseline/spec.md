## ADDED Requirements

### Requirement: React Doctor scans product source only
React Doctor SHALL exclude generated artifacts, local worktrees, and reference-only external code from product baseline scans.

#### Scenario: Non-product folders are excluded
- **WHEN** React Doctor runs a full baseline scan
- **THEN** files under `dist/**`, `.claude/worktrees/**`, and `context/referencias-opensource/**` are not reported as product findings
- **AND** the scan still includes PlanearIA product source under `src/**`, `backend/**`, `App.tsx`, and project config files.

#### Scenario: Baseline counts distinguish noise from product risk
- **WHEN** the baseline scan is recorded
- **THEN** the evidence includes total findings, excluded-folder findings, and remaining product findings
- **AND** top errors from reference-only folders no longer drive the reported product baseline.

### Requirement: React Doctor CI remains advisory until the baseline is reliable
React Doctor CI SHALL report findings without blocking PRs until product error findings are resolved or explicitly accepted.

#### Scenario: Pull request scan finds existing legacy warnings
- **WHEN** React Doctor reports legacy warnings that are outside this change scope
- **THEN** CI remains advisory
- **AND** the warnings are tracked as future UX/UI or maintenance backlog rather than blocking the PR.

#### Scenario: Product error gate is enabled later
- **WHEN** product error findings are zero or accepted with evidence
- **THEN** the workflow can be changed to block only new real product errors.

### Requirement: Product OS issue remains linked to the SDD change
The OpenSpec change SHALL reference the GitHub issue/user story that created it.

#### Scenario: Agent resumes the change later
- **WHEN** a future agent opens the OpenSpec artifacts
- **THEN** it can find GitHub issue #38 as the Product OS source
- **AND** it does not need to infer why the change exists from local files alone.
