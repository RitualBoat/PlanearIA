# Changelog

All notable changes follow [Semantic Versioning](https://semver.org/).

## 0.1.1 - 2026-07-23

- First stable npm/npx release through Trusted Publishing OIDC.
- Correct relative tarball publication and make GitHub Release recovery idempotent.
- Enforce canonical LF export identity across Windows, macOS and Linux.
- Move public workflows to current Node 24-based immutable action releases.

## 0.1.0 - 2026-07-23

- Partial GitHub-only release candidate; npm promotion failed before publishing and this version must not
  be consumed.
- Reproducible environment bootstrap, harness parity, OpenSpec SDD and read-only doctor.
- Integrated `project-os debt` control loop with immutable assessments and per-plan budgets.
- Deterministic consumer upgrades, transactional recovery and optional pull-request handoff.

No version is considered released until its Git tag, GitHub Release tarball, checksum, npm artifact and
provenance have the same verified identity.
