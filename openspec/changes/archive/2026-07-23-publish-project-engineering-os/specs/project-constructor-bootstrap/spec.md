## ADDED Requirements

### Requirement: El bootstrap acepta una release pública verificable

El constructor SHALL poder iniciar desde una versión exacta de `create-project-engineering-os` resuelta
por npm/npx o desde el tarball equivalente de GitHub Release. Antes de escribir SHALL demostrar identidad
de versión y compatibilidad, y SHALL NOT depender de instalación global o path de PlanearIA.

#### Scenario: Ejecución por npx fijado

- **WHEN** un repositorio vacío ejecuta una versión exacta
- **THEN** preflight y state registran esa misma versión
- **AND** bootstrap continúa con el paquete resuelto

#### Scenario: Tarball de GitHub Release

- **WHEN** se usa el asset contractual con checksum esperado
- **THEN** el CLI verifica identidad antes de planear escrituras
- **AND** rechaza un tarball alterado

#### Scenario: Runtime incompatible

- **WHEN** Node no satisface engines
- **THEN** el preflight falla antes de escribir
- **AND** explica una recuperación manual sin instalar Node

### Requirement: El bootstrap instala control de deuda sin inventar producto ni hallazgos

Etapa A SHALL materializar política, schemas, scripts/gates y registro vacío para
`project-os debt`, junto al núcleo universal. SHALL NOT crear assessments, deuda, issue de saneamiento,
perfiles técnicos o preguntas de producto durante bootstrap.

#### Scenario: Bootstrap greenfield

- **WHEN** termina Etapa A en una fixture vacía
- **THEN** `project-os debt check` pasa con registro válido y cero items
- **AND** no existe issue remoto creado por deuda

#### Scenario: Segundo run

- **WHEN** se repite bootstrap con política seed-once personalizada
- **THEN** conserva la personalización y produce cero drift
- **AND** no duplica gates, scripts ni metadata
