# debt-control-policy Specification

## Purpose
TBD - created by archiving change control-deuda-tecnica-sdd. Update Purpose after archive.
## Requirements
### Requirement: Todo hallazgo residual termina en exactamente una categoria verificada

El motor SHALL clasificar cada hallazgo residual en exactamente una de siete categorias: `defect`,
`technical-debt`, `external-risk`, `decision-required`, `optional-improvement`, `false-positive` y
`duplicate`. Warnings, TODOs, salidas de scanners, `npm audit`, Knip, logs y notas historicas SHALL
tratarse como candidatos que solo entran al registro activo tras reproducirse, verificarse o
justificarse con evidencia vigente. El motor SHALL NOT convertir candidatos en deuda automaticamente
ni autorizar correcciones, borrados o actualizaciones solo por la salida de un scanner.

#### Scenario: Candidato de scanner sin verificar

- **WHEN** un scanner reporta un hallazgo que nadie ha reproducido
- **THEN** el candidato queda en el assessment sin consumir presupuesto
- **AND** el motor exige evidencia de verificacion antes de admitirlo como item abierto

#### Scenario: Candidato refutado

- **WHEN** la investigacion refuta un candidato con evidencia vigente
- **THEN** se clasifica como `false-positive` con la evidencia y no genera deuda

#### Scenario: Categoria invalida

- **WHEN** un assessment declara una categoria fuera de las siete canonicas
- **THEN** la validacion falla nombrando el candidato y las categorias admitidas

### Requirement: El presupuesto hibrido pondera severidad, recurrencia y transversalidad

El motor SHALL calcular por plan un presupuesto donde un Minor verificado vale 1 unidad y un Minor
recurrente o transversal vale 2. Los Blockers y Majors SHALL NOT consumir presupuesto: bloquean de
inmediato. `optional-improvement` SHALL valer 0 unidades. El saneamiento SHALL activarse cuando ocurra
primero cualquiera de: presupuesto del plan >= 5; cinco flujos SDD distintos cierran con deuda residual
del plan; el mismo hallazgo reaparece en tres flujos distintos; vence una excepcion; aparece deuda
transversal critica; existe un Blocker o Major verificado abierto.

#### Scenario: Presupuesto bajo el umbral

- **WHEN** un plan acumula items abiertos por un total de 4 unidades sin otros triggers
- **THEN** el estado del plan es activo y el motor reporta el presupuesto restante

#### Scenario: Umbral alcanzado

- **WHEN** el presupuesto del plan llega a 5 unidades
- **THEN** el motor declara el trigger de saneamiento y el plan queda pausado

#### Scenario: Major inmediato

- **WHEN** un assessment confirma un Major verificado
- **THEN** el bloqueo es inmediato sin esperar acumulacion de flujos ni unidades

#### Scenario: Recurrencia en tres flujos

- **WHEN** un item registra occurrences en tres flujos SDD distintos
- **THEN** el motor declara el trigger de recurrencia aunque el presupuesto siga bajo el umbral

### Requirement: La pausa afecta solo al plan duenio salvo deuda transversal critica

Un trigger SHALL pausar unicamente el plan maestro duenio de la deuda. Un item transversal critico
SHALL poder pausar todos los planes declarados. El estado de pausa SHALL derivarse deterministicamente
del registro y la politica: el motor SHALL NOT exponer un flag editable de pausa y SHALL NOT tratar el
borrado del registro como reanudacion.

#### Scenario: Deuda local no detiene otros planes

- **WHEN** el plan A cruza su umbral y el plan B no tiene triggers
- **THEN** solo el plan A queda pausado y el plan B sigue activo

#### Scenario: Deuda transversal critica

- **WHEN** se confirma un item transversal critico
- **THEN** todos los planes declarados quedan pausados hasta resolverlo o refutarlo

### Requirement: La reanudacion exige evidencia verificable

El motor SHALL reanudar un plan solo cuando la deuda que disparo la pausa fue resuelta, refutada o
aceptada mediante una excepcion valida; el presupuesto quedo bajo el umbral; no quedan Blockers,
Majors ni excepciones expiradas; y la remediacion no introdujo deuda nueva. El comando de verificacion
SHALL reportar que condicion falta cuando la reanudacion no procede.

#### Scenario: Remediacion completa

- **WHEN** los items del lote quedan resueltos con evidencia y el presupuesto baja del umbral
- **THEN** el motor reporta el plan como activo y nombra la evidencia de reanudacion

#### Scenario: Remediacion que introdujo deuda nueva

- **WHEN** el assessment del flujo de saneamiento agrega items confirmados nuevos
- **THEN** la reanudacion no procede y el motor lo reporta como condicion incumplida

