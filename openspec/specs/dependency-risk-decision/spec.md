# dependency-risk-decision Specification

## Purpose
Ensure low supply-chain-score dependencies flagged by React Doctor (such as `pdfjs-dist`) carry an explicit, validated keep/migrate/replace/accept decision rather than silent suppression.

## Requirements
### Requirement: Low supply-chain score dependencies have explicit decisions
Dependencies flagged by React Doctor for low supply-chain score SHALL have a documented keep, migrate, replace, or accepted-risk decision.

#### Scenario: `pdfjs-dist` remains in the app
- **WHEN** `pdfjs-dist` remains in `package.json`
- **THEN** the change records why it is still needed
- **AND** the risk is accepted with evidence, owner, and review date or mitigation.

#### Scenario: `pdfjs-dist` is migrated or replaced
- **WHEN** the implementation moves PDF extraction to another boundary or dependency
- **THEN** affected import/export flows still pass validation
- **AND** the replacement does not expose provider keys, add paid infrastructure, or break offline-first product behavior without explicit approval.

### Requirement: Dependency risk is not hidden by scanner suppression alone
A dependency finding SHALL NOT be silenced without a written product and technical rationale.

#### Scenario: React Doctor no longer reports the dependency
- **WHEN** the final scan does not show the low supply-chain finding
- **THEN** the evidence explains whether the dependency was removed, replaced, excluded, or accepted
- **AND** the explanation is tied to the actual PlanearIA product flow.

### Requirement: Validation includes affected PDF import/export behavior
Any dependency decision affecting PDF behavior SHALL be validated against the user-facing import/export path it supports.

#### Scenario: PDF-related dependency decision is made
- **WHEN** the dependency decision changes runtime behavior
- **THEN** affected tests or a documented manual smoke check verify the PDF path still behaves as expected.
