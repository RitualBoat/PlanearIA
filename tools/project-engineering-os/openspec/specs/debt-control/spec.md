# Debt Control

## Requirements

### Requirement: Residual findings are classified, not narrated

Every SDD close SHALL capture an immutable assessment, including a clean result. Warnings and scanner
output SHALL remain candidates until evidence classifies, refutes, resolves or exceptions them.

#### Scenario: A candidate cannot be verified

- **WHEN** current evidence does not establish impact
- **THEN** it is not charged as technical debt
- **AND** the assessment records the classification and evidence

### Requirement: Budget pauses the owning plan

Verified Blockers/Majors, expired exceptions, recurrence, five residual flows or budget threshold SHALL
trigger one idempotent remediation issue. Only cross-cutting critical debt SHALL pause all plans.

#### Scenario: A plan reaches its budget

- **WHEN** the registry evaluation reaches the configured threshold
- **THEN** pre-propose blocks ordinary product work for that plan
- **AND** permits remediation, security, incident or rollback work

### Requirement: Debt data survives runtime operations

Policy, registry and assessments SHALL remain project-owned and SHALL NOT be deleted by constructor
upgrade or rollback unless they were explicit operations with verified backups.

#### Scenario: Constructor upgrade is rolled back

- **WHEN** a package upgrade transaction is reverted
- **THEN** debt data outside the operation remains byte-identical
- **AND** pause state is still derived from the registry

