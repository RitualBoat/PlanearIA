# Evidence profiles

The machine-readable source is `.project-os/profiles.json`. Every profile declares automatic validations,
manual evidence, negative cases, rollback, objective `N/A` conditions, and a closure gate.

## Active before discovery

- `documentation`: required documents, links, two-hop findability, neutrality and drift review.
- `harness-tooling`: tests, deterministic sync/check, five-harness capability matrix, doctor JSON,
  idempotence and recovery.

## Available but inactive

- `ui`
- `backend-api`
- `auth-security`
- `data-migration-sync`
- `ai`
- `infra-deploy`
- `library-cli`

An installed tool does not activate a profile. Activation requires an approved post-discovery technical
decision. Rendering an inactive profile must not install dependencies or infer a stack.

`N/A` is accepted only when a declared condition is true and the issue or pull request records the
justification. It cannot hide an applicable required check.

Signals tied to a particular framework, browser, design source, provider, data system or deployment
platform are conditional. They begin advisory when appropriate and become blocking only after a stable
baseline and explicit policy.
