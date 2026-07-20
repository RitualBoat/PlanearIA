# Update, recovery and rollback

## Ownership model

- `constructor`: full generated file, updated only when its recorded hash still matches.
- `human-overlay`: seeded once or limited to an explicit managed section.
- `external-openspec`: generated and updated by the pinned local OpenSpec CLI.
- `project`: verified only; never written by the constructor.

State records constructor version, schema version, owners and SHA-256 hashes. A runtime must reject state
from a future unsupported schema.

## Safe update

1. Commit or otherwise preserve current work.
2. Run `sync --check` with the proposed immutable constructor version.
3. Review the deterministic diff and migrations.
4. Run `sync`.
5. Run tests, doctor and `sync --check` again.
6. Commit the update separately.

Do not use a generic force flag. Resolve collisions by preserving an overlay, adopting ownership through a
versioned decision, or choosing a different target.

## Partial execution

A mutating command writes a transaction journal and backups, then uses temporary files and atomic rename
per file. State is committed last.

If a journal is incomplete:

```bash
npm run constructor:doctor
npm run constructor:rollback -- --transaction <ID>
```

Re-run bootstrap or sync only after the journal is classified. Re-execution must converge to the same
result as a clean run.

## Hash-aware rollback

Rollback restores backed-up files and removes only transaction-created files that still match the written
hash. If a person edited a generated file after the transaction, rollback stops and reports the conflict;
it never discards that edit.

## OpenSpec rollback

The general renderer never rolls back OPSX files. Use the exact local OpenSpec owner and review its diff.
For repository-level recovery, revert the constructor change through normal version control and rerun
validations.
