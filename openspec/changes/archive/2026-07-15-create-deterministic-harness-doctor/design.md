## Context

The current readiness evidence is fragmented across npm scripts. OpenSpec, harness mirroring, MCP parity, and MCP smoke are healthy in the inspected checkout; however, `gitnexus:diagnose` prints `Not a git repository` with a successful process status. The existing GitNexus wrapper only recognizes FTS diagnostics, so it cannot be used as the sole gate. Graphify was deliberately removed by issue #51 and the active MCP test already forbids it.

The doctor is a cross-cutting developer-harness command, not product code. It must be reproducible in the Windows-first checkout, remain read-only, and preserve the existing GitNexus-primary/CodeGraph-fallback policy.

## Goals / Non-Goals

**Goals:**

- Provide one deterministic command that returns an ordered readiness report and an exit code agents can rely on.
- Reuse existing local scripts and locked package tooling wherever possible, while detecting their semantic output instead of trusting exit codes alone.
- Distinguish a required local failure from an expected remote OAuth limitation and from a deliberately retired manual tool.
- Keep recovery explicit and non-mutating.

**Non-Goals:**

- Replace the individual health commands or automatically invoke their repair paths.
- Change the MCP baseline, reintroduce Graphify, or validate `graphify-out/`.
- Authenticate external services, install packages, upgrade Expo, or collect environment secrets.

## Decisions

### Dedicated Node orchestrator with an explicit readiness manifest

Add a project-local Node entrypoint and an adjacent versioned manifest for the expected Project title, check identifiers, status policy, and safe recovery commands. A dedicated manifest avoids overloading `doctor.config.json`, which belongs to React Doctor, and makes the harness contract reviewable without hard-coding policy across multiple scripts.

The entrypoint will expose a small testable runner boundary: production uses `spawnSync` with the repository root as `cwd`; tests inject deterministic command results. It captures child output and emits only normalized evidence, avoiding credentials and unstable process noise.

Alternative considered: a PowerShell-only wrapper. It would match the current workstation but make fixture testing and cross-harness reuse harder. Node is already the local scripting runtime and is the more portable choice.

### Stable result model and exit policy

The report will contain a fixed-order list of `{ id, status, summary, remediation }` records and an aggregate status. Default output is concise human text; `--json` emits exactly one structured document for CI/tests. `PASS` means the requested contract is satisfied, `FAIL` blocks readiness, `WARN` records a non-blocking limitation, and `SKIP` records an intentional non-applicable check. Any `FAIL` causes a non-zero exit code; warnings and skips alone do not.

The current raw outputs remain available only behind an explicit diagnostic option with known secret redaction rules, rather than becoming the normal report contract.

Alternative considered: parse only shell exit codes. This is rejected because the current GitNexus false green demonstrates that exit code alone is insufficient.

### Probe matrix reuses fixed local commands without mutation

The doctor will check the Node/npm runtime, Git repository/worktree, OpenSpec, GitHub Project visibility, GitNexus, CodeGraph, harness parity, active MCP smoke, and Expo compatibility. It runs existing individual checks where they already express the contract, preserving them as independently runnable commands.

- GitNexus output is classified as `FAIL` whenever it contains a repository, FTS, query, or other configured semantic error signature, even if the child exit code is zero. Its remediation points to the separate approved repair command and is never invoked by the doctor.
- CodeGraph is checked independently as the documented fallback; a passing CodeGraph result is reported but does not mask a failed GitNexus primary check.
- OAuth-only remote MCP entries are `WARN` with text that their configuration/transport is present but authentication must be completed by a capable MCP client. They are never presented as authenticated `PASS`.
- Expo compatibility uses the installed Expo CLI with a non-mutating compatibility check (for example `npm exec --yes=false -- expo install --check`), never an implicit `npx` download or `@latest` request.

Alternative considered: add an unpinned `expo-doctor` invocation. It is rejected because the current repository has no local `expo-doctor` dependency and an implicit network download would violate the deterministic, no-`@latest` route.

### Graphify is an explicit retired/manual skip

The manifest owns one `SKIP` record for Graphify with the fixed reason `retirado/manual`. The doctor does not search PATH, start a server, inspect `graphify-out/`, or offer installation/remediation for it. Existing MCP parity remains responsible for failing a configuration that accidentally reintroduces Graphify as an active server.

Alternative considered: omit Graphify from the report entirely. An explicit skip better prevents agents from treating its absence as an accidental failure while preserving the decision from #51 in the readiness evidence.

### Fixture-driven coverage and advisory rollout

Unit tests will inject successful and degraded command outcomes, including zero-exit semantic GitNexus failure, missing command, inaccessible Project, OAuth-only remote MCP, and Graphify retirement. An integration smoke runs the doctor against the current checkout after the individual commands pass. Initial CI use remains advisory until its false-positive rate is demonstrated; it does not replace established required checks.

## Risks / Trade-offs

- [Remote MCP availability can be intermittent] → Keep remote transport/auth limitations as explicit warnings where the configured contract permits, and retain the underlying `mcp:test` evidence.
- [Command output changes upstream] → Centralize semantic signatures, test them with fixtures, and report unknown non-zero results with captured normalized context rather than guessing success.
- [A doctor could become a slow monolith] → Reuse bounded existing commands, retain individual commands for focused repair, and record durations per check.
- [GitHub CLI scope differs by machine] → Treat missing Project visibility as an actionable failure with the documented `gh auth refresh` recovery, without exposing tokens.
- [Graphify policy drifts] → Keep the explicit retired skip and rely on existing parity validation to fail active reintroduction.

## Migration Plan

1. Add the manifest, Node runner, npm command, fixtures/tests, and operational documentation without removing existing checks.
2. Run the new doctor alongside `openspec:check`, harness parity, MCP parity/smoke, and GitNexus tests in local evidence and advisory CI.
3. Verify current-checkout output, including the known GitNexus semantic failure and Graphify skip, then link evidence to issue #52.
4. Promote only after review of any environment-specific false positives; rollback by removing the new command, manifest, tests, and docs while leaving all existing checks intact.

## Open Questions

None. The doctor deliberately reports current readiness rather than repairing the GitNexus condition; any repair is a follow-up action under the existing GitNexus workflow.
