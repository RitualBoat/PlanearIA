# Proposal: resolver-riesgo-y-cadencia-dependencias

> Issue: [#133](https://github.com/RitualBoat/PlanearIA/issues/133) (child del epic de saneamiento [#129](https://github.com/RitualBoat/PlanearIA/issues/129)).
> Plan maestro: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (Ola 2 del saneamiento).
> Deuda objetivo: `debt-6c9672a48059` (decision de riesgo `xlsx`) y `debt-d73a5844fae3` (cadencia de dependencias Expo).

## Why

`xlsx@0.18.5` es la unica advisory `high` que vive en el runtime que se envia al docente. Se usa para importar (`XLSX.read` sobre archivos que el docente elige via DocumentPicker, incluido CSV) y exportar listas de alumnos y grupos. Ambas advisories de `xlsx` son de LECTURA/parseo: [CVE-2023-30533 Prototype Pollution](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) (High, <=0.19.2) y [CVE-2024-22363 ReDoS](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9) (High, <0.20.2). Un archivo malicioso importado puede contaminar `Object.prototype` o colgar la app; hoy no hay mitigacion de tamano ni version parcheada. El fix NO existe en npm (SheetJS abandono el registro; ultimo npm 0.18.5, por eso `resolved: undefined` en el lockfile); solo vive en `cdn.sheetjs.com` (0.20.3 actual, Apache-2.0).

Ademas, `npm audit` reporta 28 advisories (7 high / 20 moderate / 1 low al 2026-07-22). Las otras 6 high (`ws`, `form-data`, `js-yaml`, `shell-quote`, `brace-expansion`, `fast-uri`) viven solo en tooling dev/build/CLI (eslint, jest/jsdom, `@expo/cli`, react-devtools, expo-dev-client), no se empaquetan al runtime, y todas tienen fix compatible. Las 20 moderate son el arbol Expo y solo se corrigen con Expo 57 (semver major, fuera de alcance: `npx expo install --check` confirma que el arbol esta pineado a SDK 54). No existe una cadencia declarada que separe parches compatibles de upgrades mayores, asi que los parches no se aplican y las advisories quedan sin ventana de accion.

## What Changes

- Actualizar `xlsx` de `0.18.5` a `0.20.3` desde el tarball oficial `cdn.sheetjs.com`, fijado por `integrity` en el lockfile. Corrige AMBAS advisories en la fuente; conserva la API (import/export intactos) y la licencia Apache-2.0.
- Endurecer la ruta de LECTURA de archivos no confiables: tope de tamano antes de parsear y error controlado ante archivo invalido, sin colgar ni crashear la app. La exportacion no se toca (no parsea entrada no confiable).
- Aplicar `overrides` dirigidos para las 6 high transitivas dev/build/CLI, fijando versiones parcheadas ya publicadas, sin `npm audit fix` y sin subir Expo SDK.
- Documentar un ADR de cadencia de dependencias con tres buckets: parches compatibles (overrides), advisories sin fix (aceptar y monitorear), upgrades mayores condicionados al proximo Expo SDK.
- Registrar `npm audit` antes/despues y `npx expo install --check` como evidencia; garantizar lockfile reproducible (`npm ci` sin drift en segundo run).

## Capabilities

### New Capabilities

- `secure-spreadsheet-import`: la ruta de importacion de hojas de calculo parsea archivos no confiables con un build de SheetJS parcheado (>= 0.20.2) y aplica un tope de tamano y validacion que produce error controlado (no cuelgue ni crash) ante archivos enormes o invalidos, sin afectar la exportacion.
- `dependency-update-cadence`: el repositorio mantiene una cadencia documentada que clasifica advisories en tres buckets, aplica parches compatibles via `overrides` sin `npm audit fix` ni subir Expo SDK, conserva el lockfile reproducible y nunca declara verde un scanner por riesgo solo aceptado.

### Modified Capabilities

(ninguna: no cambia el comportamiento observable de import/export; se conserva la API de `xlsx` y los formatos soportados. El endurecimiento agrega estados de error/empty ya contemplados por las pantallas.)

## Impact

- **Codigo:** `src/services/alumnoImportService.ts`, `src/services/grupoImportService.ts` (endurecimiento de lectura); `src/services/alumnoExportService.ts`, `src/services/grupoExportService.ts` (sin cambio de contrato); nuevos tests y fixtures negativos en `src/__tests__/`.
- **Dependencias:** `package.json` (dep `xlsx` -> tarball CDN; nuevo bloque `overrides`), `package-lock.json` (re-resolucion con integrity). Sin dependencias nuevas: los `overrides` fijan versiones parcheadas de paquetes ya presentes; todas licencias permisivas existentes.
- **Docs:** nuevo ADR de cadencia en `Documentacion/02-operacion/` (y resumen en `design.md`).
- **Sistemas:** CI hereda `npm audit`/tests; sin workflows nuevos. Expo SDK 54 intacto.

## No objetivos

- No subir Expo SDK (54 -> 57) ni tocar las 20 moderate SDK-gated mas alla de documentarlas y monitorearlas.
- No correr `npm audit fix` ni `npm audit fix --force`.
- No adoptar librerias nuevas (exceljs, read-excel-file y papaparse fueron evaluadas y descartadas por mantenimiento/RN/costo de migracion).
- No tocar UI visible, el contrato de sync ni el aislamiento por `userId`.
- No resolver `debt-2887d890144e` (Ola 3), no crear el repositorio open source, no publicar npm, no retomar #126 ni reabrir PR #127.
- No declarar verde un scanner cuando el riesgo solo fue aceptado: lo aceptado se registra con excepcion valida o queda trazado en el ADR.
