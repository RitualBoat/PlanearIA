# Tools, permissions, secrets and cost policy

## Universal rules

- Use exact local versions and committed lockfiles.
- No global or floating fallback for governance tools.
- Check current official documentation before relying on an unstable API.
- Keep secret values out of files, logs and evidence. Configuration contains environment variable names
  only.
- Authentication, new scopes, paid services, legal acceptance, branch protection, merge and release are
  manual gates.
- A doctor is read-only and cannot install, repair, authenticate, update, reindex or start processes.
- Canonical permission policy is always visible in `AGENTS.md`, but a harness capability is marked native
  or generated only when its official configuration can enforce the same semantics. Claude Code and
  OpenCode receive documented permission fallback in the universal core; empty or omitted configuration
  must not be presented as enforcement.

## Code intelligence

When source code exists, prefer a healthy structural index for architecture, call paths, dependencies and
impact. Use a line-level source tool only when the structural result is stale, ambiguous, incomplete, or
exact editable lines are required. Use direct reads for documentation, JSON, YAML, TOML, assets and
generated files.

Tool presence does not prove a fresh index, a running process, an available tool list, or an authenticated
operation. Record each signal separately.

Graphify is retired from the active runtime. If a future manual audit approves its license, installation,
cost and explicit rebuild, it may produce optional evidence. Its absence is `SKIP`, never `FAIL`.

## Scanners and dead code

Dependency audits, vulnerability scanners and static analysis create candidates to investigate. They do
not authorize automatic upgrades, deletion or suppression. Verify exploitability, compatibility, license,
rollback and affected behavior.

Dead-code tools may identify candidates. Deletion requires ownership review, usage evidence, tests and a
normal change. Prefer debt reduction by contact over unbounded cleanup.

## Cost and licensing

The universal bootstrap uses Node, npm, Git and the pinned OpenSpec dependency. The constructor artifact is
private and unlicensed until its owner makes a distribution decision. Do not publish it.

The exact OpenSpec `1.6.0` install script is explicitly approved in `package.json` after source review. The
approval is version-pinned; do not broaden it or approve a new lifecycle script without reviewing the
source, lock integrity, behavior, license and rollback. npm 11 must not report unreviewed lifecycle scripts
during the clean fixture install.

Before enabling any external service or optional tool, record:

- current license and compatibility;
- free-tier limits and likely paid threshold;
- data residency and privacy terms;
- maintenance and exit cost;
- vendor lock-in and export path;
- owner approval and rollback.

No optional provider may block the universal core.
