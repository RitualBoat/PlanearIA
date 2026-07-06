## ADDED Requirements

### Requirement: Destructive context cleanup requires an external backup gate
The repository SHALL require a complete, verifiable backup before tracked legacy, reference, study, sensitive, or heavy context material is removed from the working tree.

#### Scenario: Backup is created before cleanup
- **WHEN** a cleanup removes legacy documentation, archived OpenSpec material, reference repositories, study material, real examples, or heavy ground truth assets
- **THEN** the process creates `PLANEARIA_BACKUP_MOVE_OUT_2026-07-06/` first, preserving original relative paths and including a manifest with branch, date, git status, file counts, folder sizes, and SHA256 hashes

#### Scenario: Already-deleted reference source is preserved
- **WHEN** external reference source files are already deleted in the working tree but still exist in `HEAD`
- **THEN** the backup recovers those files from `HEAD` into the backup without restoring them into the repo working tree

#### Scenario: Human pause protects the backup
- **WHEN** the backup is complete
- **THEN** the cleanup pauses until the user confirms the backup folder has been moved outside the repo and the repo root no longer contains `PLANEARIA_BACKUP_MOVE_OUT_2026-07-06/`

### Requirement: Repository context stays minimal after externalization
The repository SHALL keep only current, task-routing context in Git after externalizing heavy or historical material.

#### Scenario: Active agent reads context after cleanup
- **WHEN** an agent reads the repo after cleanup
- **THEN** it finds current front doors, fundamentals, context-engineering routes, OpenSpec specs, and lightweight stubs instead of full legacy archives, heavy assets, external source snapshots, or sensitive real examples

#### Scenario: Removed material remains discoverable by policy
- **WHEN** an agent needs material that was externalized
- **THEN** the active documentation explains that the complete material lives in an external backup controlled by the user and must be requested rather than assumed present in the repo

#### Scenario: Critical rules remain in active sources
- **WHEN** legacy or ground truth files are removed from Git
- **THEN** MVVM, `src/sync`, `userId`, backend-only `aiGateway`, SQLite opt-in, no deletion of `@planearia:*`, low-budget constraints, and mandatory UI visual QA remain present in active guidance

### Requirement: CodeGraph optimization is measured before and after cleanup
The repository SHALL record comparable CodeGraph and repository metrics before and after context externalization.

#### Scenario: Baseline is recorded
- **WHEN** cleanup implementation begins after the backup has been moved out
- **THEN** the evidence records CodeGraph status, context file listing, repository Markdown counts, tracked candidate counts, and folder sizes before deleting material

#### Scenario: Final CodeGraph state is recorded
- **WHEN** cleanup is complete
- **THEN** the evidence records CodeGraph status, context file listing, repository counts, and a before/after comparison for files, nodes, edges, DB size, files under `context`, and false-positive external references

#### Scenario: Query traps validate focus
- **WHEN** CodeGraph exploration is tested after cleanup
- **THEN** queries for sync, `aiGateway`, Classroom, Cuenta/accessibility, and external references show that PlanearIA source is prioritized and external reference material is not treated as implementation code

### Requirement: Cleanup evidence remains auditable
The repository SHALL leave a current validation report for the max-clean operation without retaining the removed heavy material.

#### Scenario: Evidence report is created
- **WHEN** the cleanup completes
- **THEN** `Documentacion/03-validacion/repo-max-clean-context-2026-07-06/README.md` records issue/Project status, backup manifest location policy, removed categories, validations, CodeGraph comparison, AI findability results, and honest limitations

#### Scenario: Active links remain valid
- **WHEN** the active documentation is validated after cleanup
- **THEN** front doors, active `Documentacion/`, minimal `context/`, OpenSpec specs, and current evidence report have zero broken relative links

#### Scenario: OpenSpec closes cleanly
- **WHEN** all cleanup tasks are complete
- **THEN** the delta spec is synchronized to `openspec/specs/ai-friendly-repository-context/spec.md`, the change is archived, and `openspec validate --all --strict --json` passes with zero active changes
