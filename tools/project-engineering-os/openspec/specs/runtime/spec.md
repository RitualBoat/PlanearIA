# Runtime

## Requirements

### Requirement: Bootstrap separates universal core from product

Bootstrap SHALL install only universal governance, SDD, harness, documentation, quality and debt-control
assets. It SHALL NOT select product frameworks, databases, cloud or conditional profiles.

#### Scenario: Empty repository is bootstrapped

- **WHEN** a supported exact package version runs bootstrap
- **THEN** the universal core and empty debt state are installed transactionally
- **AND** a second run produces no unexpected drift

### Requirement: Ownership prevents silent overwrite

Every managed target SHALL declare constructor, human-overlay, project or external OpenSpec ownership.
Human or project content SHALL be preserved unless an explicit migration validates the expected hash.

#### Scenario: A managed file was edited

- **WHEN** sync detects an unexpected human hash
- **THEN** it reports a conflict before any write
- **AND** provides recovery

### Requirement: Doctor is read-only and truthful

Doctor SHALL return human and JSON results using PASS, FAIL, WARN and SKIP with cause and recovery. It
SHALL NOT install, repair, authenticate, update or reindex.

#### Scenario: A configured tool cannot authenticate

- **WHEN** authenticated smoke is required and fails
- **THEN** doctor does not infer PASS from configuration or process startup
- **AND** reports the profile-appropriate failure status

