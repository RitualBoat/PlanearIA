# secure-react-doctor-remediation Specification

## Purpose
Ensure security-sensitive React Doctor findings (CI secret exposure, committed secret fallbacks, unallowlisted request bodies) are fixed at the root cause instead of suppressed.

## Requirements
### Requirement: CI installs dependencies before secrets are available
The build pipeline SHALL install dependencies in a step that does not expose deployment, signing, or publishing secrets, and dependency lifecycle scripts SHALL be disabled during that install.

#### Scenario: Dependency install is hardened
- **WHEN** the CD workflow installs project dependencies
- **THEN** the install command includes the package-manager flag that disables lifecycle scripts
- **AND** the install step does not define secret environment variables.

#### Scenario: Secrets are scoped to privileged steps
- **WHEN** the workflow needs signing or deployment authority
- **THEN** those secrets are injected only into the minimal later step that uses them.

### Requirement: Backend secrets do not have committed fallbacks
Backend helpers SHALL NOT use hardcoded literal fallbacks for secret environment variables.

#### Scenario: Required secret is missing
- **WHEN** a backend helper needs a secret environment variable and it is not configured
- **THEN** the helper fails closed or marks the dependent capability unavailable
- **AND** it does not continue with a committed fallback value.

#### Scenario: Required secret is configured
- **WHEN** the required environment variable is present
- **THEN** the backend helper uses the configured value without changing the public API contract.

### Requirement: Request input is allowlisted before persistence
Backend routes SHALL construct persisted objects from explicit request fields instead of spreading arbitrary request bodies.

#### Scenario: Notification request contains unexpected fields
- **WHEN** a client sends a notification create request with additional fields outside the allowlist
- **THEN** the backend ignores those fields when building the persisted notification object.

#### Scenario: Notification request contains valid fields
- **WHEN** a client sends a valid notification create request
- **THEN** the backend persists the expected notification data and preserves userId isolation.
