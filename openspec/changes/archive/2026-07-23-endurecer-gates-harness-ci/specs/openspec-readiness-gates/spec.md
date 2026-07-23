## ADDED Requirements

### Requirement: El entrypoint de readiness es portable y no puede aprobar vacío
El entrypoint de `checkOpenSpecReadiness.mjs` SHALL reconocer su propia ruta usando una file URL normalizada por Node y SHALL ejecutar el parser de argumentos y el reporte en Windows y POSIX. Una invocación inválida SHALL devolver un fallo accionable; una salida vacía SHALL NOT ser equivalente a PASS.

#### Scenario: Invocación inválida ejercita el bloque principal
- **WHEN** un proceso invoca readiness con argumentos de fase inválidos en Windows o Linux
- **THEN** termina con código distinto de cero y un mensaje de uso
- **AND** la prueba falla si el proceso termina vacío o con éxito

