# Engineering environment

This index is the operational entry point for the repository before product discovery.

## Prepare and verify

- [Bootstrap runbook](RUNBOOK_BOOTSTRAP.md)
- [Prompt 00: prepare an empty repository](PROMPT_00_BOOTSTRAP_ENTORNO.md)
- [Prompt 01: begin discovery after bootstrap approval](PROMPT_01_DISCOVERY_PROYECTO.md)
- [Manual intervention guide](GUIA_MANUAL_USUARIO.md)
- [Update and rollback](ROLLBACK.md)

## Govern work

- [SDD, DoR, DoD and evidence flow](SDD_WORKFLOW.md)
- [Executable readiness gates and metadata](READINESS_GATES.md)
- [Sources of truth and drift](SOURCES_OF_TRUTH.md)
- [Evidence profiles](EVIDENCE_PROFILES.md)
- [Harness and operating-system compatibility](COMPATIBILITY_MATRIX.md)
- [Tool, permission and secret policy](TOOLS_POLICY.md)
- [Context engineering](CONTEXT_ENGINEERING.md)

## Canonical machine-readable sources

- `.project-os/profiles.json`
- `.project-os/harness-capabilities.json`
- `.project-os/mcp.json`
- `.project-os/github/product-os.json`
- `.project-os/github/discovery-issues.json`

The constructor owns generated mirrors. Project-owned canonical files are seeded once and then changed
through an explicit repository decision. OpenSpec owns OPSX workflows separately.
