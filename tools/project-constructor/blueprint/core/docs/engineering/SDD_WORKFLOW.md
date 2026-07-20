# SDD, readiness and closure

## Complete flow

```text
issue -> enrich -> DoR -> propose -> apply -> QA -> adversarial review
-> DoD -> archive/sync -> pull request -> CI -> merge -> close
```

Use OpenSpec for non-trivial versioned repository changes. Interviews, OAuth, cost approvals and other
human actions remain manual gates unless their result modifies versioned files.

## Definition of Ready

Do not implement until all applicable items are evidenced:

- issue and Project item exist and no duplicate was found;
- original issue text is preserved and enrichment is appended;
- scope, non-goals, dependencies and manual gates are explicit;
- working tree is clean, classified, or safely isolated;
- current behavior and authoritative sources were verified;
- architecture and ownership are approved;
- observable criteria and negative cases exist;
- automatic and manual evidence are named;
- rollback is concrete;
- costs, licenses, permissions and secrets are reviewed;
- pre-propose gate passes.

Run the read-only gate before creating a change:

```bash
npm run sdd:ready:propose -- --issue <number>
npm run sdd:ready:propose -- --issue <number> --json
```

If GitHub CLI, authentication, Project visibility, or membership cannot be verified, the result is `FAIL`
unless the issue contains a valid, visible `project-membership` exception. See
[readiness gates](READINESS_GATES.md).

Allowed temporary exceptions require a permitted field plus reason, owner, approver, ISO expiration, and
recovery action. Exceptions never silence identity, artifact integrity, or incomplete tasks.

## Change artifacts

Each versionable change contains:

- `proposal.md`: why, what, impact and non-goals;
- `design.md`: decisions, alternatives, ownership, risks and rollback;
- specs: requirements with SHALL and scenarios with WHEN/THEN;
- `tasks.md`: small, evidence-backed implementation steps;
- `TLDR.md`: human summary;
- `brownfield-baseline.md`: only the touched surface and its current/target state;
- readiness metadata linking issue, surfaces, profiles, evidence, exceptions and rollback.

Only the local, exactly pinned OpenSpec CLI writes active specs during archive and owns OPSX integration.

## Apply and QA

Implement one task at a time. Mark it complete only after its evidence exists. Run validations selected by
the active evidence profile, including negative cases and manual evidence. Classify unexpected warnings
and logs.

An independent or clean-context adversarial review asks whether the design copies an existing product,
creates false greens, selects technology early, hides degradation, duplicates truth, loses recovery,
automates human consent, ignores cost/license/secrets, or permits closure without evidence. Correct all
Blockers and Majors.

## Definition of Done

- OpenSpec artifacts are complete and strictly valid.
- Tests, fixtures, negative cases and active profile gates pass.
- `sync --check` is clean and the doctor has no unexplained `FAIL`.
- Rollback is tested in proportion to risk.
- Documentation and evidence are findable.
- No secrets are present.
- Required CI actually ran and passed.
- Issue, Project, plan and pull request agree.
- Archive and spec synchronization complete through the OpenSpec owner.
- Merge and closure follow branch policy.

Before archive, run:

```bash
npm run sdd:ready:archive -- --change <kebab-case> --run-local
npm run sdd:ready:archive -- --change <kebab-case> --run-local --json
```

Pending evidence, pending validations, incomplete tasks, or an unresolved adversarial Blocker/Major remain
`FAIL`. The gate cannot mark them complete.
