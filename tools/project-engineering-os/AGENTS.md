# Project Engineering OS contributor guide

This repository owns the neutral CLI, blueprint, schemas, Debt Control Loop, public documentation and
releases. Consumer repositories own their product, seed-once policy, overlays and unmanaged files.

For non-trivial changes:

1. create and enrich an issue;
2. pass Definition of Ready;
3. use the local fixed OpenSpec CLI;
4. implement from an approved spec;
5. add automated and manual evidence;
6. run adversarial review and debt assessment;
7. archive through OpenSpec and merge through a protected pull request.

Do not add product-specific frameworks, domains, providers, secrets, telemetry or paid services to the
universal core. `doctor`, `sync --check`, `upgrade --check` and `debt check` are read-only. Generated OPSX
workflows remain owned by the official OpenSpec CLI.

Start with [README.md](README.md), then [CONTRIBUTING.md](CONTRIBUTING.md) and
[docs/architecture/OWNERSHIP.md](docs/architecture/OWNERSHIP.md).
