## ADDED Requirements

### Requirement: La matriz advisory conserva pausas de deuda como señal explícita

El workflow advisory SHALL ejecutar `debt:check` en cada entrada de su matriz. Una pausa reconocida SHALL
publicarse como warning con recuperación y SHALL NOT fallar ese job; los checks contractuales SHALL seguir
fallando ante error.

#### Scenario: Pausa legítima de otro plan

- **WHEN** `debt:check` termina distinto de cero porque UX/UI está pausado y el consumidor pasa sus smokes
- **THEN** el job Advisory termina verde con una advertencia explícita
- **AND** la salida conserva la causa y el issue de saneamiento trazable

#### Scenario: Contrato consumidor roto

- **WHEN** falla instalación, contrato público o documentación fijada
- **THEN** el job Advisory termina con fallo
- **AND** no degrada ese error a warning
