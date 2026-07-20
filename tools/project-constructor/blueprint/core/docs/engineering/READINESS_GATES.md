# Readiness gates

The reusable gate is read-only. It reports only `PASS`, `FAIL`, and `EXCEPTION`; an exception remains
visible and never becomes a pass.

## Before propose

The issue must preserve `## Historia Original`, append `## Enriquecida`, and contain the editable block
delimited by:

```text
<!-- project-os-readiness:pre-propose
{ ...metadata v1... }
project-os-readiness:pre-propose -->
```

Use the issue template or
[`pre-propose-readiness.example.json`](templates/pre-propose-readiness.example.json), then run:

```bash
npm run sdd:ready:propose -- --issue <number>
npm run sdd:ready:propose -- --issue <number> --json
```

The gate checks the open issue, both sections, metadata schema, dependencies, current-state sources, scope,
observable criteria, owner, risks, Product OS membership, surfaces, expected evidence, rollback, non-goals,
manual interventions, and cost/license review. Missing `gh`, missing authentication, an unavailable
Project, or unverified membership is `FAIL`; the checker does not authenticate or open OAuth.

## Before archive

Create `openspec/changes/<change>/readiness.json` from
[`readiness.example.json`](templates/readiness.example.json). The sample is intentionally pending and must
not pass until references and statuses represent real evidence.

Run:

```bash
npm run sdd:ready:archive -- --change <kebab-case>
npm run sdd:ready:archive -- --change <kebab-case> --run-local
npm run sdd:ready:archive -- --change <kebab-case> --run-local --json
```

The gate confines the path to `openspec/changes`, validates the metadata, identity and issue traceability,
requires the root OpenSpec artifacts plus at least one regular confined `specs/*/spec.md`, rejects pending
tasks, derives validation and manual-evidence IDs from every active surface, checks rollback, and requires
an independent adversarial review with zero Blockers and Majors.

`--run-local` may invoke only runner IDs mapped inside the immutable constructor runtime. Neither
`readiness.json` nor issue metadata may supply a command, executable, path, or arguments.

## Exceptions

Only `project-membership` and non-surface `manual-evidence` are initially eligible. Every exception
requires reason, owner, approver, ISO `YYYY-MM-DD` expiration, and recovery.

The following are never waivable in policy v1:

- issue or change identity;
- artifact integrity;
- incomplete tasks;
- secrets;
- evidence required by an active surface.

An invalid, expired, forbidden, or unverifiable exception is `FAIL`. A valid exception is `EXCEPTION` with
owner, expiration, and recovery in the report. Do not describe it as `PASS`.

## Sources

- Policy: `.project-os/readiness-policy.json`
- Policy schema: `.project-constructor/schema/readiness-policy.schema.json`
- Issue metadata schema: `.project-constructor/schema/pre-propose-readiness.schema.json`
- Change metadata schema: `.project-constructor/schema/readiness.schema.json`
- Issue form: `.github/ISSUE_TEMPLATE/change.yml`

The checker never edits issue content, Project state, tasks, evidence, artifacts, or exception dates.
