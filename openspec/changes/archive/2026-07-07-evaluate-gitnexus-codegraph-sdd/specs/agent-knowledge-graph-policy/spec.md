## ADDED Requirements

### Requirement: Knowledge graph tooling decisions are evidence backed
PlanearIA SHALL choose GitNexus, CodeGraph, both tools, or neither as the primary AI-agent code-intelligence path only after comparable evidence is recorded from this repository.

#### Scenario: GitNexus is proposed as a replacement
- **WHEN** GitNexus is considered for primary use in PlanearIA
- **THEN** the evaluation records installation status, commands used, generated artifacts, Windows compatibility, and rollback notes
- **AND** CodeGraph remains available until the final decision is documented.

#### Scenario: External recommendation exists
- **WHEN** an external model, blog, README, or marketing page claims GitNexus or CodeGraph is better
- **THEN** the claim is recorded as a hypothesis
- **AND** it does not change PlanearIA's SDD flow until tested on PlanearIA queries.

### Requirement: Comparative evaluation uses representative PlanearIA queries
The evaluation SHALL compare candidate knowledge-graph tools with paired prompts or commands that cover PlanearIA's actual architecture and SDD needs.

#### Scenario: MVVM flow is evaluated
- **WHEN** the evaluation tests screen-to-logic understanding
- **THEN** both tools are asked to map a screen to its hook/ViewModel and service or repository dependencies.

#### Scenario: Backend and AI flow is evaluated
- **WHEN** the evaluation tests AI or backend context
- **THEN** both tools are asked to trace a backend route or AI gateway flow without exposing provider keys or frontend-only model calls.

#### Scenario: Sync flow is evaluated
- **WHEN** the evaluation tests offline-first behavior
- **THEN** both tools are asked to identify `src/sync` flow, queue/retry/pull behavior, and affected contexts or services.

#### Scenario: UX/UI plan flow is evaluated
- **WHEN** the evaluation tests active UX/UI work
- **THEN** both tools are asked to find code and docs relevant to a UX/UI change where the current plan expects structural exploration before design or apply.

#### Scenario: Blast radius is evaluated
- **WHEN** the evaluation tests impact analysis
- **THEN** both tools are asked what could break if a shared hook, service, or backend helper changes.

### Requirement: Evaluation evidence is auditable
The change SHALL leave a validation report that records each tool's usefulness, noise, and operational cost.

#### Scenario: Evaluation row is recorded
- **WHEN** a paired query is run
- **THEN** the report records tool name, command or prompt, relevant files returned, missing files, irrelevant context, approximate time, follow-up reads needed, and a short usefulness verdict.

#### Scenario: Exact token metrics are unavailable
- **WHEN** exact token savings cannot be measured
- **THEN** the report uses documented proxies such as number of tool calls, number of files read, output size, irrelevant files returned, and first-pass actionability.

#### Scenario: Final decision is made
- **WHEN** the evaluation is complete
- **THEN** the report states one final policy: migrate to GitNexus, keep CodeGraph, use both with routing rules, or keep one as fallback
- **AND** the report explains why the rejected alternatives were not chosen.

### Requirement: Dual-tool usage requires strict routing
PlanearIA SHALL allow GitNexus and CodeGraph together only when the evaluation shows that combined usage improves agent accuracy without adding unacceptable context noise.

#### Scenario: Fallback is approved
- **WHEN** one tool is documented as fallback
- **THEN** docs specify the exact failure modes or question types that allow fallback
- **AND** agents are instructed not to call both tools for the same question unless the first tool fails or evidence needs comparison.

#### Scenario: Fallback contaminates context
- **WHEN** dual-tool trials produce duplicate, contradictory, or excessive context
- **THEN** the final policy prohibits routine fallback
- **AND** docs state which tool is primary and when direct file reads are preferred instead.

### Requirement: GitNexus operational commands are documented if adopted
If GitNexus becomes primary, secondary, or fallback tooling, PlanearIA SHALL document its lifecycle commands and generated-artifact policy in the SDD and agent docs.

#### Scenario: GitNexus is adopted
- **WHEN** GitNexus remains part of the final policy
- **THEN** docs include setup, analyze or reindex, status or freshness, clean or rollback, and optional serve/wiki commands that are actually validated in this repo.

#### Scenario: GitNexus creates local artifacts
- **WHEN** GitNexus generates local files, MCP config, skills, indexes, or registry entries
- **THEN** the change records whether each artifact is committed, gitignored, external to the repo, or removed after evaluation.

#### Scenario: GitNexus is rejected
- **WHEN** GitNexus is not adopted
- **THEN** docs and evidence explain the rejection and avoid adding stale GitNexus commands to the normal SDD flow.

### Requirement: Agent docs stay consistent after the decision
The final implementation SHALL update every active agent or SDD document that references CodeGraph-first behavior when the approved policy differs from current guidance.

#### Scenario: Current docs are scanned
- **WHEN** the final policy is ready
- **THEN** the implementation searches active docs for CodeGraph, GitNexus, knowledge graph, MCP flow, and D15 references.

#### Scenario: Policy changes tool priority
- **WHEN** the final policy changes the current CodeGraph-first rule
- **THEN** `AGENTS.md`, `CLAUDE.md`, `openspec/config.yaml`, `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`, `Documentacion/05-context-engineering/README.md`, `Documentacion/01-planes-maestros/meta_guia_planes.md`, and the active UX/UI plan are updated to match.

#### Scenario: Policy keeps CodeGraph primary
- **WHEN** CodeGraph remains primary after evaluation
- **THEN** docs record why GitNexus was not adopted
- **AND** the active CodeGraph-first instructions are clarified with any learned measurement or freshness checks.
