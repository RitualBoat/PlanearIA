## Why

React Doctor found security, performance, React Native, and maintainability issues in the current PlanearIA codebase, and a refactor review surfaced a pre-existing alumno import data-loss bug. Fixing the highest-impact root causes now reduces risk in CI/backend code and prevents teachers from silently losing imported student rows.

## What Changes

- Harden the CD workflow so dependency lifecycle scripts do not run in the same boundary where deployment/signing secrets are available.
- Remove hardcoded secret fallbacks in backend helpers and fail closed or disable the dependent capability when required secrets are absent.
- Replace unsafe request-body spreads in notification creation with explicit allowlisted fields.
- Replace direct React Native `Image` and `Animated` imports flagged by React Doctor with the recommended Expo/Reanimated equivalents where the project already supports them.
- Replace flagged barrel imports with direct imports.
- Split deeply nested JSX/provider composition and the large alumno import screen into focused components without changing user-facing navigation or data flow.
- Add a batch alumno import path so importing multiple valid rows persists every row exactly once.
- Track the work through GitHub issue #37 and this OpenSpec change.

## Capabilities

### New Capabilities

- `secure-react-doctor-remediation`: Security-sensitive React Doctor findings are validated against official rule guidance and fixed at the root cause instead of being suppressed.
- `react-native-react-doctor-remediation`: React Native and maintainability findings from the current top React Doctor pass are remediated with direct imports, UI-thread animation, cached images, and smaller render units.
- `alumno-import-integrity`: Multi-row alumno import persists all valid rows and avoids stale state overwrites during batch import.

### Modified Capabilities

- None.

## Impact

- Affected workflow: `.github/workflows/cd.yml`.
- Affected backend: `backend/lib/aiUsageLimiter.js`, `backend/lib/resetCodes.js`, `backend/routes/notificaciones.js`.
- Affected frontend/app shell: `App.tsx`, `src/components/PostCard.tsx`, `src/components/grupos/ColaboradorListItem.tsx`, `src/components/social/ModalSelectorContactos.tsx`, `src/components/Toast.tsx`, `src/screens/alumnos/ImportarAlumnosScreen.tsx`.
- Affected alumno data flow: `src/context/AlumnosContext.tsx`, `src/hooks/useImportarAlumnosViewModel.ts`, alumno tests.
- Possible dependency/config impact: `expo-image` and `react-native-reanimated` are checked before use; no paid infrastructure or stack rewrite.
- Plan reference: this is a quality/security stabilization change that supports the active UX/UI Navigation plan by reducing legacy component debt, but it does not implement a visual redesign.

## No objetivos

- No migrate all remaining React Doctor findings in the 597/632-issue full reports during this pass.
- No perform the 75-file Touchable-to-Pressable migration without explicit code-owner sign-off.
- No activate SQLite, change storage defaults, or delete legacy `@planearia:*` keys.
- No change AI provider behavior beyond safe secret/config handling.
- No redesign the alumno import UX beyond focused component extraction needed for maintainability.
