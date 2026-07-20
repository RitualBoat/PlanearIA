# debt-control-github-sync Delta

## ADDED Requirements

### Requirement: Un issue de remediacion idempotente por plan

El motor SHALL mantener como maximo un issue de remediacion abierto por plan, identificado por un
marcador estable en su cuerpo. Al sincronizar, el motor SHALL reutilizar y actualizar el issue
existente en lugar de crear duplicados, y reejecutar la sincronizacion sin cambios de estado SHALL NOT
producir ediciones, comentarios ni items de Project duplicados. El cuerpo del issue SHALL incluir la
regla obligatoria NO GENERAR MAS DEUDA TECNICA, los items abiertos con ID, severidad, unidades y
evidencia, la exigencia de revisiones adversariales o entrevistas adicionales hasta resolver Blockers
y Majors, la guia de dividir la implementacion en subchanges cohesivos y las condiciones de
reanudacion del plan.

#### Scenario: Primera sincronizacion con deuda

- **WHEN** un plan pausado no tiene issue de remediacion abierto
- **THEN** la sincronizacion crea un issue con el marcador del plan y el contenido obligatorio

#### Scenario: Sincronizacion repetida

- **WHEN** la sincronizacion se ejecuta de nuevo sin cambios en el registro
- **THEN** no se crean issues nuevos ni se edita el existente
- **AND** la salida reporta el no-op

#### Scenario: Estado nuevo sobre issue existente

- **WHEN** el registro gana un item abierto y el plan ya tiene issue de remediacion
- **THEN** la sincronizacion actualiza el bloque administrado del cuerpo del issue existente

### Requirement: Los modos GitHub degradan de forma explicita sin falsos verdes

La integracion GitHub SHALL soportar exactamente tres modos operativos: `required`, `advisory` y
`off`. La configuracion SHALL admitir ademas el valor `auto`, que SHALL resolverse de forma
determinista y sin red a `required` cuando existe el manifest local del Project OS de GitHub y a
`off` en caso contrario; `auto` nunca es un cuarto comportamiento en runtime. En `required`, la indisponibilidad de `gh`, la falta de autenticacion o un fallo de API SHALL
producir FAIL con recuperacion concreta. En `advisory`, la misma condicion SHALL producir WARN
conservando el expediente local. En `off`, el motor SHALL reportar SKIP explicito y conservar solo el
registro local. Ninguna condicion de indisponibilidad SHALL reportarse como PASS, y la ausencia de
Project o checks SHALL NOT interpretarse como exito.

#### Scenario: Required sin autenticacion

- **WHEN** el modo es `required` y `gh` no esta autenticado
- **THEN** el comando reporta FAIL nombrando la causa y como autenticar

#### Scenario: Advisory sin GitHub

- **WHEN** el modo es `advisory` y GitHub no responde
- **THEN** el comando reporta WARN, conserva el expediente local y explica el paso manual pendiente

#### Scenario: Off

- **WHEN** el modo es `off`
- **THEN** el comando reporta SKIP explicito y no intenta llamadas a GitHub

### Requirement: La automatizacion GitHub es de minimo privilegio y sin ejecucion de contenido

La sincronizacion SHALL invocar `gh` con argumentos explicitos sin shell, SHALL NOT ejecutar texto
proveniente de issues o del registro como comandos, SHALL NOT exponer secretos en cuerpos, logs o
salidas, y SHALL limitar las mutaciones a los issues y labels del expediente de deuda.

#### Scenario: Contenido hostil en el registro

- **WHEN** un item contiene texto con apariencia de comando o metacaracteres de shell
- **THEN** la sincronizacion lo trata como dato inerte del cuerpo del issue
- **AND** ninguna invocacion pasa por interpretes de shell
