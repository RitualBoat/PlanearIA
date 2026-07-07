## Evidence

Date: 2026-07-07

Product OS source: https://github.com/RitualBoat/PlanearIA/issues/38

### Product OS

- `gh issue view 38 --repo RitualBoat/PlanearIA --json url,title,number,state,projectItems`
- Result: issue #38 is open, titled `raise-react-doctor-score-baseline`, and is in `PlanearIA Product OS` with status `Backlog`.

### React Doctor Baseline Before Scope Cleanup

- Command: `npm run doctor -- --json --no-score --max-duration 120 --yes`
- React Doctor version: 0.7.1
- Total diagnostics: 470
- Errors: 12
- Warnings: 458
- Excluded-folder diagnostics before cleanup: 9
- Excluded-folder breakdown:
  - `.claude/worktrees/**`: 8
  - `dist/**`: 1
- Product diagnostics before cleanup: 461
- Product errors before cleanup: 11

Top product rules before cleanup:

- `no-giant-component`: 32
- `js-combine-iterations`: 32
- `prefer-module-scope-pure-function`: 31
- `async-parallel`: 28
- `no-render-in-render`: 28
- `js-flatmap-filter`: 26
- `no-derived-state`: 22
- `no-react19-deprecated-apis`: 20
- `rn-no-non-native-navigator`: 19
- `async-await-in-loop`: 18
- `rn-no-scrollview-mapped-list`: 17
- `exhaustive-deps`: 14

React Doctor emitted its license warning about AI or ML pipeline use during local runs. React Doctor should remain advisory until project license policy is settled and the product baseline is trusted.

### React Doctor After Scope Cleanup

- Changed `doctor.config.json` to exclude:
  - `dist/**`
  - `**/dist/**`
  - `.claude/worktrees/**`
  - `context/referencias-opensource/**`
- Changed `.github/workflows/react-doctor.yml` to run advisory full scans with `blocking: none` and `scope: full`.
- Command: `npm run doctor -- --json --no-score --max-duration 120 --yes`
- Total diagnostics after scope cleanup: 461
- Errors after scope cleanup: 11
- Warnings after scope cleanup: 450
- Diagnostics still reported from excluded folders: 0

### Frontend Public Env Boundary

- Traced frontend/product references with:
  - `rg -n "EXPO_PUBLIC_API_SECRET|X-API-Key|apiSecret" src .github .env.example`
  - `rg -n "EXPO_PUBLIC_API_SECRET" .github .env.example`
- Removed frontend `EXPO_PUBLIC_API_SECRET` dependency from `src/sync/config/apiConfig.ts`.
- `isAPIConfigured()` now depends on a valid public API URL and native-localhost policy, not a public secret.
- Removed frontend `X-API-Key` emission from:
  - `src/utils/apiClient.ts`
  - `src/services/auth/authService.ts`
  - `src/hooks/useCrearPlaneacionViewModel.ts`
  - `src/hooks/useRecuperarContrasenaViewModel.ts`
  - `src/hooks/useAdminRolesViewModel.ts`
  - `src/context/MensajesContext.tsx`
- Updated affected tests so the IA generation flow expects `Authorization: Bearer jwt-test` and asserts the legacy API key header is absent.
- Backend compatibility: no functional backend change was required. `backend/lib/auth.js` already accepts a valid JWT as sufficient authority and keeps `X-API-Key` only as server-side/demo compatibility.
- Removed `EXPO_PUBLIC_API_SECRET` from `.env.example`, `.github/workflows/cd.yml`, and active local/deploy operation docs.
- Removed stale local generated `dist/**` artifacts after confirming `dist/` is untracked and ignored.
- Rotation note: any real value previously configured as `EXPO_PUBLIC_API_SECRET` in GitHub/Vercel should be considered exposed and rotated server-side before public beta.

### Safe HTML Export Sinks

- Added shared helper: `src/utils/htmlEscape.ts`.
- Replaced local duplicated escaping in:
  - `src/services/alumnoExportService.ts`
  - `src/services/grupoExportService.ts`
- Escaped previously raw dynamic values in `src/services/reportesExportService.ts`:
  - group report title metadata
  - alumno report title metadata
  - calificacion row period/status
  - alumno SVG title metadata
- Added focused tests in `src/__tests__/services/exportHtmlSafety.test.ts` covering script-like tags, HTML attributes, ampersands, and quotes.

### Dependency Risk Decision

- Located `pdfjs-dist` usage with CodeGraph and `rg`.
- Product path:
  - `src/screens/planeaciones/ImportarPlaneacionScreen.tsx`
  - `src/services/planeacionImportService.ts`
  - `src/services/pdfTextExtractor.ts`
- Native boundary: `src/services/pdfTextExtractor.native.ts` keeps `pdfjs-dist` out of Hermes and asks for DOCX on device.
- Decision file: `openspec/changes/raise-react-doctor-score-baseline/dependency-risk-decision.md`.
- Decision: keep temporarily, pin to exact `5.6.205`, accept tracked low-supply-chain-score risk, review by 2026-09-30.
- Added PDF route smoke coverage in `src/__tests__/planeaciones/planeacionImportService.test.ts`.

### Validation

- `npm run typecheck`: passed.
- `npm run lint -- --quiet`: passed.
- `npm run backend:check`: passed.
- Affected tests passed:
  - `src/__tests__/auth/authService.test.ts`
  - `src/__tests__/planeaciones/useCrearPlaneacionViewModel.test.tsx`
  - `src/__tests__/planeaciones/planeacionImportService.test.ts`
  - `src/__tests__/sync/syncEngine.test.ts`
  - `src/__tests__/sync/offlineSyncFlow.test.ts`
  - `src/__tests__/services/exportHtmlSafety.test.ts`
- Test result: 6 suites passed, 50 tests passed.
- Known test console noise: existing `act(...)` warnings in `useCrearPlaneacionViewModel` async template loading and intentional syncEngine error logs in retry/auth tests.

### React Doctor Final Product Baseline

- Command: `npm run doctor -- --json --verbose --no-score --max-duration 120 --yes`
- Total diagnostics: 453
- Errors: 11
- Warnings: 442
- Security diagnostics: 1
- `artifact-env-leak` / public env leak diagnostics: 0
- `dangerous-html-sink` diagnostics: 0
- Remaining security error: `pdfjs-dist@5.6.205` low supply-chain score, accepted and documented in `dependency-risk-decision.md`.

Remaining error rules:

- `no-adjust-state-on-prop-change`: 5
- `effect-needs-cleanup`: 4
- `no-effect-with-fresh-deps`: 1
- `low-supply-chain-score`: 1

React Doctor emitted its license warning about AI or ML pipeline use during local runs. CI remains advisory with `blocking: none`; do not enable a blocking gate until project license policy is settled.

### GitHub Issue Update

- Issue #38 evidence comment: https://github.com/RitualBoat/PlanearIA/issues/38#issuecomment-4902172376
