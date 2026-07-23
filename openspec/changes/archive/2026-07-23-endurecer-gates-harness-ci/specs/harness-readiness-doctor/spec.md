## ADDED Requirements

### Requirement: El CLI del doctor ejecuta portablemente
El entrypoint de `harnessDoctor.mjs` SHALL reconocer una invocación directa mediante una file URL normalizada por Node y SHALL emitir un reporte JSON válido cuando recibe `--json` en Windows y POSIX. La prueba de proceso SHALL comprobar que el reporte contiene checks y SHALL fallar si el bloque CLI no se ejecuta.

#### Scenario: Doctor JSON ejecutado como proceso hijo
- **WHEN** la prueba CLI invoca `harnessDoctor.mjs --json --entrypoint-test` en Windows o Linux
- **THEN** el proceso devuelve JSON con el conjunto de checks del doctor y un código coherente con `ok`
- **AND** una salida vacía, no parseable o un warning de runtime en stderr rompe la prueba
- **AND** el runner de prueba deja toda verificación operativa y los checks MCP omitidos en `FAIL` explícito, por lo que el modo de prueba nunca declara salud remota

#### Scenario: Help portable no espera servicios externos
- **WHEN** la prueba de entrypoints invoca `harnessDoctor.mjs --help` en Windows o Linux
- **THEN** el bloque CLI devuelve el uso con código cero sin iniciar checks externos
- **AND** la prueba falla si el guard no ejecuta el bloque principal
