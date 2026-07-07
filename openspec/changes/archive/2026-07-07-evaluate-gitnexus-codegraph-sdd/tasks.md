## 1. Baseline Current Policy

- [x] 1.1 Record issue #40, Project status, and the active OpenSpec change path in the validation report.
- [x] 1.2 Inventory every active CodeGraph-first instruction in `AGENTS.md`, `CLAUDE.md`, `openspec/config.yaml`, `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`, `Documentacion/05-context-engineering/README.md`, `Documentacion/01-planes-maestros/meta_guia_planes.md`, and `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.
- [x] 1.3 Record current CodeGraph state, freshness indicators, command availability, and any known limitations.
- [x] 1.4 Create the comparison matrix structure in `Documentacion/03-validacion/evaluate-gitnexus-codegraph-sdd/README.md`.

## 2. CodeGraph Evaluation

- [x] 2.1 Run the MVVM screen -> hook/ViewModel -> service/repository query with CodeGraph and record output quality.
- [x] 2.2 Run the shared hook blast-radius query with CodeGraph and record output quality.
- [x] 2.3 Run the backend/AI gateway query with CodeGraph and record output quality.
- [x] 2.4 Run the sync/offline query with CodeGraph and record output quality.
- [x] 2.5 Run the UX/UI active-plan query with CodeGraph and record output quality.

## 3. GitNexus Controlled Trial

- [x] 3.1 Verify GitNexus package/version, official install/setup instructions, privacy behavior, and Windows caveats from primary sources.
- [x] 3.2 Install or run GitNexus in the least invasive local way available and record exact commands.
- [x] 3.3 Record every generated artifact, MCP/config change, local registry entry, or skill directory created by GitNexus.
- [x] 3.4 Index PlanearIA with GitNexus and record status/freshness commands and errors.
- [x] 3.5 Confirm rollback or cleanup commands before making GitNexus part of the normal flow.

## 4. GitNexus Evaluation

- [x] 4.1 Run the MVVM screen -> hook/ViewModel -> service/repository query with GitNexus and record output quality.
- [x] 4.2 Run the shared hook blast-radius query with GitNexus and record output quality.
- [x] 4.3 Run the backend/AI gateway query with GitNexus and record output quality.
- [x] 4.4 Run the sync/offline query with GitNexus and record output quality.
- [x] 4.5 Run the UX/UI active-plan query with GitNexus and record output quality.

## 5. Decision And Policy

- [x] 5.1 Compare CodeGraph and GitNexus using the same criteria: relevant files, missing files, irrelevant context, follow-up reads, speed, operational friction, and first-pass usefulness.
- [x] 5.2 Run at least one dual-tool/fallback trial and record whether it improves accuracy or contaminates context.
- [x] 5.3 Decide the final policy: migrate to GitNexus, keep CodeGraph, use both with routing rules, or keep one as fallback.
- [x] 5.4 Document rejected alternatives and the reason each was rejected.
- [x] 5.5 Comment the final decision summary on issue #40.

## 6. Documentation Updates

- [x] 6.1 Update `AGENTS.md` with the final knowledge-graph/tool routing policy.
- [x] 6.2 Update `CLAUDE.md` with the final MCP/tooling rule.
- [x] 6.3 Update `openspec/config.yaml` so future propose/apply context uses the final policy.
- [x] 6.4 Update `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md` with the final policy and operational commands.
- [x] 6.5 Update `Documentacion/05-context-engineering/README.md` with routing guidance for agents.
- [x] 6.6 Update `Documentacion/01-planes-maestros/meta_guia_planes.md` so SDD steps reference the final policy.
- [x] 6.7 Update `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` D15 or related notes if CodeGraph-first changes.

## 7. Validation

- [x] 7.1 Run `rg "CodeGraph|GitNexus|knowledge graph|MCP" AGENTS.md CLAUDE.md openspec/config.yaml Documentacion/02-operacion Documentacion/05-context-engineering Documentacion/01-planes-maestros` and verify there are no contradictory active instructions.
- [x] 7.2 Run `openspec validate --all --strict --json` and record the result.
- [x] 7.3 Run a documentation-only sanity check with two future-agent prompts and confirm they choose the expected tool path.
- [x] 7.4 Record why Playwright visual QA is not applicable because this change does not modify visible app UI.
- [x] 7.5 Update tasks with evidence links or command outputs before marking any checkbox complete.

## Evidence

- Final decision comment on issue #40: https://github.com/RitualBoat/PlanearIA/issues/40#issuecomment-4909707754
- Validation report: `Documentacion/03-validacion/evaluate-gitnexus-codegraph-sdd/README.md`
- Final policy docs updated: `AGENTS.md`, `CLAUDE.md`, `openspec/config.yaml`,
  `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`, `Documentacion/02-operacion/CODEGRAPH_MCP.md`,
  `Documentacion/05-context-engineering/README.md`, `Documentacion/01-planes-maestros/meta_guia_planes.md`,
  `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.
- Reference scan command:
  `rg -n "CodeGraph|GitNexus|knowledge graph|MCP|codegraph|gitnexus" AGENTS.md CLAUDE.md openspec/config.yaml Documentacion/02-operacion Documentacion/05-context-engineering Documentacion/01-planes-maestros`
  Result: no contradictory active instructions after updating `CODEGRAPH_MCP.md`.
- OpenSpec validation command: `openspec validate --all --strict --json`.
  Result: 10 items passed, 0 failed.
- Playwright visual QA: N/A because this change only modifies docs/tooling/SDD guidance and local skill artifacts, not visible app UI.
