## Why

El issue canónico [#137](https://github.com/RitualBoat/PlanearIA/issues/137) corrige un falso verde
del cierre de #133: `XLSX.read` puede bloquear sincrónicamente el hilo JS ante un `.xlsx` ZIP
truncado, pero el riesgo quedó fuera del registro canónico y sin excepción válida. Además, la
dependencia sigue resolviéndose desde el CDN durante la instalación y PlanearIA no publica la
atribución exigida por SheetJS CE.

## What Changes

- Capturar un assessment de remediación inmutable con `result: debt`, registrar `debt-770acc1e9d53` y aplicar la excepción temporal aprobada hasta `2026-10-31`.
- Corregir specs, comentarios, TLDR y ADR para distinguir excepciones lanzadas de bloqueos síncronos no interrumpibles por `try/catch`.
- Vendorizar el tarball oficial `xlsx-0.20.3.tgz`, fijar origen y SHA-256, consumirlo mediante `file:` y añadir un check determinista con prueba negativa.
- Crear `THIRD_PARTY_NOTICES.md`, conservar la licencia/notices aplicables del tarball y enlazar la atribución desde la documentación.
- Añadir a `TerminosScreen` una pestaña accesible de licencias de terceros con navegación tipada, preservando Términos y Privacidad.
- Mantener la revisión mensual del ADR enlazada al registro canónico y documentar la recuperación exacta al vencer.

## Capabilities

### New Capabilities

- `third-party-software-attribution`: gobernanza verificable del artefacto vendorizado, notices del repositorio y atribución accesible dentro de la app.

### Modified Capabilities

- `secure-spreadsheet-import`: declara honestamente que el tope y `try/catch` controlan tamaño y excepciones lanzadas, pero no eliminan el bloqueo síncrono residual.
- `dependency-update-cadence`: la excepción del registro y su expiración pasan a ser la fuente canónica; el ADR mantiene revisión mensual y recuperación sin duplicar estado editable.

## Impact

Afecta `package.json`, `package-lock.json`, una ruta explícita de terceros, checks del harness, `spreadsheetImport.ts`, la documentación legal y operativa, `TerminosScreen`, tipos de navegación, tests, artefactos OpenSpec y `.project-os/debt/` únicamente mediante `debt:capture`. No cambia la licencia propia de PlanearIA ni copia SheetJS al núcleo neutral de Project Engineering OS.

## No objetivos

- No sustituir SheetJS, diseñar workers/backend ni afirmar que el riesgo fue eliminado.
- No actualizar Expo SDK, ejecutar `npm audit fix` ni corregir warnings/entrypoints/CI de #136.
- No modificar el assessment histórico de #133, borrar el registro ni reabrir #126 o PR #127.
- No rediseñar superficies distintas de la presentación legal existente.
