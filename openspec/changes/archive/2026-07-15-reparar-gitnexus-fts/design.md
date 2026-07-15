## Context

PlanearIA has adopted GitNexus as the primary structural code-intelligence path and CodeGraph as the fallback for line-numbered source and failed or ambiguous GitNexus results. The local GitNexus index reports the current commit (`dfcd32d` at exploration time), yet GitNexus 1.6.9 on Node 26.4.0 emits an unavailable-FTS-extension warning and returns no useful results for a structural query. An UID-disambiguated `impact` still works, proving that index freshness alone is not an adequate health signal.

The index is local ignored state in `.gitnexus/`; GitNexus commands run through `npx -y gitnexus@latest` today, so the normal path is both version-drifting and unable to distinguish healthy metadata from a usable search path. This is tooling-only work for issue #50, under the Readiness master plan.

## Goals / Non-Goals

**Goals:**

- Establish a deterministic GitNexus health contract covering index freshness, FTS availability, a known MVVM query, and an UID-disambiguated impact result.
- Repair only the local generated index with `--repair-fts --index-only`, keeping agent files, skills, application source, and user data untouched.
- Use one approved, exact GitNexus invocation for repair and verification after it passes the contract on the supported runtime.
- Preserve CodeGraph as an explicit fallback and capture sufficient evidence to diagnose a failed repair later.

**Non-Goals:**

- Change product screens, MVVM architecture, API contracts, sync, authentication, AI, SQLite, or academic data.
- Run `gitnexus setup`, inject agent instructions, or modify global settings as part of repair.
- Repair Graphify or implement the multi-tool harness doctor.
- Silently replace GitNexus with CodeGraph as the primary tool.

## Decisions

### 1. Verify capability, not only index metadata

The verifier SHALL treat the tool as healthy only when all of these succeed: freshness/status, no FTS-degraded diagnostic, a known MVVM query with relevant definitions, and an exact `impact --uid` result. `status` alone is insufficient because it currently reports success while query FTS is unavailable.

The known impact fixture is the function UID `Function:src/hooks/useCrearPlaneacionViewModel.ts:useCrearPlaneacionViewModel`, which resolves to `CrearPlaneacionScreen`. A UID avoids the observed Function/Const ambiguity.

Alternative considered: check only the timestamp and indexed commit. Rejected because it cannot detect the current false-green state.

### 2. Keep repair explicit, local, and index-only

The implementation SHALL expose separate diagnostic, repair, and verification commands. The repair command uses `analyze --repair-fts --index-only` with the PlanearIA repository alias/path. It is allowed to regenerate ignored `.gitnexus/` data but must fail if it would leave tracked agent instructions or skills changed.

Alternative considered: run `gitnexus setup` or a full default analysis. Rejected because setup may inject agent context and the repository policy requires a pure index path.

### 3. Pin the executable only after a passing compatibility probe

The current `@latest` invocation is not a reproducible contract. During apply, the implementation SHALL probe an exact candidate release on the active Node runtime, run the full health contract after repair, and only then record that exact release in the repository command/wrapper. The chosen version and Node version become part of the evidence.

Alternative considered: hard-code 1.6.9 now. Rejected because that version is the one producing the FTS warning in the observed environment. Alternative: keep `@latest`. Rejected because it makes the repair result non-reproducible.

### 4. Fail visibly and use CodeGraph only as a fallback

If repair cannot provide FTS on the approved runtime, verification SHALL fail with the captured diagnostic and the Project item must be marked `Blocked`; the workflow may use CodeGraph for the immediate source need, but it must not claim that GitNexus is healthy or rewrite the repository policy automatically.

Alternative considered: silently fall back and pass the health check. Rejected because it hides the broken primary route and prevents a later reproducible fix.

### 5. Update generated instructions at their source

If official commands change, the implementation SHALL modify `.agents/instructions/core.md` and regenerate/check its harness mirrors rather than editing `AGENTS.md`, `CLAUDE.md`, or Copilot instructions independently.

Alternative considered: patch each generated document. Rejected because it reintroduces harness drift.

## Risks / Trade-offs

- [The FTS failure is a CLI/native-runtime compatibility problem rather than corrupt index data] → Record CLI/Node versions before every probe; do not select a release until repair and verification pass together.
- [Repair modifies or deletes the local index] → Keep it constrained to ignored `.gitnexus/`, document official cleanup/reindex commands, and never touch application or academic data.
- [A known query becomes stale after future refactors] → Keep its fixture in one verifier location and require a maintenance update whenever its source symbol moves.
- [Generated instructions drift after command changes] → Run `npm run agent:harness:sync` and `npm run agent:harness:check` as part of implementation validation.
- [CodeGraph masks the outage] → Make failed GitNexus verification non-zero and require an explicit Project `Blocked` transition if repair cannot succeed.

## Migration Plan

1. Capture the current CLI/Node versions, `status`, FTS diagnostic, query result, and UID impact result in validation evidence.
2. Add the versioned command/wrapper and a smoke or automated verification of its parsing/exit behavior.
3. Run the explicit local FTS repair with `--index-only`; record all output and confirm no tracked agent-file injection.
4. Run the full health contract, then update source instructions and regenerate mirrors only if the official command changes.
5. Commit tooling/docs/evidence on the change branch and use the normal OpenSpec QA/archive flow.

Rollback: revert the tracked command, documentation, and test changes as one commit; for generated local state, use the documented GitNexus cleanup command and rebuild only after the approved environment is restored. No application data migration or backend rollback is required.

## Open Questions

- Which exact GitNexus release, if any, provides FTS support on the approved Node runtime? The answer must be proven by the post-repair contract during apply, not assumed from package metadata.
- If no supported release passes, should the user approve a compatible local Node runtime or temporarily declare CodeGraph primary? This requires an explicit decision rather than an automatic policy change.
