## Why

PlanearIA already instructs agents to use CodeGraph first for structural code questions, but there is no local evidence that this improves token efficiency, precision, or first-pass correctness. GitNexus may be a better fit for the project's MVVM shape, but it is not installed or proven in this repo, so the project needs an evidence-backed tooling decision before changing the SDD flow.

## What Changes

- Create a spike/ADR workflow for evaluating GitNexus against CodeGraph on real PlanearIA queries.
- Measure both tools against representative MVVM, backend/AI, sync/offline, UX/UI, and blast-radius scenarios.
- Decide whether PlanearIA should migrate to GitNexus, keep CodeGraph, use both with strict routing, or keep one as fallback.
- Document the final tool-selection policy and operational commands in the agent and SDD docs.
- Update the active UX/UI plan if the current CodeGraph-first decision changes.
- Preserve local-first, low-cost, and privacy constraints; no paid service or code upload is allowed without explicit approval.

## No objetivos

- No migrar PlanearIA's app architecture or runtime code.
- No adopt Graphify or any third knowledge-graph tool in this change.
- No remove CodeGraph before comparable evidence exists.
- No publish PlanearIA code, indexes, or knowledge graphs to external services.
- No add paid infrastructure, SaaS, or enterprise services.
- No treat external recommendations as final evidence without testing in this repo.

## Capabilities

### New Capabilities

- `agent-knowledge-graph-policy`: Defines how PlanearIA evaluates and selects code-intelligence tools for AI agents, including GitNexus/CodeGraph routing, fallback rules, operational commands, and evidence requirements.

### Modified Capabilities

- `ai-friendly-repository-context`: Updates the existing agent-entrypoint and CodeGraph-first context contract so it can reference the approved knowledge-graph policy instead of hardcoding CodeGraph as the only primary structural tool.

## Impact

- Docs and agent guidance:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `openspec/config.yaml`
  - `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`
  - `Documentacion/05-context-engineering/README.md`
  - `Documentacion/01-planes-maestros/meta_guia_planes.md`
  - `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`
- OpenSpec specs:
  - new `agent-knowledge-graph-policy`
  - delta to `ai-friendly-repository-context`
- Tooling:
  - current CodeGraph index and commands
  - GitNexus CLI/MCP installation and maintenance commands if adopted
- Validation:
  - issue #40 evidence comment/report
  - comparison matrix
  - final tool policy sanity checks with future-agent style prompts
