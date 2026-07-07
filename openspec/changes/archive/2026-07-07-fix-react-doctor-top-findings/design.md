## Context

React Doctor produced several reports for PlanearIA: a full-codebase/security pass, a changed-files pass against main, and a development-branch pass. The actionable top findings in this change touch CI, backend secret handling, backend request validation, React Native imports/animation, app provider composition, direct module imports, and alumno import persistence.

The workspace already contains many unrelated local modifications. This change will work with those edits and keep its implementation narrow. It will not clean the full 597/632 issue reports in one pass, and it will not perform the 75-file Touchable-to-Pressable migration without explicit approval.

GitHub tracking: RitualBoat/PlanearIA#37.

## Goals / Non-Goals

**Goals:**

- Fix the top React Doctor root causes that are applicable to the current workspace.
- Follow the official React Doctor rule guidance fetched with no-cache curl where available.
- Preserve PlanearIA MVVM and offline-first boundaries.
- Add a safe batch alumno import path that persists every valid row.
- Re-run React Doctor and focused checks before marking tasks complete.

**Non-Goals:**

- No broad rewrite of the app shell, screens, or backend routing.
- No mass migration of every remaining React Doctor warning.
- No SQLite activation, storage migration, or deletion of legacy keys.
- No paid services, microservices, or CI provider changes.
- No UI redesign beyond focused extraction for readability.

## Decisions

1. Harden CI by separating install from secret-bearing steps.

   React Doctor's `build-pipeline-secret-boundary` guidance says dependency install must run without secrets and with lifecycle scripts disabled. The CD workflow will use `npm ci --ignore-scripts` before Android build/deploy secrets are introduced, while later steps keep secrets scoped only to the commands that need them.

   Alternative considered: leaving install as-is because secrets are step scoped. Rejected because the rule detects install near secrets and the safer fix is explicit and low cost.

2. Fail closed for backend secret fallbacks.

   `aiUsageLimiter` and `resetCodes` must not use committed literal fallback values for secret environment variables. The fix will derive stable behavior from configured env vars only, and where a secret is required for a secure operation, the helper will throw or return an unavailable state instead of silently using a committed fallback.

   Alternative considered: replacing the fallback with a different placeholder. Rejected because any literal fallback keeps the same failure mode.

3. Allowlist request body fields in notification creation.

   `notificaciones` will construct persisted objects from named fields rather than spreading `req.body`. This preserves expected client input while blocking accidental or malicious fields such as ownership, role, or prototype keys.

   Alternative considered: sanitize after spreading. Rejected because explicit construction is clearer and matches the React Doctor recipe.

4. Use direct dependencies where React Doctor recommends them.

   `expo-image` is not currently in `package.json`, so the implementation will install it with `npx expo install expo-image` before changing the flagged imports. `react-native-reanimated` is already installed, but `babel.config.js` lacks the required plugin, so the plugin will be added last in the Babel plugins list before replacing `Animated` usage in `Toast`.

   Alternative considered: suppressing the image rule because this is Expo. Rejected because this is an Expo SDK 54 project and the dependency is compatible with the stack.

5. Extract components without changing behavior.

   For `App.tsx`, provider/navigation nesting will be lifted into named components so React Doctor measures a shallower JSX tree. For `ImportarAlumnosScreen`, visual sections will become focused local or sibling components while the hook remains the ViewModel.

   Alternative considered: only increasing the React Doctor depth/size threshold. Rejected because the files are legitimate readability pain points and the extraction is low risk.

6. Add a batch alumno context method.

   The import data-loss bug comes from repeated single-row persistence using a stale `alumnos` snapshot. A batch method will compute the next alumno array once, assign incremental ids, persist once, and queue sync for each new alumno. The import ViewModel will call that batch method instead of looping over `agregarAlumno`.

   Alternative considered: making `agregarAlumno` use functional state only. Rejected for the import flow because persistence and sync still need a single coherent batch write to avoid repeated stale storage writes.

## Risks / Trade-offs

- `expo-image` installation can update package lock data -> use Expo's installer and validate typecheck.
- Reanimated plugin ordering matters -> place `react-native-reanimated/plugin` last in `babel.config.js`.
- Secret fallback removal can expose missing local env config -> fail with clear errors or disabled behavior instead of silently using unsafe defaults.
- Batch import changes sync behavior from repeated writes to one write -> queue sync once per new alumno after local persistence so offline-first behavior remains intact.
- React Doctor CLI license/network may block execution in this environment -> run the real command; if the tool refuses due its license gate, record the exact output and validate with local checks.

## Migration Plan

1. Apply CI/backend fixes first because they are security-sensitive and independent.
2. Apply frontend React Doctor fixes with dependency/config changes.
3. Add alumno batch import and tests.
4. Run React Doctor and focused validation.
5. Update OpenSpec tasks and GitHub issue with evidence.

Rollback is file-level: each fix is scoped to its file group and can be reverted independently if validation shows a regression.

## Open Questions

- The official Markdown endpoints for `secret-in-fallback` and `request-body-mass-assignment` returned `Rule not found`; implementation will use the rule text embedded in the local React Doctor reports as the canonical local recipe for those two rules.

## React Doctor Rule Recipe Notes

- `build-pipeline-secret-boundary`: official Markdown fetched with no-cache curl. Real when dependency install appears near `secrets.*` without `--ignore-scripts`; fix with `npm ci --ignore-scripts` before secret-bearing steps.
- `rn-prefer-expo-image`: official Markdown fetched with no-cache curl. Real for named `Image` imports from `react-native`; fix by installing `expo-image` and importing `Image` from it.
- `rn-prefer-reanimated`: official Markdown fetched with no-cache curl. Real for named `Animated` imports from `react-native`; fix by using Reanimated shared values, `withTiming`, and animated styles with the Babel plugin configured.
- `no-giant-component`: official Markdown fetched with no-cache curl. Real for components over the heuristic line threshold; fix by extracting logical sections into focused components.
- `no-barrel-import`: official Markdown fetched with no-cache curl. Real for relative imports resolving to re-export-only index files; fix by importing from direct source files.
- `jsx-max-depth`: official Markdown fetched with no-cache curl. Real for deeply nested JSX; fix by lifting inner subtrees into named components, not merely local variables.
- `secret-in-fallback`: official Markdown endpoint returned `Rule not found`; local React Doctor report says to remove literal fallbacks and fail closed when the env var is unset.
- `request-body-mass-assignment`: official Markdown endpoint returned `Rule not found`; local React Doctor report says to assign explicit allowlisted fields or use a strict schema instead of spreading request input.
