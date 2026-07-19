## MODIFIED Requirements

### Requirement: El doctor comprueba las dependencias activas con contratos semanticos

El doctor SHALL evaluar Node/npm, Git/worktree, OpenSpec, visibilidad de `PlanearIA Product OS` mediante GitHub CLI, GitNexus, CodeGraph, paridad de harness, paridad y smoke de MCP activos, y compatibilidad Expo mediante una herramienta instalada/fijada del repositorio. El doctor SHALL usar comandos read-only y SHALL distinguir la salida de error de una salida sana aunque el subproceso termine con codigo cero.

La comprobacion GitNexus SHALL clasificar la frescura del indice en `fresh`, `stale` o `unclassifiable` y SHALL ejecutar la verificacion estructural compartida definida por la capacidad `gitnexus-index-health` antes de reportar `PASS`. SHALL registrar `PASS` unicamente cuando la clasificacion sea `fresh` y la verificacion estructural resuelva la consulta conocida y el `impact` desambiguado por UID. `stale` y `unclassifiable` SHALL producir `FAIL` y SHALL NOT degradarse a `WARN`. La comprobacion SHALL NOT expresar la salud como ausencia de una lista de firmas de error conocidas.

La comprobacion GitNexus SHALL permanecer read-only: SHALL NOT ejecutar `analyze`, reparacion ni reindexado, y SHALL NOT escribir en el indice local. Su remediacion SHALL nombrar la secuencia de recuperacion documentada sin ejecutarla.

#### Scenario: GitNexus devuelve falso verde

- **WHEN** la comprobacion GitNexus imprime `Not a git repository`, un diagnostico FTS o una firma configurada de consulta inutilizable aunque su subproceso termine con codigo cero
- **THEN** el doctor registra GitNexus como `FAIL`, explica que la ruta estructural primaria no esta disponible y muestra la recuperacion aprobada sin ejecutarla

#### Scenario: El indice esta stale

- **WHEN** el diagnostico clasifica el indice como `stale` frente al commit del checkout activo
- **THEN** el doctor registra GitNexus como `FAIL`, nombra la frescura del indice como causa y termina con codigo distinto de cero
- **AND** el resultado agregado no queda en `ok: true` por esa comprobacion

#### Scenario: El estado del indice no se puede clasificar

- **WHEN** la salida del diagnostico no permite resolver la frescura a `fresh` ni a `stale`
- **THEN** el doctor registra GitNexus como `FAIL` por clasificacion imposible
- **AND** no lo reporta como `PASS` ni como `WARN` por no haber encontrado una firma de error conocida

#### Scenario: Indice fresco que no resuelve el fixture estructural

- **WHEN** la frescura se clasifica como `fresh` pero la verificacion estructural compartida no devuelve contexto para la consulta conocida o su `impact` por UID no resuelve de forma exacta
- **THEN** el doctor registra GitNexus como `FAIL` y nombra el fixture no resuelto como causa

#### Scenario: Indice fresco y estructuralmente funcional

- **WHEN** la frescura se clasifica como `fresh` y la verificacion estructural compartida resuelve la consulta conocida y el `impact` por UID
- **THEN** el doctor registra GitNexus como `PASS`

#### Scenario: La comprobacion GitNexus no muta el indice

- **WHEN** el doctor ejecuta la comprobacion GitNexus en cualquiera de sus desenlaces
- **THEN** los comandos invocados no incluyen `analyze`, reparacion ni reindexado
- **AND** el indice local y su directorio generado quedan sin modificar

#### Scenario: CodeGraph conserva su papel de fallback

- **WHEN** GitNexus falla y el smoke de CodeGraph responde con el contrato esperado
- **THEN** el doctor registra el fallo de GitNexus y el resultado independiente de CodeGraph sin convertir el fallo primario en `PASS`

#### Scenario: MCP remoto requiere autenticacion de cliente

- **WHEN** un MCP remoto declara una configuracion o transporte valido pero indica que OAuth debe completarse dentro de un cliente MCP compatible
- **THEN** el doctor lo registra como `WARN` con esa limitacion visible y no afirma que la identidad o autorizacion remota este verificada

#### Scenario: La comprobacion Expo no descarga ni actualiza herramientas

- **WHEN** el doctor verifica compatibilidad Expo
- **THEN** ejecuta exclusivamente una ruta no mutante respaldada por la version instalada o fijada en el repositorio
- **AND** no usa `@latest`, no ejecuta una instalacion implicita y no modifica dependencias

### Requirement: El doctor protege la evidencia y permite pruebas aisladas

El runner SHALL capturar y normalizar la evidencia de comandos antes de reportarla, sin incluir tokens, secretos ni datos docentes. El repositorio SHALL incluir pruebas con resultados inyectados para un entorno sano, comando ausente, falso verde GitNexus, Project inaccesible, MCP OAuth esperado y Graphify retirado.

Las pruebas del falso verde GitNexus SHALL cubrir de forma explicita los tres desenlaces de la comprobacion: indice `stale`, indice `fresh` que no resuelve el fixture estructural, e indice `fresh` y funcional. SHALL afirmar ademas el caracter read-only inspeccionando los comandos invocados, no unicamente el resultado reportado. Ninguna de estas pruebas SHALL lanzar un proceso GitNexus real.

#### Scenario: GitHub Projects no es visible

- **WHEN** GitHub CLI no puede listar el Project configurado por falta de autenticacion, scope o visibilidad
- **THEN** el doctor registra `FAIL` sin exponer credenciales y muestra la recuperacion documentada para refrescar los scopes de Projects

#### Scenario: Prueba de Graphify retirado

- **WHEN** el fixture de pruebas representa un entorno sin binarios Graphify
- **THEN** la asercion espera `SKIP` retirado/manual y verifica que no se invoco un comando de Graphify

#### Scenario: Pruebas inyectadas de los tres desenlaces de GitNexus

- **WHEN** las pruebas inyectan un diagnostico stale, uno fresco cuyo fixture estructural no resuelve y uno fresco y funcional
- **THEN** las aserciones esperan `FAIL`, `FAIL` y `PASS` respectivamente
- **AND** ninguna de las tres ejecuta un proceso GitNexus real

#### Scenario: Prueba de que la comprobacion no repara

- **WHEN** las pruebas registran los comandos que el doctor invoca durante la comprobacion GitNexus
- **THEN** la asercion verifica que ninguno ejecuta `analyze`, reparacion ni reindexado
