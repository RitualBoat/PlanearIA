# Tasks: resolver-riesgo-y-cadencia-dependencias

## 1. Actualizar xlsx a build parcheado (CDN 0.20.3)

- [x] 1.1 Guardar `npm audit --json` antes como evidencia y confirmar `xlsx@0.18.5` con `resolved: undefined` en el lockfile. Evidencia: `audit-before` 28 advisories (7 high, 20 moderate, 1 low); `node_modules/xlsx` version 0.18.5, `resolved: undefined`.
- [x] 1.2 Instalar `xlsx` desde el tarball oficial `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` (sin `npm audit fix`). Evidencia: lockfile `node_modules/xlsx` version 0.20.3, `resolved: https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, `integrity: sha512-oLDq3jw7AcLqKWH2A...`, license Apache-2.0.
- [x] 1.3 `npm audit --json` despues: `xlsx` ya no aparece en el reporte (no silenciado: la version parcheada resuelve la advisory). Evidencia: audit tras upgrade 27 advisories (6 high, 20 moderate, 1 low); `xlsx in report: NO (cleared)`.

## 2. Endurecer la ruta de lectura no confiable

- [x] 2.1 Creado `src/services/spreadsheetImport.ts` (helper compartido: `MAX_IMPORT_BYTES` = 5 MB, `SpreadsheetImportError`, `assertSupportedFile`, `readSpreadsheetRows` con validacion de `asset.size` y `arrayBuffer.byteLength` antes de `XLSX.read` y parseo envuelto en try/catch). `alumnoImportService.ts` y `grupoImportService.ts` cablean el helper; export services sin tocar.
- [x] 2.2 Creado `src/__tests__/services/spreadsheetImport.test.ts` (8 tests: extension no soportada, tope por `asset.size` sin invocar fetch, tope por byteLength, CFB truncado -> error controlado, fetch !ok, workbook valido -> filas, no contaminacion de `Object.prototype`) y `src/__tests__/harness/spreadsheetDependency.test.ts` (XLSX.version >= 0.20.2 y lockfile CDN+integrity). Nota: el buffer corrupto por ruta ZIP-inflate cuelga a SheetJS (residual bucket 2 del ADR); el test usa CFB truncado que rechaza rapido.
- [x] 2.3 Tests afectados verdes: `npx jest src/__tests__/alumnos src/__tests__/grupos src/__tests__/services/spreadsheetImport.test.ts src/__tests__/harness/spreadsheetDependency.test.ts` => 24 suites / 86 tests verdes, sin ruido de consola no declarado.

## 3. Cadencia via overrides dirigidos

- [x] 3.1 Agregado `package.json#overrides` con selectores por major: `ws@6`->6.2.4, `ws@7`->7.5.11, `form-data`->4.0.6, `js-yaml@3`->3.15.0, `js-yaml@4`->4.3.0, `shell-quote`->1.10.0, `brace-expansion@1`->1.1.16, `brace-expansion@5`->5.0.7, `fast-uri`->3.1.4. Versiones confirmadas con `npm view <pkg>@<version>`. Los majores sanos (ws 8.x) quedan intactos.
- [x] 3.2 `npm install` reescribio el lockfile; `npm audit` despues: 21 advisories = 0 high, 20 moderate, 1 low. Evidencia: `remaining high/critical: NONE`; versiones resueltas verificadas con `npm ls` (ws 6.2.4/7.5.11/8.21.x, etc.). Ningun override retirado por incompatibilidad.
- [x] 3.3 Toolchain sana: `npm run typecheck` exit 0; `npm run lint -- --quiet` exit 0; `npx expo install --check` => "Dependencies are up to date"; tests afectados verdes. Expo SDK 54 sin cambios (expo ~54.0.36).

## 4. ADR de cadencia de dependencias

- [x] 4.1 Creado `Documentacion/02-operacion/CADENCIA_DEPENDENCIAS.md` con los tres buckets, tabla de los 9 overrides aplicados (6 paquetes high), los 7 compatible-fix agendados, el residual del parser (bucket 2), las 14 moderate SDK-gated enumeradas, owner, revision mensual y rollback.
- [x] 4.2 ADR enlazado desde `design.md` (D4 y Risks) y desde el runbook `Documentacion/02-operacion/CONTROL_DEUDA_TECNICA.md` (seccion Ver tambien).

## 5. Cierre

- [x] 5.1 `npm run typecheck` exit 0 y `npm run lint -- --quiet` exit 0. Ademas `npm test -- --runInBand` => 120 suites / 837 tests verdes sin ruido de consola no declarado.
- [x] 5.2 `npm run test:debt-control` 58/58; `npm run agent:harness:check` "OK (36 mirrors in parity)"; `npm run openspec:validate` 44 passed / 0 failed + TLDR OK.
- [x] 5.3 Reproducibilidad: `npm ci` x2, ambos exit 0, `package-lock.json` con md5 identico en los tres snapshots (before=ci1=ci2 = 0ddfa5c31eed2cc130fe88948c9ec1db). Sin drift.
- [x] 5.4 Revision adversarial independiente (skill adversarial-review): veredicto PASS, 0 Blockers / 0 Majors / 3 Minors rastreados (residual de parseo, 7 compatible-fix agendados, refs de readiness). Publicada en https://github.com/RitualBoat/PlanearIA/issues/133#issuecomment-5053492821
- [ ] 5.5 Assessment `kind: remediation` capturado con `npm run debt:capture` resolviendo `debt-6c9672a48059` y `debt-d73a5844fae3` con evidencia, sin candidatos confirmados nuevos.
- [ ] 5.6 `npm run openspec:ready:archive -- --change resolver-riesgo-y-cadencia-dependencias --run-local` en PASS y `readiness.json` completo.
