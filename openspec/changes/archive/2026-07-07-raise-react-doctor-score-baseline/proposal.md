## Why

React Doctor still reports a large issue count after the first remediation pass, but the baseline is distorted by generated output, local worktrees, and third-party reference code that is not part of PlanearIA product source. The remaining product findings include real security/configuration risks that should be resolved before UX/UI Global builds the teacher suite on top of this code.

GitHub Product OS source: RitualBoat/PlanearIA#38.

## What Changes

- Configure React Doctor so product scans exclude non-product folders: `dist/**`, `.claude/worktrees/**`, `context/referencias-opensource/**`, local virtualenvs, and caches.
- Record before/after React Doctor counts for total findings, excluded-folder findings, and remaining product findings.
- Remove frontend reliance on `EXPO_PUBLIC_API_SECRET` as a secret-like public value; authenticated user calls should rely on JWT, while privileged API secrets remain server-side or explicitly documented as non-secret demo compatibility.
- Remove or rebuild stale generated web artifacts after public env cleanup and document any required secret rotation or pending rotation.
- Centralize safe HTML escaping/sanitization for export and print flows before dynamic values reach HTML sinks.
- Decide the `pdfjs-dist` supply-chain finding explicitly: migrate, replace, pin/accept with evidence, or defer with owner and review date.
- Keep React Doctor advisory until the product baseline is trustworthy enough to gate only new real product errors.

## Capabilities

### New Capabilities

- `react-doctor-scan-baseline`: React Doctor scans distinguish product source from generated, local, and reference-only folders.
- `frontend-public-env-boundary`: Frontend configuration no longer treats public Expo variables as secrets or privileged credentials.
- `safe-html-export-sinks`: Export and print HTML flows escape or sanitize dynamic data before writing HTML.
- `dependency-risk-decision`: Low supply-chain score dependencies such as `pdfjs-dist` have an explicit decision with validation evidence.

### Modified Capabilities

- None.

## Impact

- Affected tooling/CI: `doctor.config.json`, `.github/workflows/react-doctor.yml`, `.gitignore`, `package.json`, `package-lock.json`.
- Affected frontend config/API paths: `src/sync/config/apiConfig.ts`, `src/utils/apiClient.ts`, `src/services/auth/authService.ts`, `src/services/copilotoService.ts`, `src/hooks/useCrearPlaneacionViewModel.ts`, and any call site sending a public API key header.
- Affected backend/API contract: routes that still require `X-API-Key` for authenticated user calls may need JWT-only acceptance without weakening server-side privileged paths.
- Affected exports: `src/services/alumnoExportService.ts`, `src/services/grupoExportService.ts`, `src/services/reportesExportService.ts`, and any shared export helper introduced.
- Affected generated artifacts: `dist/**` should not be committed or scanned as source and must not preserve stale leaked env names.
- Plan reference: this stabilizes quality/security before `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`; it does not implement the suite redesign.

## No objetivos

- No fix every React Doctor warning in legacy screens.
- No mass migration of navigation, Touchable/Pressable, giant components, Reanimated, or performance warnings unless they block scoped security/baseline work.
- No visual redesign or UX/UI Global implementation.
- No SQLite activation, storage migration, or deletion of legacy `@planearia:*` keys.
- No paid scanners, microservices, or new infrastructure.
- No suppression of real product security findings without a written risk decision.
