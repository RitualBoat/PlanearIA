# openspec-readiness-gates Delta

## ADDED Requirements

### Requirement: El gate pre-propose bloquea planes pausados por deuda

Cuando el motor de deuda esta configurado, el gate read-only de propose SHALL resolver el plan duenio
del issue mediante el ruteo declarado en la politica de deuda y SHALL fallar con causa y recuperacion
cuando ese plan este pausado, salvo que el issue lleve una label de la allowlist de saneamiento,
seguridad, incidentes o rollback. Ante deuda transversal critica, el bloqueo SHALL aplicar a todos los
planes. Si el namespace de deuda no existe, el gate SHALL reportar la verificacion como omitida de
forma explicita, nunca como exito implicito.

#### Scenario: Feature de plan pausado

- **WHEN** el gate de propose evalua un issue cuyo plan esta pausado por presupuesto agotado
- **THEN** el gate falla nombrando el plan, el trigger activo y el issue de remediacion a ejecutar

#### Scenario: Saneamiento permitido

- **WHEN** el issue lleva la label de remediacion declarada en la politica
- **THEN** el gate de deuda pasa aunque el plan este pausado

#### Scenario: Plan distinto no afectado

- **WHEN** el plan del issue no tiene triggers activos y otro plan si esta pausado
- **THEN** el gate de deuda pasa para ese issue

#### Scenario: Motor no configurado

- **WHEN** el repositorio no tiene `.project-os/debt/config.json`
- **THEN** el gate reporta la verificacion de deuda como omitida con esa causa

### Requirement: El gate de archive exige un assessment de deuda sin bloqueos

Cuando el motor de deuda esta configurado, el gate read-only de archive SHALL exigir un assessment
valido del flujo, incluso con resultado `clean`, y SHALL fallar cuando el flujo tenga Blockers o
Majors abiertos, cuando exista deuda transversal critica abierta o cuando un change ajeno al
saneamiento agregue deuda confirmada nueva a un plan pausado. El gate SHALL seguir siendo read-only y
SHALL NOT ejecutar contenido declarado por el registro de deuda.

#### Scenario: Cierre limpio

- **WHEN** el change tiene un assessment valido con resultado `clean`
- **THEN** la verificacion de deuda del archive pasa

#### Scenario: Blocker abierto del flujo

- **WHEN** el assessment del change confirma un Blocker o Major abierto
- **THEN** el gate de archive falla con el item, su evidencia y la recuperacion

#### Scenario: Assessment ausente

- **WHEN** el change no tiene assessment capturado
- **THEN** el gate falla indicando el comando de captura como recuperacion
