# Versioning and migrations

The package follows SemVer. Package, tag, changelog, release asset and npm registry version must match.

- Patch: compatible defect or documentation correction.
- Minor: compatible capability, blueprint addition or explicit schema migration.
- Major: incompatible CLI, ownership, state or policy change; requires a migration guide and approval.

State, debt config, registry and assessment schemas have independent integer versions. A CLI rejects a
future schema before writing. Supported migrations are deterministic, listed by `upgrade --check` and
covered by fixtures. Releases are immutable: a bad version is deprecated and corrected by a new version.
