## ADDED Requirements

### Requirement: El motor de deuda se inicializa vacío y configurable

Etapa A SHALL instalar política, schemas, gates y registro vacío del Debt Control Loop dentro del paquete
principal. SHALL NOT inventar hallazgos, importar IDs de PlanearIA ni crear un issue de saneamiento sin un
trigger verificable. Umbral, owners, planes, labels y modo GitHub SHALL ser configurables.

#### Scenario: Repositorio greenfield

- **WHEN** termina bootstrap sin assessments con deuda
- **THEN** `project-os debt check` reporta `PASS` y cero deuda abierta
- **AND** no crea issue remoto

#### Scenario: Política personalizada por el proyecto

- **WHEN** el owner edita la política seed-once
- **THEN** sync/upgrade valida pero no sobrescribe esa decisión
- **AND** aplica los nuevos umbrales en el siguiente check

### Requirement: Assessments son inmutables, verificables e idempotentes

Cada cierre SDD SHALL producir un assessment con flow, fecha, kind, result, verificación y candidatos o
resoluciones. Reusar un flow con contenido distinto SHALL fallar. Capturar dos veces el mismo contenido
SHALL ser no-op y SHALL NOT duplicar items u occurrences.

#### Scenario: Primera captura

- **WHEN** un assessment válido no reflejado se captura
- **THEN** actualiza el registro de forma atómica y enlaza su hash
- **AND** preserva el archivo como evidencia histórica

#### Scenario: Segundo run idéntico

- **WHEN** se repite capture con el mismo assessment
- **THEN** termina sin drift
- **AND** no agrega otra occurrence del mismo flow

#### Scenario: Historia reescrita

- **WHEN** el mismo flow contiene otro hash o semántica
- **THEN** capture falla con recuperación
- **AND** no modifica registro ni assessment previo

### Requirement: Candidatos requieren clasificación y evidencia

El motor SHALL aceptar exactamente `defect`, `technical-debt`, `external-risk`, `decision-required`,
`optional-improvement`, `false-positive` y `duplicate`. Warnings, TODOs y scanners SHALL ser candidatos,
no deuda confirmada ni autorización de corrección. Cada candidato SHALL tener verificación vigente,
consecuencia, owner de plan y remediación o refutación.

#### Scenario: Scanner reporta advisory

- **WHEN** un flujo recibe salida de `npm audit` u otro scanner
- **THEN** exige reproducir/clasificar el riesgo antes de registrar deuda
- **AND** no ejecuta un fix automático

#### Scenario: Falso positivo demostrado

- **WHEN** evidencia vigente refuta el candidato
- **THEN** assessment conserva categoría y justificación
- **AND** no consume presupuesto ni abre saneamiento

#### Scenario: Categoría desconocida

- **WHEN** un candidato usa una octava categoría
- **THEN** la validación falla nombrando el campo
- **AND** no degrada el valor a technical-debt

### Requirement: Presupuesto y triggers pausan solo el alcance necesario

El motor SHALL calcular presupuesto por plan con Minor=1, Minor recurrente/transversal=2 y umbral default
5. SHALL disparar saneamiento por presupuesto, cinco flujos residuales, recurrencia en tres flujos,
excepción vencida, deuda transversal crítica o Blocker/Major verificado. La pausa SHALL afectar solo al
plan owner, excepto deuda transversal crítica.

#### Scenario: Umbral no alcanzado

- **WHEN** un plan acumula cuatro unidades sin otro trigger
- **THEN** permanece activo
- **AND** muestra una unidad restante

#### Scenario: Umbral alcanzado

- **WHEN** el plan llega a cinco unidades
- **THEN** queda pausado y pre-propose bloquea changes de producto de ese plan
- **AND** permite labels configuradas de saneamiento, seguridad, incidente o rollback

#### Scenario: Deuda transversal crítica

- **WHEN** se confirma un item crítico transversal
- **THEN** pausa todos los planes
- **AND** la recuperación exige resolverlo, refutarlo o excepcionarlo válidamente

### Requirement: Excepciones son completas, temporales y no producen PASS falso

Una excepción SHALL contener ID, motivo, owner, aprobador, expiración ISO y recuperación. Excepción
vigente SHALL dejar el item `accepted-exception`, sin consumir presupuesto, pero SHALL continuar visible.
Excepción vencida o incompleta SHALL fallar y reactivar su impacto.

#### Scenario: Excepción vigente

- **WHEN** capture aplica una excepción completa dentro del horizonte permitido
- **THEN** el registro la conserva con estado `accepted-exception`
- **AND** `check` no la presenta como deuda resuelta ni `PASS` individual

#### Scenario: Excepción vencida

- **WHEN** la fecha actual supera expiración
- **THEN** el item vuelve a contar y activa el trigger correspondiente
- **AND** el reporte muestra recovery sin renovarla automáticamente

### Requirement: GitHub opera en required, advisory u off sin duplicar issues

El modo SHALL ser `required`, `advisory`, `off` o `auto` resoluble. Cuando un plan se pausa, sync SHALL
crear/reutilizar un issue de saneamiento por plan con regla NO GENERAR MÁS DEUDA TÉCNICA y bloque
administrado idempotente. Indisponibilidad SHALL producir `FAIL`, `WARN` o `SKIP` según modo, nunca `PASS`.

#### Scenario: Required sin autenticación

- **WHEN** GitHub es required y gh no puede operar
- **THEN** sync/check relacionado falla con recuperación
- **AND** no afirma que el Project quedó actualizado

#### Scenario: Advisory sin autenticación

- **WHEN** GitHub es advisory y el estado local es válido
- **THEN** reporta `WARN` con la operación remota pendiente
- **AND** preserva el gate local sin inventar URL

#### Scenario: Reejecución con issue existente

- **WHEN** el issue administrado del plan ya existe
- **THEN** actualiza únicamente su bloque administrado
- **AND** conserva texto humano y no crea duplicado

### Requirement: Gates SDD exigen assessment y bloquean deuda severa o nueva

Pre-propose SHALL evaluar pausas antes de crear un change. Pre-archive SHALL exigir assessment reflejado,
tareas/evidencia y SHALL bloquear Blocker/Major abierto o deuda nueva nacida en saneamiento. Todo cierre,
incluido `clean`, SHALL capturarse antes de archive.

#### Scenario: Change sin assessment

- **WHEN** se ejecuta pre-archive sin assessment del flow
- **THEN** el gate falla y nombra el comando de captura
- **AND** no archiva ni crea un assessment automáticamente

#### Scenario: Major resuelto dentro del flujo

- **WHEN** un assessment registra y resuelve un Major con evidencia
- **THEN** el gate reconoce la resolución trazable
- **AND** no queda bloqueado permanentemente

#### Scenario: Saneamiento genera deuda nueva

- **WHEN** un flow de remediation deja un item nuevo abierto
- **THEN** pre-archive falla aunque el presupuesto haya bajado
- **AND** exige resolver o gobernar el nuevo hallazgo

### Requirement: Check y handoff preservan contexto sin secretos

`project-os debt check` SHALL ser read-only y ofrecer salida humana/JSON equivalente. Handoff SHALL generar
un prompt reproducible desde datos canónicos, recomendar mismo chat o chat nuevo según salud del contexto,
y redactar tokens, credenciales y evidencia sensible.

#### Scenario: Check repetido

- **WHEN** se ejecuta dos veces sobre el mismo estado
- **THEN** veredicto, orden, causas y recuperación son equivalentes
- **AND** ningún archivo cambia

#### Scenario: Evidencia contiene un secreto

- **WHEN** el registro referencia texto con patrón sensible
- **THEN** handoff lo reemplaza por redacción
- **AND** el valor original no aparece en salida, archivo ni log

#### Scenario: Contexto requiere tarea nueva

- **WHEN** hay saneamiento, pausa, Blocker/Major o cambio grande
- **THEN** handoff recomienda tarea nueva y explica la razón
- **AND** incluye un prompt accionable con fuentes, gates y retorno esperado
