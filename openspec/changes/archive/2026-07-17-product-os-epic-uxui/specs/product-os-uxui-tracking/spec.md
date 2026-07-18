# Delta Spec: product-os-uxui-tracking

## ADDED Requirements

### Requirement: El plan UX/UI tiene un epic con sub-issues en Product OS

PlanearIA SHALL mantener el issue epic `[Plan Maestro] UX/UI y Navegacion Global` con labels `epic`, `ux-ui` y `plan-maestro`, agregado al Project `PlanearIA Product OS`. Los issues del plan (#78-#89 y los que se creen en olas futuras) SHALL enlazarse como sub-issues nativos del epic, de modo que la vista Roadmap pueda agruparlos por parent issue. El enlazado SHALL incluir retroactivamente los issues cerrados de Ola 0.

#### Scenario: Mantenedor consulta el Roadmap del plan UX/UI

- **WHEN** un mantenedor abre la vista Roadmap de `PlanearIA Product OS` agrupada por parent issue
- **THEN** los issues #78-#89 aparecen agrupados bajo el epic `[Plan Maestro] UX/UI y Navegacion Global`
- **AND** los cerrados de Ola 0 (#78, #79, #80) forman parte del grupo como historial

#### Scenario: Se crea un issue nuevo de una ola futura

- **WHEN** una ola futura arranca y se crea un issue de esa ola
- **THEN** el issue se enlaza como sub-issue del epic al crearse
- **AND** el epic no se duplica ni se crea un epic adicional por ola

### Requirement: Los milestones de ola siguen la nomenclatura UX/UI Ola N y se crean lazy

Los milestones de ola del plan UX/UI SHALL nombrarse `UX/UI Ola N - <nombre de la ola en el plan maestro>` y SHALL crearse solo cuando la ola este activa o sea la siguiente inmediata. `UX/UI Ola 0 - Fundaciones` SHALL contener #78, #79 y #80 y permanecer cerrado como registro historico. `UX/UI Ola 1 - Shell y componentes` SHALL permanecer abierto con #81, #82, #83 y #84 mientras la ola siga activa. PlanearIA SHALL NOT crear por adelantado milestones de olas no activas.

#### Scenario: Ola 0 queda registrada como historial

- **WHEN** se consulta el milestone `UX/UI Ola 0 - Fundaciones` por GitHub CLI
- **THEN** contiene exactamente #78, #79 y #80, todos cerrados
- **AND** el milestone esta cerrado y conserva sus issues como evidencia

#### Scenario: Arranca una ola futura

- **WHEN** la Ola 2 se activa segun el plan maestro
- **THEN** se crea el milestone `UX/UI Ola 2 - Nucleo visible` con los nombres literales del plan
- **AND** los issues de esa ola reciben ese milestone y el parentesco con el epic

### Requirement: El milestone Ciclo 3 agrupa el trabajo transversal sin renombrarse

El milestone `Ciclo 3 - UX/Navegacion Global` SHALL conservar su nombre exacto y permanecer abierto como agrupador del trabajo transversal del plan UX/UI que no pertenece a una ola concreta (hitos pre-Ola 2, docs de ground truth, decisiones y dependencias). SHALL cerrarse solo cuando el plan UX/UI cierre y no conserve issues abiertos.

#### Scenario: Un issue transversal del plan recibe milestone

- **WHEN** un issue del plan UX/UI no pertenece a una ola concreta (por ejemplo #85-#89)
- **THEN** recibe el milestone `Ciclo 3 - UX/Navegacion Global` sin que el milestone se renombre
- **AND** los milestones `Ciclo 4 - Auth y Seguridad` y `Readiness Gate M` no se modifican

### Requirement: La convencion de seguimiento UX/UI queda documentada y las mutaciones dejan evidencia

`Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` SHALL documentar la convencion completa (epic con sub-issues, nomenclatura `UX/UI Ola N`, creacion lazy, transversales en Ciclo 3, prohibicion de renombrar) de forma reutilizable para olas futuras. La fila DA1 de `decisiones-abiertas.md` SHALL registrar la resolucion con fecha e issue sin reescribir la auditoria. Las mutaciones de GitHub de este seguimiento SHALL capturar el estado previo, ejecutarse de forma idempotente y registrar el estado posterior; SHALL NOT borrar ni fusionar issues, items o milestones.

#### Scenario: Mantenedor activa una ola siguiendo la guia

- **WHEN** un mantenedor consulta `GITHUB_PRODUCT_OS.md` al activar una ola
- **THEN** encuentra los pasos exactos (crear milestone `UX/UI Ola N - <nombre>`, asignar issues, enlazar sub-issues del epic)
- **AND** la guia indica que los milestones existentes no se renombran

#### Scenario: El estado externo ya coincide con la convencion

- **WHEN** una consulta previa muestra que un issue ya tiene el milestone o parentesco requerido
- **THEN** la mutacion se omite y se registra la conformidad como evidencia
- **AND** no se repite una mutacion innecesaria ni se sobrescribe estado ajeno
