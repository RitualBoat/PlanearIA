# Universal Engineering Operating System

This repository is in the environment-bootstrap stage. Prepare governance and evidence before asking what
product will be built. Do not select a framework, database, cloud provider, architecture pattern, or
product dependency during this stage.

## Required sequence

1. Bootstrap the universal core and run the read-only doctor.
2. Complete manual repository, GitHub Project, permission, and secret gates.
3. Verify harness parity with `sync --check`.
4. Start product discovery only after the bootstrap evidence is accepted.
5. Compare technical options only after discovery is approved.
6. Record the selected technical profile as a versioned decision before installing product dependencies.
7. Start product code through a complete SDD change.

## SDD flow

Non-trivial repository changes follow:

```text
issue -> enrich -> DoR -> propose -> apply -> QA -> adversarial review
-> DoD -> archive/sync -> PR/CI/merge -> issue close
```

- Create or reuse the issue and Project item before proposing.
- Preserve the original issue text and append an enriched section.
- Run `npm run sdd:ready:propose -- --issue <number>` before creating change artifacts.
- Keep one large change active at a time.
- Use local, exactly pinned OpenSpec; never fall back to a global or floating CLI.
- Requirements use SHALL and scenarios use WHEN/THEN.
- Every versionable change includes a concise TLDR, a bounded brownfield baseline, tasks, readiness
  metadata, expected evidence, rollback, risks, dependencies, and non-goals.
- Mark a task complete only when its evidence exists.
- Run `npm run sdd:ready:archive -- --change <kebab-case> --run-local` before archive.
- Archive with the local OpenSpec owner, then close through a pull request. Missing checks are not success.

Manual interviews, OAuth consent, cost approvals, branch protection, and irreversible decisions are
traceable gates. They are not fictitious OpenSpec changes unless they produce versioned repository output.

## Sources of truth

Use this precedence and report contradictions instead of resolving them silently:

1. Current code, runtime behavior, and passing tests describe the real state.
2. Active specs describe expected behavior.
3. `AGENTS.md`, `.project-os/`, and local OpenSpec configuration describe operating rules.
4. The GitHub Project describes daily execution state.
5. CI runs provide automatic evidence.
6. Issues, pull requests, captures, reports, and approvals provide manual evidence.
7. Archived changes provide history; they are not automatically current policy.

See `docs/engineering/SOURCES_OF_TRUTH.md`.

## Working modes

- **NORMAL:** use for architecture, scope, product, risk, maintenance, evidence, and trade-off decisions.
- **CAVEMAN:** use only after design/spec approval for mechanical file generation, imports, fixtures,
  defined tests, lint/type corrections, validations, and checkbox updates.

If a new decision appears during CAVEMAN, return to NORMAL and update the approved artifacts first.

## Safety and evidence

- Read before writing; preserve unrelated work and stop on overlapping changes.
- Never publish secrets or print secret values. Refer to environment variables by name.
- Do not buy services, accept licenses, enable paid features, or weaken branch protection automatically.
- Do not repair, authenticate, install, update, reindex, or start services from the doctor.
- Treat scanners as investigation signals, not authorization to mutate or delete.
- Do not auto-delete dead code.
- Unexpected warnings and logs are test evidence and must be classified.
- Keep rollback concrete and proportional to the change.
- Use `PASS`, `FAIL`, `WARN`, and `SKIP` precisely. `SKIP` never means a check passed.

## Context engineering

Start from `docs/engineering/README.md`. Prefer the smallest authoritative
context and keep critical documents within two links of `README.md` and `AGENTS.md`. Use structural code
intelligence for architecture and impact when it is healthy, line-level tools only when needed, and direct
reads for documentation and generated files.

## Universal architecture guidance

Use lightweight strategic domain modeling only when product discovery justifies it: glossary, bounded
contexts, entity owners, invariants, and contracts between contexts. Do not infer distributed services,
command/query separation, event streams, or any other implementation pattern from that modeling.

Conditional profiles remain inactive until an approved technical decision enables them.
