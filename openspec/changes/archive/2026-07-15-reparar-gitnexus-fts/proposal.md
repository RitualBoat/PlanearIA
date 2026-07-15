## Why

GitNexus reports the PlanearIA index as current while its FTS extension is unavailable, so structural queries return no useful definitions even though `status` appears healthy. This breaks the repository's primary code-intelligence route at the point where agents need dependable MVVM and dependency evidence before editing.

The change comes from [GitHub issue #50](https://github.com/RitualBoat/PlanearIA/issues/50) in the `Readiness Ola 0` milestone and implements the focused GitNexus FTS item in `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`.

## What Changes

- Add a reproducible GitNexus index-health contract that distinguishes an up-to-date index from an FTS-capable query path.
- Provide a versioned, index-only repair and verification workflow that checks status, a known MVVM query, and an UID-disambiguated impact result without injecting agent files.
- Record the approved runtime/version, recovery procedure, and before/after evidence for the local ignored `.gitnexus/` index.
- Keep CodeGraph as the documented fallback when GitNexus is unavailable, ambiguous, stale, or fails its health contract.

## Capabilities

### New Capabilities

- `gitnexus-index-health`: Detect, repair, verify, and recover the local GitNexus FTS index before agents rely on structural query results.

### Modified Capabilities

- None.

## Impact

- Expected repository surfaces: tooling scripts and/or package commands, generated agent instructions sourced from `.agents/`, operational documentation, and validation evidence.
- Local generated state only: `.gitnexus/` and the GitNexus registry; academic data, application runtime, backend, sync, authentication, and AI gateway behavior are unaffected.
- External dependency/runtime: the approved GitNexus CLI release and its FTS support on the verified Node runtime.

## No objetivos

- Redesign product UI, refactor MVVM surfaces, or alter sync, backend, AI, storage, or user data.
- Replace GitNexus permanently with CodeGraph, repair Graphify, or implement the broader harness doctor.
- Run `gitnexus setup`, inject generated instructions/skills, or mutate global configuration without explicit evidence and review.
