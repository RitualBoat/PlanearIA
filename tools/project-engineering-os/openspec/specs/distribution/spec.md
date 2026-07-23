# Distribution

## Requirements

### Requirement: A release has one verifiable identity

The release SHALL bind package version, commit, tag, tested tarball, SHA-256, GitHub Release, npm artifact
and provenance. It SHALL NOT rebuild between GitHub and npm publication.

#### Scenario: Release candidate is published

- **WHEN** the protected release workflow receives an approved SemVer tag
- **THEN** it packs and tests one tarball
- **AND** both publication jobs consume that exact artifact and checksum

### Requirement: Public exports are neutral

The public tree SHALL be generated from an allowlist and SHALL reject consumer-specific domain rules,
absolute user paths, secrets, duplicate runtimes and incidental files. Text identity SHALL use canonical
LF hashing and the repository SHALL enforce LF checkouts so Windows, macOS and Linux do not report
line-ending-only drift.

#### Scenario: Forbidden content is present

- **WHEN** the neutrality checker finds a forbidden path, term or secret pattern
- **THEN** CI fails before packaging
- **AND** reports the file without printing a secret value

#### Scenario: A checkout changes only text line endings

- **WHEN** an exported text file is checked out with CRLF instead of LF
- **THEN** canonical export identity remains unchanged
- **AND** any non-line-ending content change still fails the comparison

### Requirement: Workflows use minimum privilege

PR CI SHALL run read-only without secrets. Release jobs SHALL use explicit permissions, immutable action
SHAs and OIDC; they SHALL NOT use `pull_request_target` or a persistent npm token fallback.

#### Scenario: A workflow action uses a floating tag

- **WHEN** supply-chain validation finds a non-SHA action reference
- **THEN** the check fails
- **AND** requires a verified commit reference
