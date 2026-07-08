---
name: best-practices
description: Review or improve PlanearIA code quality, security, architecture, Expo/React Native practices, data isolation, environment handling, or maintainability.
---

# PlanearIA Best Practices

## Architecture

- Respect MVVM: screens are thin, hooks are ViewModels, Context shares state, services/repositories own I/O.
- Keep the app a modular monolith unless the user explicitly asks for a different architecture.
- Do not add expensive infrastructure for a solo student project without clear tradeoffs.
- Prefer existing helpers and project patterns over new abstractions.

## Security

- Never commit secrets.
- Frontend reads only public Expo variables.
- Provider AI keys live only in backend environment variables.
- Auth tokens use SecureStore on native and the documented web fallback.
- Backend endpoints must filter by `userId`.

## Data

- Syncable academic data goes through `src/sync`.
- Do not activate SQLite as default without approval.
- Do not delete legacy AsyncStorage keys without migration and rollback.

## Frontend

- Use `src/themes/colors.ts` and existing responsive utilities.
- Preserve ThemeContext, FontSizeContext and DaltonismoContext.
- Handle loading, empty, error and offline states.
- Avoid dead buttons and decorative-only screens.

## Backend

- Use `backend/api/index.js` router shape and `backend/routes`.
- Create MongoDB indexes with idempotent `createIndex`.
- Keep AI calls behind `backend/lib/aiGateway.js` or a compatible backend wrapper.

## Validation

Run the smallest meaningful set of checks, then broaden if the change touches shared behavior.
