# dependency-update-cadence Specification

## Purpose
TBD - created by archiving change resolver-riesgo-y-cadencia-dependencias. Update Purpose after archive.
## Requirements
### Requirement: Cadencia documentada con tres buckets

El repositorio SHALL incluir un ADR de cadencia que clasifique cada advisory o riesgo abierto en uno de tres buckets. Para SheetJS, el ADR MUST enlazar el item canónico `debt-770acc1e9d53`, mantener revisión mensual y documentar recuperación, mientras que estado y expiración SHALL provenir únicamente del registro de deuda.

#### Scenario: El ADR clasifica el estado vigente

- **WHEN** se lee el ADR de cadencia
- **THEN** enlaza el item y excepción canónicos, declara owner y frecuencia, y no mantiene una expiración alternativa editable

#### Scenario: Vencimiento sin solución activa recuperación

- **WHEN** la excepción vence sin aislamiento o fix aprobado
- **THEN** se abre un PR normal para desactivar import `.xlsx`, conservando CSV, exportación, assessment, item y notices

### Requirement: Parches compatibles via overrides sin audit fix ni bump de SDK

Las advisories de dev/build/CLI con fix del mismo major SHALL aplicarse fijando la version parcheada mediante `overrides` en `package.json`, sin ejecutar `npm audit fix`/`--force` y sin elevar la version de Expo SDK. La compatibilidad MUST verificarse con typecheck, lint, tests afectados y `npx expo install --check`.

#### Scenario: Las 6 high transitivas quedan parcheadas por overrides

- **WHEN** se ejecuta `npm audit` despues del change
- **THEN** las advisories high transitivas cubiertas por overrides ya no aparecen y `npx expo install --check` sigue reportando dependencias al dia

#### Scenario: Expo SDK 54 permanece intacto

- **WHEN** se compara el arbol Expo antes y despues del change
- **THEN** la version de Expo SDK no cambia y ningun override eleva un paquete Expo a un major nuevo

### Requirement: Lockfile reproducible

Tras aplicar el change, el árbol de dependencias SHALL ser reproducible: `npm ci` instalará `xlsx@0.20.3` desde el tarball vendorizado mediante `file:` sin descargar ese paquete del CDN, y una segunda ejecución no modificará package ni lockfile.

#### Scenario: Segundo run sin drift

- **WHEN** se ejecuta `npm ci` dos veces sobre el lockfile del change
- **THEN** ambas ejecuciones producen el mismo árbol y no modifican package ni lockfile

#### Scenario: Instalación de xlsx no depende del CDN

- **WHEN** se inspeccionan `package.json`, lockfile y el árbol instalado
- **THEN** `xlsx` resuelve a la copia vendorizada `0.20.3` y no a una URL remota

### Requirement: Ningun verde falso por riesgo aceptado

El change SHALL producir un assessment `kind: remediation` con `result: debt` para el riesgo residual verificado, y SHALL aplicar una excepción válida en el mismo flujo. Aceptar el riesgo MUST NOT convertir el assessment en `clean` ni borrar evidencia histórica.

#### Scenario: Advisory diferida queda trazada, no silenciada

- **WHEN** una advisory o riesgo queda diferido mediante una excepción válida
- **THEN** permanece enumerado en el ADR o registro canónico y no se suprime de la evidencia que lo detectó

#### Scenario: Riesgo aceptado queda trazado

- **WHEN** se captura el assessment de la corrección
- **THEN** el item `debt-770acc1e9d53` queda `accepted-exception` hasta `2026-10-31` y el assessment de #133 conserva su hash

