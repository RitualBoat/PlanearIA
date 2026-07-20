# debt-control-registry Delta

## ADDED Requirements

### Requirement: El registro canonico separa estado actual de evidencia historica

El repositorio SHALL mantener un registro machine-readable de deuda tecnica bajo `.project-os/debt/`
compuesto por `config.json` (politica), `registry.json` (fuente canonica del estado actual) y
`assessments/` (evidencia historica inmutable por flujo SDD). El registro SHALL validar contra un
esquema versionado de forma determinista y SHALL rechazar con causa y recuperacion cualquier archivo
que no cumpla el esquema. Los items SHALL conservar su historial al resolverse: el motor SHALL NOT
borrar items ni assessments; los cierres se registran con estado y resolucion trazable.

#### Scenario: Registro valido

- **WHEN** un comando del motor carga un `registry.json` conforme al esquema
- **THEN** el comando opera y reporta el estado derivado sin modificar archivos

#### Scenario: Registro invalido o ausente con motor configurado

- **WHEN** `config.json` existe pero `registry.json` esta corrupto o fue borrado
- **THEN** el comando reporta FAIL nombrando el archivo y una recuperacion concreta
- **AND** la pausa de planes no se levanta por la ausencia del registro

#### Scenario: Resolucion conserva historia

- **WHEN** un item abierto se marca como resuelto con evidencia
- **THEN** el item permanece en el registro con estado `resolved` y su resolucion trazable
- **AND** sus occurrences y evidencia historica quedan intactos

### Requirement: Los items usan IDs estables que deduplican reapariciones

Cada item SHALL tener un ID estable derivado deterministicamente de su categoria, artefacto
normalizado y titulo normalizado. Cuando un hallazgo con el mismo ID reaparece en otro flujo, el motor
SHALL agregar un occurrence al item existente en lugar de crear un item nuevo. Un candidato clasificado
como `duplicate` SHALL referenciar el ID del item vigente que lo representa.

#### Scenario: Hallazgo repetido en otro flujo

- **WHEN** un assessment confirma un hallazgo cuyo ID ya existe en el registro
- **THEN** el item existente gana un occurrence con el flujo y la fecha
- **AND** el conteo de items del registro no aumenta

#### Scenario: Candidato duplicado

- **WHEN** un candidato se clasifica como `duplicate` de un item vigente
- **THEN** el assessment registra la referencia al ID existente
- **AND** el candidato no consume presupuesto ni crea item nuevo

### Requirement: Los assessments son inmutables y la captura es idempotente

Todo cierre de flujo SDD SHALL producir un assessment valido, incluso con resultado `clean`. El comando
de captura SHALL ser idempotente por contenido: reejecutar con el mismo input SHALL ser un no-op
exitoso sin drift, y un input distinto para un flujo ya capturado SHALL fallar con recuperacion en
lugar de sobreescribir evidencia historica. Una ejecucion interrumpida SHALL poder reejecutarse hasta
converger y el comando read-only de verificacion SHALL detectar un assessment sin reflejar en el
registro.

#### Scenario: Segundo run sin drift

- **WHEN** la captura se ejecuta dos veces con el mismo input
- **THEN** la segunda ejecucion no modifica ningun archivo y reporta el no-op

#### Scenario: Intento de reescritura historica

- **WHEN** la captura recibe un input distinto para un flujo ya capturado
- **THEN** falla con causa y recuperacion sin tocar el assessment existente

#### Scenario: Ejecucion parcial recuperable

- **WHEN** una captura se interrumpe despues de escribir el assessment y antes de actualizar el registro
- **THEN** la verificacion read-only nombra la discrepancia con recuperacion
- **AND** reejecutar la captura converge al estado final sin duplicar items

### Requirement: Las excepciones son completas, temporales y visibles

Una excepcion sobre un item SHALL declarar motivo, owner, aprobador, expiracion ISO `YYYY-MM-DD` y
recuperacion. El motor SHALL rechazar excepciones incompletas o mal formadas y SHALL tratar una
excepcion expirada sobre un item abierto como disparador de saneamiento, nunca como silencio
permanente.

#### Scenario: Excepcion valida

- **WHEN** un item abierto declara una excepcion completa y vigente
- **THEN** el item queda en estado `accepted-exception` y no consume presupuesto mientras la excepcion viva

#### Scenario: Excepcion expirada

- **WHEN** la fecha actual supera la expiracion de una excepcion
- **THEN** el motor reporta el vencimiento como trigger de saneamiento con el item y su recuperacion
