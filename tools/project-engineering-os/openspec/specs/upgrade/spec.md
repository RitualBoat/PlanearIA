# Upgrade and recovery

## Requirements

### Requirement: Upgrade is explicit and transactional

Upgrade SHALL require exactly one of `--check` or `--apply`, SHALL target the invoked exact package version
and SHALL reuse ownership, hashes, journals, resume and rollback.

#### Scenario: Upgrade check is repeated

- **WHEN** the same repository and release are checked twice
- **THEN** both plans are identical and read-only
- **AND** the repository bytes do not change

#### Scenario: Upgrade fails partially

- **WHEN** a write is interrupted
- **THEN** the next identical invocation can resume
- **AND** explicit rollback restores the prior verified state without deleting debt assessments

### Requirement: Pull-request automation is opt-in

`--open-pr` SHALL require a clean tree and authenticated GitHub CLI, create or reuse a versioned branch
and PR, and constrain the commit to the upgrade plan. It SHALL NOT approve, merge or push directly to the
protected branch.

#### Scenario: GitHub is not authenticated

- **WHEN** `--apply --open-pr` cannot verify `gh auth status`
- **THEN** it fails before mutation
- **AND** returns a concrete authentication recovery step

