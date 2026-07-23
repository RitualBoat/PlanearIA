## MODIFIED Requirements

### Requirement: Declaracion explicita y local de salida esperada
La guardia SHALL ofrecer un helper importable para declarar, dentro del test que la produce, la salida esperada por patrón (string o RegExp). Una llamada declarada MUST consumir la declaración y no fallar; una declaración no consumida al terminar el test MUST hacer fallar ese test pidiendo retirarla. La evidencia de un proceso hijo SHALL capturarse y asertarse dentro del test propietario, sin `--no-warnings`, redirecciones globales ni allowances que puedan ocultar mensajes distintos.

#### Scenario: Log esperado declarado no falla
- **WHEN** un test declara `expectConsoleError(/MAX_RETRIES/)` y el código ejercitado emite ese `console.error`
- **THEN** el test pasa y la llamada no aparece en la salida de la suite

#### Scenario: Declaracion no consumida falla
- **WHEN** un test declara `expectConsoleError(/nunca-ocurre/)` y ninguna llamada la consume
- **THEN** el test falla al terminar indicando que la declaración quedó sin uso

#### Scenario: La declaracion no silencia lo inesperado
- **WHEN** un test declara `expectConsoleError(/esperado/)`, el código emite ese error y después emite `console.error("otro error")`
- **THEN** el test falla por la segunda llamada, que no estaba declarada

#### Scenario: Salida negativa de proceso queda localizada
- **WHEN** una prueba necesita comprobar el error de un CLI con fixture negativo
- **THEN** captura y aserta stdout/stderr de ese proceso dentro de la prueba
- **AND** una advertencia o error no declarado fuera de esa captura sigue fallando la suite
