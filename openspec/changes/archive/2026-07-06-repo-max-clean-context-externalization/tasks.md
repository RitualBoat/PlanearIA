## 1. SDD Tracking And Artifacts

- [x] 1.1 Create GitHub issue #36, enrich it with `## Original` / `## Enriquecida`, and add it to GitHub Project `RitualBoat/1`.
- [x] 1.2 Create and validate OpenSpec artifacts for `repo-max-clean-context-externalization`.
- [x] 1.3 Record pre-backup Git/OpenSpec state before filesystem cleanup work begins.

## 2. Backup Gate

- [x] 2.1 Create `PLANEARIA_BACKUP_MOVE_OUT_2026-07-06/` at repo root and copy all configured legacy/context/reference folders preserving relative paths.
- [x] 2.2 Recover deleted `context/referencias-opensource/**/source/**` files from `HEAD` into the backup without restoring them to the working tree.
- [x] 2.3 Generate backup manifest with branch, date, git status, copied routes, counts, folder sizes, and SHA256 hashes.
- [x] 2.4 Pause until the user confirms the backup folder has been moved outside the repo and verify the folder no longer exists at repo root.

## 3. Baseline Before Cleanup

- [x] 3.1 Run and record CodeGraph baseline: status, sync, context file list, and explore queries for sync, `aiGateway`, Classroom, Cuenta/accessibility, and external-reference trap.
- [x] 3.2 Record repo baseline: tracked file counts, Markdown counts, folder sizes, candidate tracked paths, active link state, and legacy-language scan.

## 4. Externalization Cleanup

- [x] 4.1 Remove tracked legacy, archive, study, reference, sensitive example, and heavy ground-truth material that is covered by the external backup.
- [x] 4.2 Leave or create minimal README/stub indexes for active context areas and update `.gitignore` for future local backups/heavy references.
- [x] 4.3 Update active documentation indexes to describe the external-backup policy without absolute local paths.

## 5. Post-Cleanup Validation

- [x] 5.1 Re-run CodeGraph sync/status/file-list and compare before/after metrics and query behavior.
- [x] 5.2 Validate active links, legacy-language scan, and AI findability routes after cleanup.
- [x] 5.3 Run `openspec validate --all --strict --json`, `npm run typecheck`, `npm run lint -- --quiet`, and `git diff --check`.
- [x] 5.4 Create final evidence report in `Documentacion/03-validacion/repo-max-clean-context-2026-07-06/README.md`.

## 6. OpenSpec Closeout

- [x] 6.1 Sync the delta spec into `openspec/specs/ai-friendly-repository-context/spec.md`.
- [x] 6.2 Archive `repo-max-clean-context-externalization` and verify `openspec list --json` returns zero active changes.

