## ADDED Requirements

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
