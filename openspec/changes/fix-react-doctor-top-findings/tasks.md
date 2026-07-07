## 1. Baseline And Rule Confirmation

- [x] 1.1 Record the React Doctor rule recipes fetched with no-cache curl and note any official-doc gaps.
- [x] 1.2 Inspect the current workspace versions of the flagged files and preserve unrelated local changes.

## 2. Security Remediation

- [x] 2.1 Harden `.github/workflows/cd.yml` so dependency install runs with scripts disabled before any secret-bearing step.
- [x] 2.2 Remove hardcoded secret fallbacks from `backend/lib/aiUsageLimiter.js` and `backend/lib/resetCodes.js`.
- [x] 2.3 Replace request body spreading in `backend/routes/notificaciones.js` with explicit allowlisted fields.

## 3. React Native And Maintainability Remediation

- [x] 3.1 Install/configure required supported dependencies for official fixes (`expo-image`, Reanimated Babel plugin).
- [x] 3.2 Replace flagged React Native `Image` imports with `expo-image`.
- [x] 3.3 Replace `Toast` JS-thread `Animated` usage with Reanimated shared values and animated styles.
- [x] 3.4 Replace flagged relative barrel imports with direct imports.
- [x] 3.5 Extract `App.tsx` provider/navigation nesting into named render components.
- [x] 3.6 Split `ImportarAlumnosScreen` into focused render sections without changing the ViewModel contract.

## 4. Alumno Import Integrity

- [x] 4.1 Add a batch alumno creation method to `AlumnosContext` that persists all new alumnos in one coherent update and queues sync per alumno.
- [x] 4.2 Update the alumno import flow to use the batch method for valid selected rows.
- [x] 4.3 Add or update alumno import tests to prove multiple valid rows are all persisted.

## 5. Validation And Evidence

- [x] 5.1 Run the affected alumno tests.
- [x] 5.2 Run backend/static checks affected by security changes.
- [x] 5.3 Run `npm run typecheck`.
- [x] 5.4 Run `npm run lint -- --quiet`.
- [x] 5.5 Run `npx react-doctor@latest --verbose` and confirm the touched top issues are gone or record the exact license/tool blocker.
- [x] 5.6 Perform a focused UI smoke check for the changed React Native screens/components, or document why visual validation could not run in this environment.
- [x] 5.7 Update GitHub issue #37 with OpenSpec path, validation evidence, and any follow-up items.
