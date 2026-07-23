# Brownfield baseline: resolver-riesgo-y-cadencia-dependencias

## Superficies tocadas

- `package.json` (dep `xlsx` -> tarball `cdn.sheetjs.com`; nuevo bloque `overrides`).
- `package-lock.json` (re-resolucion de `xlsx` con `resolved`+`integrity` y de las versiones fijadas por overrides).
- `src/services/alumnoImportService.ts`, `src/services/grupoImportService.ts` (tope de tamano y error controlado en la ruta de lectura).
- `src/services/alumnoExportService.ts`, `src/services/grupoExportService.ts` (sin cambio de contrato; solo se benefician del build parcheado).
- Nuevos tests y fixtures negativos en `src/__tests__/` (archivo enorme, invalido, guardia de prototipo).
- Nuevo `Documentacion/02-operacion/CADENCIA_DEPENDENCIAS.md` (ADR de cadencia).

## Fuentes de verdad actuales

- `package.json#dependencies.xlsx = ^0.18.5`; `package-lock.json` nodo `node_modules/xlsx` version `0.18.5` con `resolved: undefined` (congelado en npm).
- Salida real de `npm audit --json` del 2026-07-22: 28 advisories (7 high, 20 moderate, 1 low), guardada como evidencia antes.
- `npx expo install --check` del 2026-07-22: "Dependencies are up to date".
- Registro de deuda `.project-os/debt/registry.json` items `debt-6c9672a48059` y `debt-d73a5844fae3`.
- Uso de `xlsx` confirmado por lectura de codigo: `XLSX.read` en los 2 import services; `XLSX.write`/`utils` en los 2 export services.

## Comportamiento vigente

- La importacion parsea archivos elegidos por el docente con `XLSX.read` de `xlsx@0.18.5`, vulnerable a CVE-2023-30533 y CVE-2024-22363, sin tope de tamano ni validacion previa.
- La exportacion construye workbooks desde datos propios (no parsea entrada no confiable).
- `npm audit` reporta `xlsx` high (direct, `fixAvailable: false`) y 6 high transitivas dev/build con `fixAvailable: true`, ademas de 20 moderate del arbol Expo con fix solo via `expo@57`.
- No existe ADR de cadencia ni bloque `overrides` en `package.json`.

## Comportamiento objetivo

- La importacion parsea solo con `xlsx >= 0.20.2` (CDN oficial, integrity en lockfile), tras validar tamano; entrada invalida produce error controlado, no cuelgue ni crash; `Object.prototype` no se contamina.
- La exportacion mantiene contrato y formatos.
- Las 6 high transitivas quedan parcheadas via `overrides` sin `npm audit fix` ni subir Expo SDK; `npm audit` despues ya no las lista.
- Las 20 moderate SDK-gated quedan enumeradas y trazadas al ADR (no silenciadas); `npm ci` reproduce el arbol sin drift.

## Compatibilidad legacy

- No cambia la API de import/export ni ningun contrato de sync/storage/`userId`; los servicios conservan sus firmas publicas.
- Los `overrides` fijan versiones parcheadas del mismo major de paquetes ya presentes; si uno forzara un major incompatible en un consumidor (p.ej. `ws@6` en react-native dev), se acota o retira ese override y se documenta como aceptado-y-monitoreado en el ADR.
- La dep `xlsx` desde CDN conserva la licencia Apache-2.0 ya en uso; sin licencias nuevas.

## Owner de spec y contexto

- Specs nuevas: `secure-spreadsheet-import`, `dependency-update-cadence` (este change).
- Contexto DDD: capa de servicios de Alumnos/Grupos (Gestion Academica/Classroom) e infraestructura de dependencias; sin contrato cruzado entre bounded contexts (`design.md`).
- Plan owner: `preparacion-operativa-sdd-harness`.

## Evidencia actual

- `npm audit --json` (2026-07-22): 28 advisories; `xlsx` high directo con `fixAvailable: false`; `ws`/`form-data`/`js-yaml`/`shell-quote`/`brace-expansion`/`fast-uri` high con `fixAvailable: true`; 20 moderate Expo con fix `expo@57` (`isSemVerMajor: true`).
- `npm ls` de las 6 transitivas: todas bajo eslint, jest/jsdom, `@expo/cli`, metro, react-devtools, expo-dev-client (dev/build/CLI).
- `npx expo install --check`: "Dependencies are up to date".
- Lectura de codigo de los 4 servicios: rutas de lectura (import) vs escritura (export) confirmadas.

## Fuera de alcance

- Subir Expo SDK 54 -> 57 y las 20 moderate SDK-gated (solo documentar/monitorear).
- `npm audit fix`/`--force`; adoptar exceljs/read-excel-file/papaparse; cambiar UI visible o sync.
- `debt-2887d890144e` (Ola 3), repositorio open source, publicacion npm, #126, PR #127.
