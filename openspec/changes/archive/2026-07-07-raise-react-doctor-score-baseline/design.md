## Context

Issue #38 is the Product OS source for this change. The first React Doctor remediation fixed the previous top findings, but the full scanner output still mixes three different things: product code, generated/local artifacts, and external reference code kept for research. That makes the score noisy and encourages work on files that will not ship.

This change prepares the repo for the active UX/UI Global plan by making the quality baseline honest. The implementation should fix security-sensitive product findings and document the remaining risk, not refactor legacy UI that is scheduled for redesign.

## Goals / Non-Goals

**Goals:**

- Make React Doctor's baseline reflect PlanearIA product source.
- Keep GitHub Product OS as the operational source before OpenSpec artifacts.
- Remove secret-like public Expo configuration from frontend behavior.
- Escape/sanitize dynamic values before HTML export sinks.
- Decide the `pdfjs-dist` supply-chain finding with evidence.
- Keep React Doctor advisory until the baseline is reliable.

**Non-Goals:**

- No broad rewrite of legacy screens.
- No mass cleanup of all React Doctor warnings.
- No new paid tooling or infrastructure.
- No SQLite activation or storage migration.
- No UI redesign.

## Decisions

1. Product OS is a hard precondition for SDD.

   The change starts from GitHub issue #38, already added to PlanearIA Product OS. This prevents local OpenSpec artifacts from becoming orphaned planning work. AGENTS, CLAUDE, and the meta guide are updated so future agents do not treat this as optional.

2. Scope the scanner before fixing counts.

   `dist/**`, `.claude/worktrees/**`, and `context/referencias-opensource/**` should be ignored by React Doctor because they are generated output, local working copies, or upstream reference code. This preserves those folders for their real purpose without asking React Doctor to grade them as product source.

3. Treat public Expo env vars as public.

   `EXPO_PUBLIC_*` values are inlined into client bundles. Frontend code must not depend on `EXPO_PUBLIC_API_SECRET` as a secret. Normal authenticated calls should be authorized by JWT and backend `userId` isolation. Any remaining compatibility value must be named and documented as non-secret.

4. Escape dynamic export data at the sink boundary.

   Export services can still produce HTML, but every dynamic text value must pass through a shared escape/sanitize helper close to the HTML sink. This keeps export behavior local-first and avoids inventing new dependencies unless the implementation needs constrained markup sanitization.

5. Decide `pdfjs-dist`, do not silently suppress it.

   The current finding is supply-chain score, not a confirmed vulnerability. The implementation should investigate whether `pdfjs-dist` is still required in product flows, then either migrate, replace, pin/accept risk with rationale, or defer with an owner and review date.

## Risks / Trade-offs

- Exclusions can hide real code if future product imports from reference folders. Mitigation: keep exclusions narrow and do not import product code from `context/referencias-opensource/**`.
- Removing public API secret usage can expose backend assumptions. Mitigation: validate JWT-only authenticated flows and keep server-side privileged paths separate.
- Escaping HTML can change export formatting if applied to trusted markup. Mitigation: escape text by default and only allow limited markup through a named sanitizer.
- Replacing `pdfjs-dist` can break PDF import. Mitigation: make the dependency decision before removal and run affected import/export checks.
- React Doctor license warnings may affect CI policy. Mitigation: keep CI advisory until usage is explicitly acceptable for the project.

## Migration Plan

1. Confirm issue #38 is in Product OS and record it in the OpenSpec artifacts.
2. Update React Doctor config and workflow scope.
3. Run React Doctor before/after and record product vs excluded counts.
4. Remove frontend secret-like env usage and validate JWT-backed calls.
5. Remove or rebuild stale `dist/**` artifacts and document rotation status.
6. Add shared HTML escape/sanitize helpers and migrate export services with tests.
7. Investigate and decide `pdfjs-dist`.
8. Run typecheck, lint, backend check if API contract changes, affected tests, and final React Doctor.

Rollback is scoped by file group: scanner config, public env cleanup, HTML helper, and dependency decision can be reverted independently if validation shows a regression.

## Open Questions

- Should backend remove public API-key compatibility completely in this change, or keep a documented non-secret demo path for one release?
- Is PDF extraction needed in the hosted demo now, or can it move to a backend/Office boundary later?
- Should React Doctor CI remain installed if license approval is required for AI/ML pipeline usage?
