# ai friendly repository context Specification

## Purpose
Define the repository, documentation, context, and validation contract that lets AI agents recover PlanearIA context quickly and execute Master Plan work through OpenSpec SDD.

## Requirements
### Requirement: Agent entrypoints route to the current SDD workflow
The repository SHALL provide concise entrypoints that route AI agents and human collaborators to the current PlanearIA source of truth hierarchy and OpenSpec SDD workflow.

#### Scenario: Codex starts from AGENTS
  **WHEN** Codex starts by reading `AGENTS.md`
  **THEN** it can identify `CLAUDE.md`, `Documentacion/README.md`, `openspec/config.yaml`, CodeGraph first exploration, GitHub issue tracking, OpenSpec changes, and mandatory evidence gates

#### Scenario: Collaborator starts from README
  **WHEN** a collaborator opens `README.md`
  **THEN** it describes PlanearIA as a current connected teacher suite and links to active documentation without referencing missing documents

#### Scenario: Lightweight assistant reads Copilot instructions
  **WHEN** GitHub Copilot or a similar assistant reads `.github/copilot-instructions.md`
  **THEN** it receives the same critical SDD, architecture, validation, no secrets, `src/sync`, `userId`, and `aiGateway` rules as the other front doors

### Requirement: Active documentation is current, affirmative, and rule preserving
Active documentation SHALL describe PlanearIA's current product and architecture in present affirmative language while preserving critical business, security, offline first, and AI rules.

#### Scenario: Active product vision is read
  **WHEN** an active documentation file explains PlanearIA's product direction
  **THEN** it states the current suite vision directly instead of framing it as a correction from an older app state

#### Scenario: Historical material remains useful
  **WHEN** historical audits, closed plans, legacy prompts, or old navigation maps remain useful for context
  **THEN** they live in `an external user-controlled backup or closed-plan reference with clear non executable framing

#### Scenario: Critical rules are moved or rewritten
  **WHEN** a document is shortened, moved, or rewritten
  **THEN** MVVM, `src/sync`, `userId`, backend only `aiGateway`, SQLite opt in, no deletion of `@planearia:*`, low budget constraints, and mandatory UI visual QA remain present in active guidance

### Requirement: Context engineering provides task based retrieval
The repository SHALL include context engineering documentation that maps common agent tasks to the minimum current files, evidence folders, and validation commands required to work safely.

#### Scenario: Agent executes a Master Plan change
  **WHEN** an agent is asked to execute work from a Plan Maestro
  **THEN** the guide routes it through issue creation, enrichment, OpenSpec proposal/spec/design/tasks, apply, evidence, adversarial review, and archive

#### Scenario: Agent touches UX/UI
  **WHEN** an agent is asked to modify UX/UI
  **THEN** the guide routes it to the active UX/UI plan, IHC checklist, ground truth requirements, Figma when available, and Playwright evidence expectations

#### Scenario: Agent touches backend, sync, auth, or IA
  **WHEN** an agent is asked to modify backend, sync, auth, IA, or academic data
  **THEN** the guide routes it to architecture, sync, IA gateway, backend rules, user isolation, and the smallest meaningful validation commands

### Requirement: Master Plans are carbonized through OpenSpec
The repository SHALL document a repeatable path from Master Plan backlog entries to small OpenSpec changes with observable acceptance criteria.

#### Scenario: Agent selects a backlog item
  **WHEN** an agent takes a pending backlog item from a Plan Maestro
  **THEN** it creates or uses a GitHub issue, enriches the story, and proposes one OpenSpec change rather than implementing directly from the plan

#### Scenario: Agent writes change specs
  **WHEN** an agent creates specs for a change
  **THEN** requirements use observable SHALL behavior and WHEN/THEN scenarios rather than implementation only task lists

#### Scenario: Agent marks work complete
  **WHEN** a task or change is marked complete
  **THEN** evidence exists for typecheck, lint, affected tests, and visual QA when the change touches a visible screen

### Requirement: Context reference material is separated from implementation source
The `context/` tree SHALL distinguish active ground truth, real examples, external references, OpenSpec study material, and archive oriented material so agents do not treat reference code as PlanearIA implementation.

#### Scenario: Agent opens context index
  **WHEN** an agent reads `context/README.md`
  **THEN** it can tell which folders are active ground truth, which are external references, which are real examples requiring sensitivity review, and which are study material

#### Scenario: External open source reference exists
  **WHEN** an external repository is kept as inspiration
  **THEN** PlanearIA tracks source URL, license/notice, relevant architecture paths, and distilled notes instead of relying on vendored source code as active project code

#### Scenario: Sensitive teaching material exists
  **WHEN** real lesson plans, PDFs, screenshots, or notes may include personal, school, or student data
  **THEN** documentation flags the material for review and does not instruct agents to expose or move it outside approved paths

### Requirement: CodeGraph exploration focuses on PlanearIA source
The repository SHALL prevent structural code exploration from prioritizing external reference source as if it were PlanearIA application code.

#### Scenario: CodeGraph lists context files
  **WHEN** CodeGraph file listing is run for `context/`
  **THEN** external `context/referencias-opensource/**/source` implementation files are absent or documented as a residual risk

#### Scenario: Agent asks architecture question
  **WHEN** an agent uses CodeGraph for PlanearIA architecture or blast radius
  **THEN** results prioritize `src/`, `backend/`, `types/`, `shared/`, and project config rather than external reference repos

### Requirement: Documentation validation leaves auditable evidence
The overhaul SHALL leave a validation report with commands, findings, limitations, and final results for the repo's AI friendly state.

#### Scenario: Relative links are validated
  **WHEN** active Markdown links are checked
  **THEN** the report lists results and intentional exclusions such as archived or upstream README files

#### Scenario: Active language scan is validated
  **WHEN** active docs are scanned for stale/historical phrasing
  **THEN** the report distinguishes accepted technical terms from text that still needs rewrite

#### Scenario: AI findability is tested
  **WHEN** implementation is complete
  **THEN** a final findability test verifies that an agent can locate SDD workflow, UX/UI context, backend/sync/IA rules, context ground truth, and validation commands from the updated entrypoints
### Requirement: Destructive context cleanup requires an external backup gate
The repository SHALL require a complete, verifiable backup before tracked legacy, reference, study, sensitive, or heavy context material is removed from the working tree.

#### Scenario: Backup is created before cleanup
  **WHEN** a cleanup removes legacy documentation, archived OpenSpec material, reference repositories, study material, real examples, or heavy ground truth assets
  **THEN** the process creates a move-out backup first, preserving original relative paths and including a manifest with branch, date, git status, file counts, folder sizes, and SHA256 hashes

#### Scenario: Already-deleted reference source is preserved
  **WHEN** external reference source files are already deleted in the working tree but still exist in `HEAD`
  **THEN** the backup recovers those files from `HEAD` into the backup without restoring them into the repo working tree

#### Scenario: Human pause protects the backup
  **WHEN** the backup is complete
  **THEN** the cleanup pauses until the user confirms the backup folder has been moved outside the repo and the repo root no longer contains the move-out backup folder

### Requirement: Repository context stays minimal after externalization
The repository SHALL keep only current, task-routing context in Git after externalizing heavy or historical material.

#### Scenario: Active agent reads context after cleanup
  **WHEN** an agent reads the repo after cleanup
  **THEN** it finds current front doors, fundamentals, context-engineering routes, OpenSpec specs, and lightweight stubs instead of full legacy archives, heavy assets, external source snapshots, or sensitive real examples

#### Scenario: Removed material remains discoverable by policy
  **WHEN** an agent needs material that was externalized
  **THEN** the active documentation explains that the complete material lives in an external backup controlled by the user and must be requested rather than assumed present in the repo

#### Scenario: Critical rules remain in active sources
  **WHEN** legacy or ground truth files are removed from Git
  **THEN** MVVM, `src/sync`, `userId`, backend-only `aiGateway`, SQLite opt-in, no deletion of `@planearia:*`, low-budget constraints, and mandatory UI visual QA remain present in active guidance

### Requirement: CodeGraph optimization is measured before and after cleanup
The repository SHALL record comparable CodeGraph and repository metrics before and after context externalization.

#### Scenario: Baseline is recorded
  **WHEN** cleanup implementation begins after the backup has been moved out
  **THEN** the evidence records CodeGraph status, context file listing, repository Markdown counts, tracked candidate counts, and folder sizes before deleting material

#### Scenario: Final CodeGraph state is recorded
  **WHEN** cleanup is complete
  **THEN** the evidence records CodeGraph status, context file listing, repository counts, and a before/after comparison for files, nodes, edges, DB size, files under `context`, and false-positive external references

#### Scenario: Query traps validate focus
  **WHEN** CodeGraph exploration is tested after cleanup
  **THEN** queries for sync, `aiGateway`, Classroom, Cuenta/accessibility, and external references show that PlanearIA source is prioritized and external reference material is not treated as implementation code

### Requirement: Cleanup evidence remains auditable
The repository SHALL leave a current validation report for the max-clean operation without retaining the removed heavy material.

#### Scenario: Evidence report is created
  **WHEN** the cleanup completes
  **THEN** `Documentacion/03-validacion/repo-max-clean-context-2026-07-06/README.md` records issue/Project status, backup manifest location policy, removed categories, validations, CodeGraph comparison, AI findability results, and honest limitations

#### Scenario: Active links remain valid
  **WHEN** the active documentation is validated after cleanup
  **THEN** front doors, active `Documentacion/`, minimal `context/`, OpenSpec specs, and current evidence report have zero broken relative links

#### Scenario: OpenSpec closes cleanly
  **WHEN** all cleanup tasks are complete
  **THEN** the delta spec is synchronized to `openspec/specs/ai-friendly-repository-context/spec.md`, the change is archived, and `openspec validate --all --strict --json` passes with zero active changes
