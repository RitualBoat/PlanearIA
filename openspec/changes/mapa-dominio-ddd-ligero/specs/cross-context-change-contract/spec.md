## ADDED Requirements

### Requirement: Todo diseño declara sus contextos afectados

Las instrucciones de `design.md` SHALL requerir que cada change identifique los bounded contexts afectados con el mapa DDD estratégico ligero. Un change de un solo contexto SHALL declarar explícitamente que no requiere contrato cruzado.

#### Scenario: Diseño intra-contexto

- **WHEN** un change modifica entidades y reglas de un único bounded context
- **THEN** su diseño declara el contexto afectado y la ausencia de contrato cruzado sin introducir una integración ficticia

### Requirement: Diseño cruzado declara contrato y ownership

Las instrucciones de `design.md` SHALL requerir que un change que afecta más de un bounded context declare owner de cada dato compartido, consumidores, dirección y forma del contrato, compatibilidad y las invariantes que debe preservar. El diseño SHALL respetar el aislamiento por `userId`, `src/sync` para datos académicos sincronizables y el gateway backend para IA cuando sean aplicables.

#### Scenario: Diseño conecta Planeación con Classroom

- **WHEN** un change permite que una Planeación se use o asigne desde Classroom
- **THEN** el diseño identifica los contextos afectados, mantiene el owner de la Planeación, declara la referencia o contrato hacia Classroom y describe cómo conserva las invariantes relevantes

### Requirement: El contrato es proporcional y no crea arquitectura no solicitada

Las instrucciones de `design.md` SHALL indicar que un contrato cruzado puede documentarse con las interfaces, rutas, eventos existentes o referencias por ID necesarias para el change. SHALL NOT exigir microservicios, CQRS, event sourcing, colas paralelas ni nuevos proveedores globales solo para cumplir la sección.

#### Scenario: Cambio documental o local no necesita integración nueva

- **WHEN** un change de un solo contexto no consume ni modifica datos de otro límite
- **THEN** el diseño registra una declaración breve de no contrato y mantiene el alcance sin capas técnicas adicionales
