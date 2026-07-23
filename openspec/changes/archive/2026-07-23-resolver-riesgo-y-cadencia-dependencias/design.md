# Design: resolver-riesgo-y-cadencia-dependencias

## Context

Estado verificado el 2026-07-22 sobre `development@717c041` (GitNexus fresco):

- `npm audit --json` (antes): 28 advisories = 7 high, 20 moderate, 1 low. El baseline del 2026-07-20 registro 21; el crecimiento es drift esperado del ecosistema y queda como evidencia antes/despues.
- `npx expo install --check`: "Dependencies are up to date". El arbol Expo esta pineado a SDK 54; el unico "fix" que `npm audit` ofrece para las 20 moderate y varias transitivas es `expo@57` (`isSemVerMajor: true`), fuera de alcance.
- `xlsx@0.18.5` es la unica advisory `high` en runtime. `resolved: undefined` en el lockfile: la version instalada es la ultima del registro npm, congelada en 2022. SheetJS movio el mantenimiento y las versiones parcheadas a `cdn.sheetjs.com` (0.19.3 corrige prototype pollution; 0.20.2 corrige ReDoS; 0.20.3 es la actual). Licencia Apache-2.0.
- Uso real de `xlsx`: LECTURA no confiable (`XLSX.read`) en `src/services/alumnoImportService.ts` y `src/services/grupoImportService.ts` (incluye CSV, que tambien pasa por `XLSX.read`); ESCRITURA de datos propios (`XLSX.write`) en `alumnoExportService.ts` y `grupoExportService.ts`. Las dos advisories son de parseo: la exportacion no es vulnerable.
- Las 6 high transitivas (`ws`, `form-data`, `js-yaml`, `shell-quote`, `brace-expansion`, `fast-uri`) viven en dev/build/CLI: eslint, jest/jsdom, `@expo/cli`, `metro`, react-devtools, expo-dev-client. Ninguna se empaqueta al bundle de runtime ni al backend serverless. Todas declaran `fixAvailable: true` con version parcheada del mismo major (parche de seguridad semver-compatible).

**Contextos DDD (regla obligatoria de design):** este change toca infraestructura de dependencias y la capa de servicios de import/export de Alumnos/Grupos (contexto Classroom/Gestion Academica). No cambia contratos de dominio, sync, storage ni ownership; restaura seguridad sin alterar comportamiento observable. No requiere contrato cruzado entre bounded contexts.

## Goals / Non-Goals

**Goals:**

- Corregir en la fuente ambas advisories de `xlsx` sin perder formatos, datos ni la API existente.
- Cerrar la superficie de exploit real: parsear entrada no confiable solo con un build parcheado y con un tope de tamano que evite cuelgues y limite el blast radius de un futuro advisory de parseo.
- Aplicar parches compatibles a las 6 high dev/build via `overrides`, sin `npm audit fix` y sin subir Expo SDK, verificando que Metro/jest/Expo siguen sanos.
- Dejar una cadencia escrita (ADR) que separe parches compatibles, advisories aceptadas y upgrades SDK-gated, con owner, frecuencia y rollback.
- Lockfile reproducible: `npm ci` no produce drift en un segundo run.

**Non-Goals:**

- No subir Expo SDK ni tocar el comportamiento de las 20 moderate SDK-gated (se documentan y monitorean).
- No adoptar dependencias nuevas ni cambiar de libreria de hojas de calculo.
- No usar `npm audit fix`/`--force` (reescribe el arbol de forma no controlada y puede arrastrar majors).
- No declarar verde el scanner por riesgo solo aceptado.

## Decisions

### D1. `xlsx` -> SheetJS CDN 0.20.3 (drop-in), no sustituir la libreria

Se instala `xlsx` desde el tarball oficial `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` (dep en `package.json` apuntando al tarball; el lockfile registra `resolved` + `integrity`). Misma API: `alumno*Service.ts` y `grupo*Service.ts` no cambian su uso de `XLSX.read`/`XLSX.write`. Corrige CVE-2023-30533 (prototype pollution) y CVE-2024-22363 (ReDoS) en la fuente.

Alternativas consideradas y descartadas (evidencia en la entrevista del issue #133):

- **read-excel-file + write-excel-file** (MIT, registro): elimina `xlsx` del arbol, pero exige migracion mayor de 4 servicios (re-mapeo de headers y semantica de parseo distinta), compat RN-nativo por verificar y son de un solo mantenedor. Costo/riesgo desproporcionado frente al drop-in.
- **exceljs** (MIT): sin release en 12 meses (inactivo), pesado y sin soporte oficial React Native. Cambiaria una libreria sin mantener por otra.
- **papaparse solo-CSV**: seguro pero retira el import nativo de `.xlsx` (regresion de producto) y no limpia el finding de `xlsx` del export.
- **Mantener 0.18.5 + mitigaciones**: no corrige las advisories (el fix no esta en npm); dejaria `npm audit` en high y exigiria excepcion formal.

Riesgo residual de D1: dependencia de un CDN de un solo proveedor y de una libreria que ya no publica en npm. Mitigacion: `integrity` en el lockfile (npm ci verifica hash), tarball oficial de primera parte, y la cadencia (D4) que obliga a monitorear releases de SheetJS.

### D2. Endurecer solo la ruta de LECTURA no confiable

En `alumnoImportService.ts` y `grupoImportService.ts` se agrega, antes de `XLSX.read`:

- Tope de tamano (`MAX_IMPORT_BYTES`, p.ej. 5 MB): se valida contra `asset.size` cuando DocumentPicker lo provee y contra `arrayBuffer.byteLength` tras leer. Excederlo lanza un error controlado ("Archivo demasiado grande") que las pantallas ya muestran como estado de error.
- Parseo defensivo: `XLSX.read` envuelto de modo que un buffer invalido/corrupto produzca un error controlado (mensaje de formato no soportado), nunca una excepcion sin capturar ni un cuelgue.

La ESCRITURA no se toca: `XLSX.write` opera sobre datos propios de la app; las advisories son de lectura. El tope reduce el blast radius de cualquier futuro advisory de parseo y del simple agotamiento de recursos por archivos enormes.

### D3. Cadencia via `overrides` dirigidos, verificados contra la toolchain

Se agrega un bloque `overrides` en `package.json` que fija cada una de las 6 high transitivas a su version parcheada declarada por `npm audit` (mismo major, semver-compatible). Se usan overrides especificos por paquete; si un override forzara un major incompatible en un consumidor que necesita otro major (p.ej. `ws@6` en react-native dev), se acota el override a la rama afectada o se retira ese override puntual y se documenta como aceptado-y-monitoreado en el ADR. Tras aplicar: `npm install` para reescribir el lockfile, luego `npm run typecheck`, `npm run lint -- --quiet`, tests afectados, `npx expo install --check` y `npm audit` despues. Nada de `npm audit fix`.

### D4. ADR de cadencia con tres buckets y sin verde falso

Se escribe `Documentacion/02-operacion/CADENCIA_DEPENDENCIAS.md` (ADR) que declara revision mensual de `npm audit` y clasifica cada advisory en tres buckets:

1. **Parches compatibles** (overrides, mismo major): las 6 high transitivas dev/build se parchean en este change (ws, form-data, js-yaml, shell-quote, brace-expansion, fast-uri). Otras 7 compatible-fix (6 moderate + 1 low, todas tooling Expo entangled: @expo/mcp-tunnel, @expo/prebuild-config, @hono/node-server, @modelcontextprotocol/sdk, expo-dev-launcher, expo-mcp, @babel/core) quedan listadas y agendadas a la revision mensual, sin aplicarse ahora para no desestabilizar el tooling pineado a SDK 54.
2. **Riesgo aceptado y monitoreado** (sin fix upstream limpio): el cuelgue sincronico de `XLSX.read` ante un `.xlsx` corrupto/malicioso (ver Risks). Se acepta con modelo de amenaza y mitigaciones documentadas, no se silencia.
3. **Upgrades mayores SDK-gated**: las 14 moderate cuyo unico fix es `expo@57` / `expo-dev-client@57` / `expo-notifications@57` / `jest-expo@57` se difieren al change de upgrade de SDK; se enumeran explicitamente y se monitorean. Un scanner nunca se declara verde por estar en este bucket: el reporte enumera lo diferido.

Owner: plan `preparacion-operativa-sdd-harness`. Rollback: revertir el PR restaura `xlsx@0.18.5`, retira `overrides` y el ADR sin tocar datos.

## Risks / Mitigations

- **CDN no-registry**: `integrity` en lockfile + tarball oficial + monitoreo por cadencia. Verificado: `npm audit` deja de listar `xlsx` tras el upgrade (0.20.3 >= umbral parcheado); no fue necesario silenciar nada.
- **Cuelgue sincronico del parser (residual, bucket 2 del ADR)**: verificado el 2026-07-22, `XLSX.read` (0.20.3) sobre una cabecera ZIP-deflate truncada de ~14 bytes no termina (bucle sincronico), incluso parcheado. Es una propiedad preexistente de depender de SheetJS para parsear entrada no confiable (0.18.5 igual o peor); este change NO la introduce. Modelo de amenaza: archivo seleccionado por el propio docente, sin parseo servidor de terceros; peor caso = congelamiento que obliga a reiniciar, sin perdida de datos (import es preview-antes-de-confirmar); la advisory grave (prototype pollution) SI queda corregida. Mitigaciones: tope de 5 MB, wrapper que convierte throws en error controlado, preview-antes-de-confirmar. Monitoreo y salida en el ADR. Nota: el caso CFB (viejo `.xls`) SI se rechaza rapido; el cuelgue es especifico de la ruta ZIP-inflate.
- **Override que rompa Metro/jest/Expo**: se detecta con typecheck/lint/tests/expo-check; se acota (selector por major) o retira ese override y se documenta. Verificado: typecheck, lint, `expo install --check` ("up to date") y tests afectados verdes tras los overrides.
- **Falso positivo del tope de tamano**: umbral holgado (5 MB) muy por encima de listas docentes reales; ajustable en PR documentado.
