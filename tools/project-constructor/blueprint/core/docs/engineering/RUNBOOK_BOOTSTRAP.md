# Bootstrap runbook

## Purpose

Prepare a new Git repository with universal governance, local OpenSpec, agent mirrors, evidence profiles,
read-only diagnosis, and advisory CI. This runbook does not begin product discovery or install product
dependencies.

## Preconditions

- A new or intentionally empty Git repository.
- Node.js `^20.20.0 || >=22.22.0` and npm.
- Git available on `PATH`.
- An approved local constructor tarball and its expected SHA-256.
- No overlapping working-tree changes.

If the repository already contains work, stop and classify ownership before bootstrap. Do not use a force
option.

## 1. Inspect without mutation

```bash
git status --short --branch
node --version
npm --version
```

Record the outputs. Confirm that the target is the intended repository.

## 2. Bootstrap from the approved local artifact

Calculate the tarball SHA-256 without modifying it, record the observed value, and compare it exactly with
the expected release evidence. Stop before installation if it differs.

Materialize that verified tarball in a temporary runner outside the target, then invoke its exact local
binary:

```bash
npm install --prefix "<RUNNER_OUTSIDE_TARGET>" --ignore-scripts --no-audit --no-fund "<APPROVED_LOCAL_TARBALL>"
node "<RUNNER_OUTSIDE_TARGET>/node_modules/project-engineering-os-constructor/bin/project-constructor.mjs" bootstrap --target .
```

The command performs complete preflight before writing. On collision it stops without adopting or
overwriting the file. Save the transaction ID and report. Do not use `npx`, a registry lookup, a
pre-warmed cache, or a global fallback.

## 3. Install only the locked governance dependency

```bash
npm ci
```

The generated package and lockfile pin local OpenSpec. Do not use a global CLI and do not add product
dependencies.

## 4. Generate official OPSX integration separately

The general renderer does not own OPSX. On first setup, use the pinned local CLI with the complete,
explicit supported harness set, then run the bounded neutral adapter:

```bash
npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode
npm run constructor:opsx:adapt
```

Do not use `--tools all`; it makes output depend on tools outside the constructor's compatibility contract.
Review the diff. The generated OPSX files remain externally owned by OpenSpec. The adapter may only update
the delimited neutral `propose`, `apply`, and `archive` blocks declared by the ownership contract.

After a deliberate pinned OpenSpec update, run:

```bash
npm exec --yes=false -- openspec update
npm run constructor:opsx:adapt
```

If the command, upstream shape, or managed markers differ, stop and update the explicit ownership contract
and fixtures; do not copy full workflows into the general renderer.

## 5. Verify deterministic parity

```bash
npm run constructor:sync:check
npm run constructor:opsx:check
npm run constructor:doctor
npm run constructor:doctor:json
```

The JSON and human doctor formats derive from the same results. Any `FAIL` needs recovery or an allowed,
time-bounded exception. `WARN` and `SKIP` are not passes.

Run a second synchronization check:

```bash
npm run constructor:bootstrap
npm run constructor:sync:check
```

The second run must report zero unexpected drift.

## 6. Prepare GitHub without remote mutation

```bash
npm run constructor:github-plan
```

Review proposed labels, states, fields, templates and discovery issues. Complete remote setup only through
the [manual guide](GUIA_MANUAL_USUARIO.md). Bootstrap never opens OAuth or changes Project or branch
protection.

The environment now exposes the future read-only SDD gates:

```bash
npm run sdd:ready:propose -- --issue <number>
npm run sdd:ready:archive -- --change <kebab-case> --run-local
```

Do not execute them with invented identifiers during bootstrap. Their metadata and recovery contract is in
the [readiness guide](READINESS_GATES.md).

## 7. Commit the environment

Review `git diff`, confirm no secret values exist, and commit the generated environment on a short-lived
branch. Publish and merge only through the repository policy.

## Exit criteria

- Local OpenSpec resolves to `1.6.0`.
- `sync --check` exits zero after a second run.
- Doctor has no unexplained `FAIL`.
- Only `documentation` and `harness-tooling` profiles are active.
- OPSX files are owned by OpenSpec, not the general renderer.
- Manual gates and their evidence are recorded.
- No product question, stack choice, service activation, or product dependency was introduced.
