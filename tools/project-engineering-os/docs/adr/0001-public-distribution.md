# ADR 0001: public distribution and ownership

- Status: accepted
- Date: 2026-07-23

## Context

The constructor and technical-debt engine were proven as separate embedded tools in a private consumer.
Keeping two editable copies would create drift, coordinated releases and ambiguous ownership.

## Decision

Use one public repository and one npm package, `create-project-engineering-os`, with two bins pointing to
the same entrypoint. Constructor and debt schemas keep separate stores but share a SemVer release.

The initial repository is a clean allowlisted export without private history. The npm tarball is packed
once, tested, checksummed, attached to GitHub Release and promoted unchanged to npm. Publishing uses npm
Trusted Publishing with OIDC, a protected environment, least privilege and immutable action references.

Consumers pin an exact version. Upgrades are previewed read-only, use managed ownership and transactions,
and may open a pull request only by explicit request. The upstream owns runtime behavior and full specs;
consumers own product code, seed-once policy, overlays and acceptance contracts.

## Consequences

- A single release coordinates bootstrap and debt behavior.
- State schemas need explicit migrations and rollback that never removes debt assessments.
- Consumer repositories do not contain an editable runtime copy after cutover.
- Creating the public repository, changing protection and publishing remain human-authorized gates.
