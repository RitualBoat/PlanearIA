## Context

Issue #40 asks whether PlanearIA should migrate from CodeGraph to GitNexus, keep both with strict responsibilities, or remove CodeGraph. The current repository already has `.codegraph/` and several active docs that say CodeGraph is the first tool for structural code questions, including SDD propose/apply and the UX/UI plan's D15 anti-hallucination rule.

GitNexus is not installed or proven in PlanearIA. Its public docs describe local CLI/MCP usage, knowledge-graph indexing, call chains, impact analysis, status/clean/wiki commands, and local privacy. Those claims are useful hypotheses, not enough to change the repo's agent contract.

This change is therefore a spike/ADR with implementation follow-through: evaluate both tools on the same PlanearIA questions, decide a policy, and update documentation so future agents do not mix tools by guesswork.

## Goals / Non-Goals

**Goals:**

- Produce evidence from real PlanearIA queries before changing tool priority.
- Compare CodeGraph and GitNexus on MVVM, backend/AI, sync/offline, UX/UI, and blast-radius scenarios.
- Decide one final policy: GitNexus primary, CodeGraph primary, dual-tool routing, or fallback-only.
- Document operational commands, update cadence, freshness checks, and cleanup for GitNexus if adopted.
- Update all active agent/SDD docs that currently hardcode CodeGraph-first behavior.
- Leave a validation report that a future agent can inspect without repeating the entire investigation.

**Non-Goals:**

- No app runtime feature work.
- No UI or visual QA; this is documentation/tooling flow work.
- No paid GitNexus enterprise/SaaS adoption.
- No publishing PlanearIA code or indexes to external registries.
- No destructive removal of CodeGraph without evidence and a documented rollback/fallback path.

## Decisions

### Decision 1: Treat GitNexus as a candidate, not as the default.

Rationale: CodeGraph is already wired into the repo and the project documentation. A direct migration would create churn without proof. The first implementation step must therefore be a controlled trial that can be rolled back by removing local GitNexus artifacts and leaving CodeGraph untouched.

Alternatives considered:

- Immediate migration: rejected because GitNexus is untested here.
- Keep CodeGraph without investigation: rejected because there is no evidence it is producing the expected token or precision benefits.
- Use both without policy: rejected because it can increase context noise and confuse agents.

### Decision 2: Use paired queries as the core measurement method.

The same questions must be asked of CodeGraph and GitNexus. Each row records command/prompt, output usefulness, missing context, irrelevant context, time, follow-up file reads, and whether the answer helped a future agent act safely.

Required query groups:

- MVVM flow: screen -> hook/ViewModel -> service/repository.
- Shared hook blast radius.
- Backend/AI gateway or provider path.
- Sync/offline path through `src/sync`.
- UX/UI active-plan path where D15 currently says CodeGraph first.

This gives enough coverage to test the user's hypothesis that GitNexus may fit MVVM better.

### Decision 3: Keep the final policy narrow and operational.

The final docs must say exactly when to use each tool. Acceptable outcomes:

- GitNexus primary, CodeGraph removed or fallback.
- CodeGraph primary, GitNexus discarded.
- GitNexus for dependency/call-chain/impact questions and CodeGraph for indexed source snippets/blast-radius where it performs better.
- CodeGraph for fast local source exploration and GitNexus for wider architectural maps, only if the evidence supports that split.

No doc should leave both tools as vague "useful MCPs" without ordering and examples.

### Decision 4: Document GitNexus lifecycle only if GitNexus survives the evaluation.

If adopted, docs must cover:

- install/setup command;
- analyze/reindex command;
- status/freshness command;
- clean/uninstall/rollback command;
- wiki/serve commands only if useful for PlanearIA;
- which artifacts are local, gitignored, or excluded from commits;
- when agents should rerun indexing after moves/renames.

If discarded, docs must explain why, so future agents do not reopen the same question without new evidence.

## Risks / Trade-offs

- GitNexus installation may create local MCP or skill files that change user environment -> run setup cautiously, record generated paths, and avoid committing local/generated artifacts unless intentionally documented.
- GitNexus may work well in marketing examples but poorly in PlanearIA on Windows -> treat Windows failures as evidence, not as automatic rejection if a documented fix is simple.
- CodeGraph and GitNexus together may increase token use -> explicitly test dual-tool prompts and reject fallback if it causes context duplication.
- Token savings are hard to measure exactly -> use proxies: number of tool calls, file reads avoided, irrelevant files returned, output size, and first-pass usefulness.
- Existing docs may conflict after the decision -> update every known CodeGraph-first mention in one pass and validate with `rg`.

## Migration Plan

1. Record baseline CodeGraph state and current CodeGraph-first documentation references.
2. Install or trial GitNexus in a controlled local-only way.
3. Run paired evaluation queries and store results in a validation report under `Documentacion/03-validacion/evaluate-gitnexus-codegraph-sdd/`.
4. Decide the final policy and document rationale in the validation report.
5. Update affected docs and issue #40 with the policy summary.
6. Validate docs with `rg` for stale/contradictory mentions and `openspec validate`.
7. If GitNexus is rejected, remove local trial artifacts when safe and document the rollback.

## Open Questions

- Does GitNexus install and index cleanly on this Windows machine without breaking the Codex/Claude setup?
- Does its MCP expose useful enough tools in this environment, or is only the CLI practical?
- Does dual-tool fallback improve reliability or contaminate context?
- Which final docs should remain tool-agnostic and which should include specific command examples?
