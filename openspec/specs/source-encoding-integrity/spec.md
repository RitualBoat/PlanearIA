# source-encoding-integrity Specification

## Purpose
TBD - created by archiving change sanear-senal-tests-y-codificacion. Update Purpose after archive.
## Requirements
### Requirement: Deteccion determinista de doble codificacion UTF-8

El repositorio SHALL incluir un check ejecutable localmente que recorra las fuentes de producto y tests (`src/**/*.{ts,tsx,js,jsx}`) y reporte, con archivo y linea, cualquier secuencia estructural de doble codificacion UTF-8 (lead byte reinterpretado como Latin-1 seguido de byte de continuacion huerfano, y secuencias `â€`/`â†` documentadas). El check MUST terminar con codigo de salida distinto de cero cuando exista al menos un hallazgo.

#### Scenario: Archivo con mojibake es detectado

- **WHEN** el check analiza un archivo que contiene `EvaluaciÃ³n`
- **THEN** reporta el archivo y la linea exacta y termina con salida distinta de cero

#### Scenario: UTF-8 legitimo del espanol no es detectado

- **WHEN** el check analiza un archivo que contiene `Evaluación`, `niño`, `¿Qué?`, `¡Listo!`, `3°`, `—`, `→`, `…` o emojis
- **THEN** no reporta ningun hallazgo y termina con salida cero

### Requirement: Gate permanente en la suite y en CI

El check SHALL ejecutarse como parte de la suite Jest habitual (y por tanto de la CI vigente) de modo que ningun cambio pueda introducir mojibake en `src` sin romper la build.

#### Scenario: Repositorio limpio

- **WHEN** se ejecuta la suite sobre el repositorio sin mojibake
- **THEN** el test del check pasa con cero hallazgos en `src`

#### Scenario: Regresion de codificacion bloqueada

- **WHEN** un cambio introduce una secuencia de doble codificacion en cualquier archivo de `src`
- **THEN** la suite falla en el test del check indicando archivo y linea

### Requirement: Textos corregidos verificables

Los textos visibles al docente previamente corrompidos SHALL restaurarse a su forma UTF-8 correcta y los tests que los cubren MUST afirmar la forma correcta.

#### Scenario: Pantalla de exportacion en espanol correcto

- **WHEN** se renderiza o se testea la pantalla de exportacion de planeacion
- **THEN** los textos afirmados son las formas correctas (`Evaluación`, `¡Planeación exportada!`, `menú`, `está`) y ningun texto contiene secuencias de doble codificacion

#### Scenario: Seccion curricular en espanol correcto

- **WHEN** se lee la lista de areas de la seccion curricular
- **THEN** contiene `Inclusión` y ninguna entrada contiene secuencias de doble codificacion

