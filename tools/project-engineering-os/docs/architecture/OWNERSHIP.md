# Ownership model

| Surface | Owner | Update path |
| --- | --- | --- |
| CLI, schemas, blueprint, tests and public docs | Upstream | Issue, SDD change, protected PR and release |
| Generated OPSX workflows | OpenSpec CLI | Exact local OpenSpec version and official update command |
| Constructor-managed files | Upstream release | `upgrade --check`, reviewed transaction, optional PR |
| Seed-once debt policy | Consumer | Consumer decision and local SDD flow |
| Human overlays and product code | Consumer | Consumer workflow |
| Debt assessments and registry | Consumer evidence | `project-os debt capture/sync`; never overwritten by rollback |

The upstream never chooses a consumer's product license, stack, cloud, database, UI framework or domain.
Consumer acceptance specs may pin expected behavior, but runtime evolution starts upstream.
