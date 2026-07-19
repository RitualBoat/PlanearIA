---
name: /opsx-archive
id: opsx-archive
category: Workflow
description: Archive a completed change in the experimental workflow
---

Archive a completed change in the experimental workflow.

**Store selection:** If the user names a store (a store is a standalone OpenSpec repo registered on this machine) or the work lives in one, run `npm exec --yes=false -- openspec store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `openspec/` root.

**Input**: Optionally specify a change name after `/opsx:archive` (e.g., `/opsx:archive add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `npm exec --yes=false -- openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `npm exec --yes=false -- openspec status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context
   - `artifacts`: List of artifacts with their status (`done` or other)

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue
   - Proceed if user confirms

   **If no tasks file exists:** Proceed without task-related warning.

4. **Assess delta spec sync state**

   Use `artifactPaths.specs.existingOutputPaths` from status JSON to check for delta specs. If none exist, proceed without sync prompt.

   **If delta specs exist:**
   - Compare each delta spec with its corresponding main spec at `openspec/specs/<capability>/spec.md`
   - Determine what changes would be applied (adds, modifications, removals, renames)
   - Show a combined summary before prompting

   **Prompt options:**
   - Report the assessment only. Do NOT offer to sync before archiving: `npm run opsx:archive` classifies the sync state and picks the correct archive invocation.

   Do not sync here. `npm run opsx:archive` resolves the sync state and archives with or without applying deltas.

5. **Perform the archive**

   Create an `archive` directory under `planningHome.changesDir` if it doesn't exist:
   ```bash
   mkdir -p "<planningHome.changesDir>/archive"
   ```

   Generate target name using current date: `YYYY-MM-DD-<change-name>`

   **Check if target already exists:**
   - If yes: Fail with error, suggest renaming existing archive or using different date
   - If no: Move `changeRoot` to the archive directory

   ```bash
   npm run opsx:archive -- <change-name>
   ```

6. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location
   - Spec sync status (synced / sync skipped / no delta specs)
   - Note about any warnings (incomplete artifacts/tasks)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** the archive path derived from `planningHome.changesDir`/YYYY-MM-DD-<name>/
**Specs:** ✓ Synced to main specs

All artifacts complete. All tasks complete.
```

**Output On Success (No Delta Specs)**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** the archive path derived from `planningHome.changesDir`/YYYY-MM-DD-<name>/
**Specs:** No delta specs

All artifacts complete. All tasks complete.
```

**Output On Success With Warnings**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** the archive path derived from `planningHome.changesDir`/YYYY-MM-DD-<name>/
**Specs:** Sync skipped (user chose to skip)

**Warnings:**
- Archived with 2 incomplete artifacts
- Archived with 3 incomplete tasks
- Delta spec sync was skipped (user chose to skip)

Review the archive if this was not intentional.
```

**Output On Error (Archive Exists)**

```
## Archive Failed

**Change:** <change-name>
**Target:** the archive path derived from `planningHome.changesDir`/YYYY-MM-DD-<name>/

Target archive directory already exists.

**Options:**
1. Rename the existing archive
2. Delete the existing archive if it's a duplicate
3. Wait until a different date to archive
```

**Guardrails**
- Always prompt for change selection if not provided
- Use artifact graph (npm exec --yes=false -- openspec status --json) for completion checking
- Don't block archive on warnings - just inform and confirm
- Preserve .openspec.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- Do not sync main specs before archiving; the OpenSpec CLI is their only writer during archive
- If delta specs exist, always run the sync assessment and show the combined summary before prompting

<!-- PLANEARIA_TLDR_WORKFLOW -->

### PlanearIA TLDR convention

Before moving the change, confirm `TLDR.md` remains at `<changeRoot>/TLDR.md` and reflects any material apply changes. Move it with the complete change directory; do not copy it elsewhere or automatically judge its wording, structure, or word count.

<!-- /PLANEARIA_TLDR_WORKFLOW -->

<!-- PLANEARIA_READINESS_WORKFLOW -->

### PlanearIA Definition of Ready and Done

Before archive, run `npm run openspec:ready:archive -- --change <name> --run-local`. It is read-only and checks readiness.json, brownfield-baseline.md, completed tasks, proportional validation evidence, rollback and adversarial review. Resolve each FAIL or a valid, temporary exception before moving the change.

<!-- /PLANEARIA_READINESS_WORKFLOW -->

<!-- PLANEARIA_CLOSURE_WORKFLOW -->

### PlanearIA canonical closure order

Archive with `npm run opsx:archive -- <change-name>`; preview with `npm run opsx:archive:dry`. That command is the single owner of this step: it guards the branch, runs the archive readiness gate, classifies whether the delta specs are already applied, delegates the spec sync and the directory move to the OpenSpec CLI, and commits the result on the change branch.

The OpenSpec CLI is the only writer of main specs during archive. Do not run `/opsx:sync` first for a change you are about to archive: the CLI applies the same deltas and aborts when an ADDED requirement already exists. Do not move the change directory by hand; the CLI move degrades safely on Windows and a manual `mv` does not.

Rerunning the archive is safe: an already archived and committed change reports a no-op. Close the branch afterwards with `npm run opsx:finish`, which never pushes directly to the protected target.

<!-- /PLANEARIA_CLOSURE_WORKFLOW -->
