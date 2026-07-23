## ADDED Requirements

### Requirement: El CLI de salud GitNexus ejecuta portablemente
El entrypoint de `gitNexusFts.mjs` SHALL reconocer una invocación directa mediante una file URL normalizada por Node y SHALL ejecutar `diagnose` tanto en Windows como en POSIX. Su prueba de proceso SHALL exigir un reporte de frescura o un fallo accionable, nunca una salida vacía.

#### Scenario: Diagnose ejecutado como proceso hijo
- **WHEN** la prueba CLI ejecuta `gitNexusFts.mjs diagnose` en Windows o Linux
- **THEN** el proceso emite el reporte de diagnóstico del checkout
- **AND** la prueba falla si el guard no ejecuta `main`

