# dependency-update-cadence Specification

## Purpose
TBD - created by archiving change resolver-riesgo-y-cadencia-dependencias. Update Purpose after archive.
## Requirements
### Requirement: Cadencia documentada con tres buckets

El repositorio SHALL incluir un ADR de cadencia de dependencias que clasifique cada advisory abierta en exactamente uno de tres buckets: (1) parche compatible aplicable via `overrides`, (2) advisory sin fix upstream aceptada con excepcion valida, (3) upgrade mayor condicionado al proximo Expo SDK. El ADR MUST declarar owner, frecuencia de revision y estrategia de rollback.

#### Scenario: El ADR clasifica el estado vigente

- **WHEN** se lee el ADR de cadencia
- **THEN** enumera las advisories del arbol Expo diferidas al proximo SDK y los parches aplicados via overrides, cada uno en su bucket, con owner y frecuencia

### Requirement: Parches compatibles via overrides sin audit fix ni bump de SDK

Las advisories de dev/build/CLI con fix del mismo major SHALL aplicarse fijando la version parcheada mediante `overrides` en `package.json`, sin ejecutar `npm audit fix`/`--force` y sin elevar la version de Expo SDK. La compatibilidad MUST verificarse con typecheck, lint, tests afectados y `npx expo install --check`.

#### Scenario: Las 6 high transitivas quedan parcheadas por overrides

- **WHEN** se ejecuta `npm audit` despues del change
- **THEN** las advisories high transitivas cubiertas por overrides ya no aparecen y `npx expo install --check` sigue reportando dependencias al dia

#### Scenario: Expo SDK 54 permanece intacto

- **WHEN** se compara el arbol Expo antes y despues del change
- **THEN** la version de Expo SDK no cambia y ningun override eleva un paquete Expo a un major nuevo

### Requirement: Lockfile reproducible

Tras aplicar el change, el arbol de dependencias SHALL ser reproducible: `npm ci` regenera `node_modules` desde el lockfile sin drift en una segunda ejecucion, y cada entrada de fuente no-registro (tarball CDN) declara `resolved` e `integrity`.

#### Scenario: Segundo run sin drift

- **WHEN** se ejecuta `npm ci` dos veces sobre el lockfile del change
- **THEN** ambas ejecuciones producen el mismo arbol y no modifican el lockfile

### Requirement: Ningun verde falso por riesgo aceptado

El change SHALL no declarar limpio ningun scanner por el solo hecho de aceptar o diferir un riesgo. Toda advisory que no se corrige MUST quedar enumerada en el ADR (bucket 2 o 3) o registrada con excepcion valida en el motor de deuda.

#### Scenario: Advisory diferida queda trazada, no silenciada

- **WHEN** una advisory del arbol Expo se difiere al proximo SDK
- **THEN** aparece listada en el ADR con su bucket y no se suprime del reporte de `npm audit`

