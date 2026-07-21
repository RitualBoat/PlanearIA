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

La guardia SHALL ofrecer un helper importable para declarar, dentro del test que la produce, la salida esperada por patron (string o RegExp). Una llamada declarada MUST consumir la declaracion y no fallar; una declaracion no consumida al terminar el test MUST hacer fallar ese test pidiendo retirarla.

#### Scenario: Log esperado declarado no falla

- **WHEN** un test declara `expectConsoleError(/MAX_RETRIES/)` y el codigo ejercitado emite ese `console.error`
- **THEN** el test pasa y la llamada no aparece en la salida de la suite

#### Scenario: Declaracion no consumida falla

- **WHEN** un test declara `expectConsoleError(/nunca-ocurre/)` y ninguna llamada la consume
- **THEN** ese test falla al terminar indicando que la declaracion quedo sin uso

#### Scenario: La declaracion no silencia lo inesperado

- **WHEN** un test declara `expectConsoleError(/esperado/)`, el codigo emite ese error y despues emite `console.error("otro error")`
- **THEN** el test falla por la segunda llamada, que no estaba declarada

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

