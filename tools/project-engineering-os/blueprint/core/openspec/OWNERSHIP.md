# OpenSpec and OPSX ownership

OpenSpec `1.6.0`, installed in the repository lockfile, is the only owner of OPSX workflows and related
agent integration. The general project-constructor renderer must not generate, patch, move, delete, adopt,
or restore those files.

`package.json` approves the install script only for `@fission-ai/openspec@1.6.0`. The reviewed script does
not install shell completions or alter repository files; it only prints an opt-in hint outside CI and
suppresses errors. A dependency update invalidates this review and requires a new explicit approval.

## Initial generation

```bash
npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode
npm run project-os:opsx:adapt
```

The explicit list is the complete supported harness set. Do not replace it with `--tools all` or an
interactive, environment-dependent selection. Run the neutral adapter only after the official CLI has
generated the files, then review the diff.

## Deliberate OpenSpec updates

```bash
npm exec --yes=false -- openspec update
npm run project-os:opsx:adapt
```

The first command remains the external writer. The adapter may only stabilize the explicitly delimited
neutral `propose`, `apply`, and `archive` blocks declared in `openspec-ownership.json`; it never owns a
complete OPSX file. Never use a global binary or floating fallback.

## Separate read-only check

The OPSX checker:

1. resolves `node_modules/@fission-ai/openspec/package.json`;
2. confirms version `1.6.0` and the effective locked engine `^20.20.0 || >=22.22.0`;
3. reads `.project-os/openspec-ownership.json`;
4. discovers generated files only under the declared globs;
5. verifies the files identify OpenSpec as owner and contain no constructor-managed blocks;
6. reports upstream-shape drift with the applicable init/update and adapter commands above.

Run it through the installed runtime:

```bash
npm run project-os:opsx:check
```

If official output changes shape after a deliberate dependency update, the check fails until this contract,
the neutral adapter, and their fixtures are reviewed. General `sync` still does not repair the files.

No OPSX workflow content exists in the blueprint.
