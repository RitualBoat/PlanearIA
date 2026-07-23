## MODIFIED Requirements

### Requirement: Cadencia documentada con tres buckets

El repositorio SHALL incluir un ADR de cadencia que clasifique cada advisory o riesgo abierto en uno de tres buckets. Para SheetJS, el ADR MUST enlazar el item canónico `debt-770acc1e9d53`, mantener revisión mensual y documentar recuperación, mientras que estado y expiración SHALL provenir únicamente del registro de deuda.

#### Scenario: El ADR clasifica el estado vigente sin duplicarlo

- **WHEN** se lee el ADR de cadencia
- **THEN** enlaza el item y excepción canónicos, declara owner y frecuencia, y no mantiene una expiración alternativa editable

#### Scenario: Vencimiento sin solución activa recuperación

- **WHEN** la excepción vence sin aislamiento o fix aprobado
- **THEN** se abre un PR normal para desactivar import `.xlsx`, conservando CSV, exportación, assessment, item y notices

### Requirement: Lockfile reproducible

Tras aplicar el change, el árbol de dependencias SHALL ser reproducible: `npm ci` instalará `xlsx@0.20.3` desde el tarball vendorizado mediante `file:` sin descargar ese paquete del CDN, y una segunda ejecución no modificará package ni lockfile.

#### Scenario: Segundo run sin drift

- **WHEN** se ejecuta `npm ci` dos veces sobre el lockfile del change
- **THEN** ambas ejecuciones producen el mismo árbol y no modifican package ni lockfile

#### Scenario: Instalación de xlsx no depende del CDN

- **WHEN** se inspeccionan `package.json`, lockfile y el árbol instalado
- **THEN** `xlsx` resuelve a la copia vendorizada `0.20.3` y no a una URL remota

### Requirement: Ningún verde falso por riesgo aceptado

El change SHALL producir un assessment `kind: remediation` con `result: debt` para el riesgo residual verificado, y SHALL aplicar una excepción válida en el mismo flujo. Aceptar el riesgo MUST NOT convertir el assessment en `clean` ni borrar evidencia histórica.

#### Scenario: Riesgo aceptado queda trazado

- **WHEN** se captura el assessment de la corrección
- **THEN** el item `debt-770acc1e9d53` queda `accepted-exception` hasta `2026-10-31` y el assessment de #133 conserva su hash
