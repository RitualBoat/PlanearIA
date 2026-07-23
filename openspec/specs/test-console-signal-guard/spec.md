# test-console-signal-guard Specification

## Purpose
TBD - created by archiving change sanear-senal-tests-y-codificacion. Update Purpose after archive.
## Requirements
### Requirement: Fallo ante console.error o console.warn inesperados

La suite SHALL hacer fallar cualquier test que emita una llamada a `console.error` o `console.warn` no declarada previamente en ese test, y el mensaje de fallo MUST incluir el contenido capturado para que la causa sea accionable sin reejecutar.

#### Scenario: Test con console.error no declarado

- **WHEN** un test emite `console.error("fallo inesperado")` sin declararlo
- **THEN** ese test falla al terminar y el reporte muestra el texto capturado "fallo inesperado"

#### Scenario: Test con console.warn no declarado

- **WHEN** un test emite `console.warn("aviso")` sin declararlo
- **THEN** ese test falla al terminar y el reporte muestra el texto capturado "aviso"

#### Scenario: Suite completa sin salida no declarada

- **WHEN** se ejecuta `npm test -- --runInBand` sobre el repositorio limpio
- **THEN** todas las suites pasan y la salida no contiene lineas `console.error`/`console.warn` no declaradas por sus tests

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

### Requirement: Aislamiento entre tests

La guardia SHALL restaurar los metodos originales de consola y descartar las declaraciones al final de cada test, de modo que ninguna declaracion o captura se propague a otro test o suite.

#### Scenario: Declaracion de un test no protege al siguiente

- **WHEN** un test declara y consume una salida esperada y el test siguiente emite la misma salida sin declararla
- **THEN** el segundo test falla por salida no declarada

### Requirement: Correccion de warnings act() expuestos

Los warnings `act()` de React existentes en las suites del repositorio SHALL corregirse ajustando la sincronizacion de los tests afectados; MUST NOT declararse como salida esperada.

#### Scenario: Suite previamente ruidosa por act()

- **WHEN** se ejecuta una suite que emitia warnings `act()` (p.ej. `useDetalleGrupoViewModel.test.tsx`)
- **THEN** la suite pasa sin emitir ningun warning `act()` y sin declaraciones que los encubran

