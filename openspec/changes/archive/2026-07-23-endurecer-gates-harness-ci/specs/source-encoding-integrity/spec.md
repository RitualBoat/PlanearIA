## MODIFIED Requirements

### Requirement: Gate permanente en la suite y en CI
El check SHALL ejecutarse como parte de la suite Jest habitual (y por tanto de la CI vigente) de modo que ningun cambio pueda introducir mojibake en `src` sin romper la build. La prueba del fixture positivo SHALL capturar su salida de proceso y asertar explícitamente las seis líneas esperadas sin heredarlas a la consola de Jest; errores no esperados seguirán siendo visibles y bloquearán la suite.

#### Scenario: Repositorio limpio
- **WHEN** se ejecuta la suite sobre el repositorio sin mojibake
- **THEN** el test del check pasa con cero hallazgos en `src`
- **AND** la salida de la suite no imprime las líneas del fixture positivo

#### Scenario: Regresion de codificacion bloqueada
- **WHEN** un cambio introduce una secuencia de doble codificación en cualquier archivo de `src`
- **THEN** la suite falla en el test del check indicando archivo y línea

#### Scenario: Fixture positivo conserva evidencia acotada
- **WHEN** la prueba ejecuta el fixture con seis líneas de mojibake conocidas
- **THEN** aserta código de fallo y las seis referencias archivo:línea capturadas
- **AND** no usa redirecciones globales ni filtros de advertencias
