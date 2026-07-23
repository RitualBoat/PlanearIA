## MODIFIED Requirements

### Requirement: El gate CI detecta drift de paridad
El workflow CI `agent-harness-parity.yml` SHALL ejecutar el generador en modo `--check`, la validación de paridad de nombres de MCP y las comprobaciones de OpenSpec, deuda y CLI de harness en Windows y Linux. SHALL fallar cuando un espejo difiera de su fuente, un comando no se ejecute o una prueba de entrypoint quede vacía. Un paso SHALL usar `continue-on-error` únicamente si el workflow declara para esa señal la causa, owner, recuperación y condición concreta de cutover; la ausencia de un check SHALL NOT interpretarse como éxito.

#### Scenario: Espejo desfasado en un PR
- **WHEN** un PR contiene un espejo que difiere de su fuente
- **THEN** `--check` termina con código distinto de cero e imprime el diff
- **AND** el job de CI no continúa como éxito por `continue-on-error`

#### Scenario: Arranque suave
- **WHEN** el gate está en su modo suave inicial (`continue-on-error`)
- **THEN** un drift detectado se reporta como anotación no bloqueante en vez de bloquear el merge
- **AND** el paso declara la señal, causa, owner, recuperación y condición concreta de cutover

#### Scenario: Check estable bloquea el PR
- **WHEN** una comprobación con baseline verde termina con código distinto de cero en Windows o Linux
- **THEN** el job de paridad falla en ese sistema
- **AND** la ejecución no se reporta como éxito por ausencia de salida o de comando

#### Scenario: Advisory excepcional documentado
- **WHEN** un check conserva temporalmente `continue-on-error`
- **THEN** su paso declara la señal, causa, owner, recuperación y condición concreta para retirar el advisory
- **AND** el workflow conserva la salida y el código de la comprobación como evidencia visible

#### Scenario: Todo en paridad
- **WHEN** todos los espejos y comprobaciones del harness coinciden con sus contratos en Windows y Linux
- **THEN** cada job de la matriz termina con código cero

## ADDED Requirements

### Requirement: Los entrypoints críticos se prueban como procesos reales
El repositorio SHALL ejecutar pruebas de proceso para `checkOpenSpecReadiness.mjs`, `checkOpenSpecTldr.mjs`, `gitNexusFts.mjs` y `harnessDoctor.mjs`. Las pruebas SHALL verificar un marcador semántico de cada CLI y SHALL fallar ante salida vacía, código inesperado o falta de ejecución del bloque principal.

#### Scenario: Runner Windows y POSIX ejecutan el bloque CLI
- **WHEN** la matriz de paridad invoca la prueba de entrypoints en Windows y Linux
- **THEN** cada script produce su reporte esperado desde un proceso hijo
- **AND** ninguna comprobación se limita a importar helpers

#### Scenario: Guard vacío detectado por prueba negativa
- **WHEN** el resultado simulado de un CLI no contiene salida ni evidencia de ejecución
- **THEN** la prueba de entrypoints falla explícitamente
