# Compatibility matrix

This document describes the portable contract of the universal environment. The canonical machine-readable
harness matrix is `.project-os/harness-capabilities.json`; generated copies are evidence of configuration,
not proof that an IDE process loaded or authenticated a tool.

## Capability vocabulary

- `native`: the harness consumes a dedicated repository surface with equivalent semantics.
- `generated`: a deterministic adapter maps the canonical source to a supported general surface.
- `documented`: the rule remains visible through repository instructions but has no claimed technical
  enforcement.
- `unsupported`: the harness cannot represent the capability and no equivalent is claimed.

## Harness compatibility

| Harness | Instructions | Rules by path | Skills | Permissions | MCP | Profiles |
|---|---|---|---|---|---|---|
| Claude Code | native | documented | native | documented | native | documented |
| Codex | native | documented | native | documented | native | documented |
| Cursor | native | documented | unsupported | documented | native | documented |
| GitHub Copilot | native | documented | unsupported | unsupported | unsupported | documented |
| OpenCode | generated | documented | generated | documented | native | documented |

Rules by path are intentionally `documented` in this version. The generated aggregate files expose every
rule, but they do not preserve per-glob enforcement. A future renderer may promote a cell only after it
generates one official per-rule surface and fixtures prove equivalent selection.

The universal permission policy always appears in `AGENTS.md`. Empty Claude settings and omitted OpenCode
permission configuration are deliberate degradations, not enforcement. An unsupported or documented cell
must never be counted as native parity.

## Operating-system and runtime contract

| Environment | Runtime configured in advisory CI | Contract |
|---|---|---|
| Ubuntu | Node 20.20.0 and 22.22.0 | Locked install, parity check, OPSX check, doctor JSON, and OpenSpec validation |
| Windows | Node 22.22.0 | Same commands through npm and the Node runtime; no Bash dependency in the constructor |
| macOS | Node 22.22.0 | Same commands through npm and the Node runtime |

The supported Node range is `^20.20.0 || >=22.22.0`. Generated text uses LF and repository-relative paths.
Filesystem preflight rejects unsafe traversal and symlink escape. The advisory matrix uses `fail-fast:
false` to collect all results, but an individual failure remains a failure. A missing, skipped, or
cancelled job is not success evidence.

## Signals that remain distinct

1. A generated configuration proves only structural presence.
2. Process startup proves only that a harness can launch.
3. Tool listing proves only discovery.
4. An authenticated smoke proves usable authority at that moment.

The doctor reports these separately as `PASS`, `FAIL`, `WARN`, or `SKIP`. It never installs, repairs,
authenticates, updates, reindexes, or starts a process.

## Promotion and rollback

Promote an advisory capability or CI job only after a stable baseline, a versioned decision, false-positive
review, and a tested rollback. On regression, restore the previous immutable constructor artifact, run
`constructor:sync:check`, and use the transaction-specific rollback only when its hashes still match.
