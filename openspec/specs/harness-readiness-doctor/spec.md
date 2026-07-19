# harness-readiness-doctor Specification

## Purpose

Define the deterministic, read-only readiness diagnosis for the active PlanearIA agent harness.
## Requirements
### Requirement: El doctor entrega un veredicto determinista y accionable

El repositorio SHALL exponer un unico comando local del doctor del harness que se ejecute desde la raiz, sea read-only y produzca un listado ordenado de comprobaciones con `PASS`, `FAIL`, `WARN` o `SKIP`, un resumen breve y una remediacion segura cuando aplique. El modo `--json` SHALL emitir un unico documento estructurado con el mismo orden y campos estables que el reporte humano.

#### Scenario: Checkout sin hallazgos bloqueantes

- **WHEN** todas las comprobaciones requeridas del manifest terminan sanas y no se detecta una firma semantica de error
- **THEN** el doctor termina con codigo cero y el resumen estructurado no contiene ningun resultado `FAIL`

#### Scenario: Hallazgo bloqueante sin mutacion

- **WHEN** una comprobacion requerida falla o no puede ejecutarse
- **THEN** el doctor termina con codigo distinto de cero, conserva los resultados de las comprobaciones restantes y no instala, actualiza, autentica, repara ni reindexa herramientas

#### Scenario: Salida estructurada repetible

- **WHEN** las mismas respuestas de las comprobaciones se inyectan dos veces en los tests
- **THEN** el modo `--json` produce el mismo orden de identificadores, estados, resumenes y remediaciones en ambas ejecuciones

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

### Requirement: El doctor clasifica por evidencia un MCP stdio con OAuth interactivo pendiente

El smoke MCP SHALL clasificar el fallo de cada servidor stdio y exponer esa clasificacion como un campo estructurado en su resultado, SHALL conservar `ok: false` para todo servidor stdio que no completo `tools/list` y SHALL NOT alterar su veredicto agregado ni su codigo de salida por efecto de la clasificacion. Esta exigencia SHALL NOT aplicar a los servidores declarados con transporte `url`, cuyo contrato vigente solo confirma configuracion presente.

El doctor SHALL registrar `mcp-smoke` como `WARN` unicamente cuando todos los servidores no verificados presenten prueba de OAuth interactivo pendiente y esten declarados en la allowlist `oauthInteractiveServers` del manifest del doctor. La prueba de OAuth interactivo pendiente SHALL exigir de forma conjunta que la evidencia capturada contenga el prompt de autorizacion del cliente remoto con una URL `https` de autorizacion cuyo origen coincida con el del endpoint configurado para ese servidor, y que el servidor nunca haya completado su inicializacion. El doctor SHALL NOT derivar la clasificacion del codigo de salida ni del mensaje de error terminal del subproceso.

El `WARN` SHALL nombrar los servidores afectados y mostrar la recuperacion sin ejecutarla, y SHALL NOT afirmar que las herramientas del servidor quedaron verificadas.

#### Scenario: MCP autenticado y respondiente

- **WHEN** todos los servidores del smoke completan `tools/list` y ninguno reporta OAuth pendiente
- **THEN** el doctor registra `mcp-smoke` como `PASS` y el veredicto agregado no contiene `FAIL`

#### Scenario: OAuth interactivo requerido en un servidor de la allowlist

- **WHEN** un servidor stdio declarado en `oauthInteractiveServers` no completa su inicializacion y su evidencia contiene el prompt de autorizacion con una URL `https` de autorizacion del mismo origen que su endpoint configurado
- **THEN** el doctor registra `mcp-smoke` como `WARN`, nombra ese servidor, indica que falta consentimiento interactivo y expone la recuperacion documentada
- **AND** el veredicto agregado del doctor no contiene `FAIL` por esa causa
- **AND** el resultado del smoke conserva `ok: false` para ese servidor y `npm run mcp:test` mantiene su codigo de salida distinto de cero

#### Scenario: El sintoma terminal no altera la clasificacion

- **WHEN** dos ejecuciones presentan la misma prueba de OAuth pendiente pero una termina por expiracion del tiempo de espera y la otra por un codigo de salida distinto de cero
- **THEN** el doctor clasifica ambas como el mismo `WARN`

#### Scenario: MCP realmente roto

- **WHEN** un servidor del smoke falla por ausencia del ejecutable, error de conectividad, error de protocolo, respuesta invalida o expiracion sin prompt de autorizacion
- **THEN** el doctor registra `mcp-smoke` como `FAIL` con la evidencia normalizada y su recuperacion
- **AND** la presencia simultanea de otro servidor con OAuth pendiente no convierte ese fallo en `WARN`

#### Scenario: OAuth pendiente fuera de la allowlist

- **WHEN** un servidor stdio no declarado en `oauthInteractiveServers` presenta prueba de OAuth interactivo pendiente
- **THEN** el doctor registra `mcp-smoke` como `FAIL` y exige una decision explicita antes de degradarlo

#### Scenario: El origen de la URL de autorizacion no coincide

- **WHEN** la evidencia contiene un prompt de autorizacion cuya URL no es `https` o cuyo origen difiere del endpoint configurado para ese servidor
- **THEN** el doctor no acepta esa evidencia como prueba de OAuth pendiente y registra `mcp-smoke` como `FAIL`

#### Scenario: El MCP remoto declarado por transporte url conserva su clasificacion

- **WHEN** el smoke evalua un servidor remoto declarado con transporte `url` que solo confirma configuracion presente
- **THEN** el doctor conserva el `WARN` por nota existente para ese servidor sin exigirle prueba de OAuth ni relajarlo a `PASS`

#### Scenario: Pruebas inyectadas de los tres casos

- **WHEN** las pruebas del doctor inyectan un smoke autenticado, uno con OAuth pendiente en la allowlist y uno realmente roto
- **THEN** las aserciones esperan `PASS`, `WARN` y `FAIL` respectivamente sin lanzar ningun proceso MCP real

### Requirement: La compatibilidad de expo-localization se mantiene separada de deuda Expo ajena

El conjunto de dependencias raíz SHALL mantener `expo-localization` en el rango compatible que determine el CLI de Expo para el SDK instalado, usando el flujo de instalación compatible y actualizando de forma coherente el manifiesto y lockfile. La comprobación SHALL conservar visible cualquier discrepancia independiente de `expo` y SHALL NOT atribuirla a localization ni silenciarla.

#### Scenario: Se corrige únicamente localization

- **WHEN** la comprobación Expo identifica `expo-localization` como incompatible
- **THEN** la remediación actualiza exclusivamente la resolución necesaria mediante un comando Expo con localization como objetivo
- **AND** `npx expo install expo-localization --check` deja de identificar localization como incompatible

#### Scenario: Persiste una discrepancia independiente de Expo

- **WHEN** la comprobación global aún informa una versión de `expo` diferente de la esperada
- **THEN** el resultado conserva y registra esa discrepancia como deuda fuera del alcance
- **AND** no actualiza Expo SDK ni otras dependencias para silenciarla

#### Scenario: Se revierte la actualización acotada

- **WHEN** la actualización de localization debe deshacerse
- **THEN** revertir su commit y ejecutar `npm ci` restaura manifiesto, lockfile y árbol previos
- **AND** el rollback no requiere migrar datos ni regenerar proyectos nativos

### Requirement: El paquete expo se mantiene alineado al parche recomendado por su SDK

El conjunto de dependencias raiz SHALL mantener `expo` en el rango compatible que determine el CLI de Expo para el SDK instalado, usando el flujo de instalacion compatible y actualizando de forma coherente el manifiesto, el lockfile y el arbol resuelto. La comprobacion SHALL NOT depender de un rango permisivo cuando la version resuelta por el lockfile quede fuera de la recomendacion, y SHALL conservar visible cualquier deuda ajena sin atribuirla a `expo`.

#### Scenario: Se corrige unicamente expo

- **WHEN** la comprobacion Expo identifica `expo` como incompatible frente al parche recomendado por el SDK instalado
- **THEN** la remediacion actualiza exclusivamente la resolucion necesaria mediante un comando Expo con `expo` como objetivo
- **AND** `npx expo install --check` deja de identificar `expo` como incompatible
- **AND** el veredicto del doctor deja de reportar `FAIL expo-compatibility`

#### Scenario: Un rango permisivo no basta como evidencia de alineacion

- **WHEN** el manifiesto declara un rango que admitiria el parche recomendado pero el lockfile resuelve una version anterior
- **THEN** la comprobacion considera la dependencia desalineada
- **AND** la remediacion actualiza la resolucion del lockfile en lugar de ampliar o reinterpretar el rango

#### Scenario: El arbol resuelto refleja el lockfile vigente

- **WHEN** `node_modules` contiene una version distinta de la que el lockfile ya fija para una dependencia Expo
- **THEN** la remediacion reinstala el arbol para restaurar la coherencia
- **AND** no modifica la declaracion de esa dependencia en el manifiesto

#### Scenario: Persiste una deuda ajena a la compatibilidad Expo

- **WHEN** el doctor aun informa un fallo cuyo origen es distinto de la version de las dependencias Expo
- **THEN** el resultado conserva y registra esa deuda fuera del alcance de esta remediacion
- **AND** no actualiza Expo SDK ni otras dependencias para silenciarla

#### Scenario: Se revierte la actualizacion acotada

- **WHEN** la actualizacion de `expo` debe deshacerse
- **THEN** revertir su commit y ejecutar `npm ci` restaura manifiesto, lockfile y arbol previos
- **AND** el rollback no requiere migrar datos ni regenerar proyectos nativos

### Requirement: Graphify se informa como retirado y no aplicable

El doctor SHALL incluir Graphify como `SKIP` con la razon `retirado/manual`. Su ausencia SHALL NOT producir `FAIL`, `WARN`, remediacion de instalacion ni intento de iniciar un servidor; `graphify-out/` SHALL NOT ser leido como evidencia de salud.

#### Scenario: Entorno sin Graphify instalado

- **WHEN** Graphify, `graphify-mcp` y `uv` no estan disponibles en PATH
- **THEN** el reporte incluye exactamente el resultado `SKIP` retirado/manual y el resultado agregado no falla por esa ausencia

#### Scenario: Reintroduccion como MCP activo

- **WHEN** Graphify reaparece en `.mcp.json` o en un espejo MCP generado
- **THEN** la comprobacion de paridad activa falla con una remediacion para regenerar o retirar el servidor
- **AND** el doctor no intenta reparar, instalar ni iniciar Graphify

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

