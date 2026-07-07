## 1. Product OS And Baseline Setup

- [ ] 1.1 Confirm GitHub issue #38 is in PlanearIA Product OS and link it in all final evidence.
- [ ] 1.2 Run the current React Doctor baseline and record total, excluded-folder, and product-only counts.
- [ ] 1.3 Update `doctor.config.json` and React Doctor workflow scope to exclude non-product folders.
- [ ] 1.4 Re-run React Doctor and confirm top errors no longer come from `dist/**`, `.claude/worktrees/**`, or `context/referencias-opensource/**`.

## 2. Frontend Public Env Boundary

- [ ] 2.1 Trace all frontend references to `EXPO_PUBLIC_API_SECRET` and `X-API-Key` call sites.
- [ ] 2.2 Update frontend config and API client behavior so authenticated user calls rely on JWT, not a public secret.
- [ ] 2.3 Adjust backend compatibility only where needed so JWT remains sufficient for normal authenticated user operations.
- [ ] 2.4 Remove or rebuild stale `dist/**` artifacts and document rotation/pending rotation for any exposed secret.

## 3. Safe HTML Export Sinks

- [ ] 3.1 Add a shared HTML escaping/sanitization helper using the smallest safe dependency surface.
- [ ] 3.2 Migrate alumno export HTML generation to the helper.
- [ ] 3.3 Migrate grupo export HTML generation to the helper.
- [ ] 3.4 Migrate reportes export HTML generation to the helper.
- [ ] 3.5 Add focused tests with script-like and HTML-like dynamic values.

## 4. Dependency Risk Decision

- [ ] 4.1 Locate every product usage of `pdfjs-dist` and confirm whether it is still required.
- [ ] 4.2 Choose and document one path: migrate, replace, pin/accept risk, or defer with owner/review date.
- [ ] 4.3 Validate affected PDF import/export behavior after the decision.

## 5. Validation And Evidence

- [ ] 5.1 Run `npm run typecheck`.
- [ ] 5.2 Run `npm run lint -- --quiet`.
- [ ] 5.3 Run `npm run backend:check` if backend/API contract changes.
- [ ] 5.4 Run affected export/auth/sync tests.
- [ ] 5.5 Run `npm run doctor -- --verbose --no-score` and record final product findings.
- [ ] 5.6 Record any React Doctor license/CI policy limitation before enabling a blocking gate.
- [ ] 5.7 Update GitHub issue #38 with OpenSpec path, validation evidence, and remaining follow-ups.
