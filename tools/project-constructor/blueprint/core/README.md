# Repository environment

This repository contains the universal engineering environment only. Product discovery has not started,
and no product stack or architecture has been selected.

## Start here

- [Engineering operating guide](docs/engineering/README.md)
- [Bootstrap runbook](docs/engineering/RUNBOOK_BOOTSTRAP.md)
- [Manual intervention guide](docs/engineering/GUIA_MANUAL_USUARIO.md)
- [Prompt 00: prepare the environment](docs/engineering/PROMPT_00_BOOTSTRAP_ENTORNO.md)
- [Prompt 01: start discovery only after approval](docs/engineering/PROMPT_01_DISCOVERY_PROYECTO.md)
- [Agent instructions](AGENTS.md)

## Current stage

The environment is ready for discovery only when:

1. the constructor tests and `sync --check` pass;
2. the read-only doctor has no unexplained `FAIL`;
3. OpenSpec is installed locally at the exact locked version;
4. repository and GitHub manual gates have recorded evidence; and
5. no product-specific profile is active.

Run:

```bash
npm ci
npm run constructor:sync:check
npm run constructor:doctor
```

The doctor diagnoses. It never installs, repairs, authenticates, updates, reindexes, or starts services.
