---
name: testing
description: Write, update, or run PlanearIA tests for hooks/ViewModels, Context, services, sync, backend routes, or React Native components. Use when changing functional code, fixing CI, or designing test strategy.
---

# Testing For PlanearIA

## Baseline

- Jest + Testing Library for React Native.
- Tests live mainly in `src/__tests__/`.
- Typecheck, lint and backend smoke are part of validation.

## Commands

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

On Windows, add this if Jest scans outside the repo:

```bash
--rootDir c:\Users\jarco\dev\PlanearIA
```

## What To Test

- Hooks/ViewModels: derived state, commands, edge cases.
- Contexts: state transitions and persistence calls.
- Services: network/storage errors, retries, auth headers.
- Sync: offline queueing, reconnect flush, conflicts, `userId` isolation.
- Components: visible states and user interactions.

Add tests when touching auth, sync, backend routes, shared hooks, shared services or user-visible flows.
