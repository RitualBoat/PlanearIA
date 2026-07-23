# Cadencia de Dependencias y Advisories

> **Estado:** vigente.
> **Tipo:** ADR operativo (decision de cadencia de actualizacion de dependencias).
> **Owner:** plan `preparacion-operativa-sdd-harness`.
> **Origen:** issue [#133](https://github.com/RitualBoat/PlanearIA/issues/133), epic de saneamiento [#129](https://github.com/RitualBoat/PlanearIA/issues/129); deuda `debt-6c9672a48059` (xlsx) y `debt-d73a5844fae3` (cadencia Expo).
> **No usar para:** justificar `npm audit fix`/`--force`, subir Expo SDK sin su propio change, ni declarar verde un scanner por riesgo solo aceptado.

## Por que existe

`npm audit` reporta advisories de forma continua: unas se corrigen con parches compatibles, otras solo
con el proximo Expo SDK (semver major) y otras no tienen fix upstream. Sin una cadencia declarada, los
parches compatibles no se aplican y las advisories quedan sin ventana de accion. Este ADR fija esa
ventana y clasifica cada advisory en exactamente un bucket, sin ocultar ninguna.

## Decision

1. **Revision mensual** de `npm audit --json` por el owner del plan. Cada advisory abierta se coloca en
   uno de tres buckets. La revision es read-only salvo cuando aplica parches del bucket 1.
2. **Nunca** `npm audit fix` ni `npm audit fix --force` (reescriben el arbol de forma no controlada y
   pueden arrastrar majors). Los parches compatibles se aplican con `overrides` dirigidos en
   `package.json`, pineados a la version parcheada del mismo major.
3. **Nunca** subir Expo SDK dentro de este flujo: los upgrades gated por SDK viven en su propio change
   con migracion, validacion y rollback.
4. **Ningun verde falso:** una advisory que no se corrige queda enumerada aqui (bucket 2 o 3) o
   registrada con excepcion valida en el motor de deuda. No se suprime del reporte de `npm audit`.

## Los tres buckets

### Bucket 1 - Parche compatible (overrides, mismo major)

Advisories con fix del mismo major, aplicables via `overrides` sin `npm audit fix` ni subir SDK.

Procedimiento por parche:

1. Leer el rango vulnerable y la version parcheada con `npm audit --json` y confirmar que existe con
   `npm view <pkg>@<version> version`.
2. Agregar/actualizar la entrada en `package.json#overrides`. Para paquetes con varios majores
   vulnerables se usa un selector por major (p.ej. `"ws@6": "6.2.4"`, `"ws@7": "7.5.11"`) para no tocar
   los majores sanos.
3. `npm install` para reescribir el lockfile (sin `audit fix`).
4. Verificar: `npm run typecheck`, `npm run lint -- --quiet`, tests afectados y `npx expo install --check`
   ("Dependencies are up to date"). Confirmar que Expo SDK no cambio.
5. `npm audit` despues: la advisory ya no aparece. Registrar antes/despues.

Aplicado en #133 (todas high, dev/build/CLI, no se empaquetan al runtime):

| Paquete | Rango vulnerable | Override | Consumidor |
| --- | --- | --- | --- |
| ws (6.x) | `>=6.0.0 <6.2.4` | `ws@6` -> 6.2.4 | react-native dev |
| ws (7.x) | `>=7.0.0 <7.5.11` | `ws@7` -> 7.5.11 | metro / @expo/cli dev-middleware |
| form-data | `>=4.0.0 <4.0.6` | 4.0.6 | jest / jsdom |
| js-yaml (3.x) | `<3.15.0` | `js-yaml@3` -> 3.15.0 | babel istanbul (coverage) |
| js-yaml (4.x) | `>=4.0.0 <4.3.0` | `js-yaml@4` -> 4.3.0 | eslint |
| shell-quote | `<=1.8.4` | 1.10.0 | react-devtools-core |
| brace-expansion (1.x) | `<1.1.16` | `brace-expansion@1` -> 1.1.16 | eslint / minimatch@3 |
| brace-expansion (5.x) | `>=3.0.0 <5.0.7` | `brace-expansion@5` -> 5.0.7 | typescript-eslint / minimatch@10 |
| fast-uri | `<=3.1.3` | 3.1.4 | expo-dev-client / ajv |
| postcss | `<=8.5.11` | 8.5.22 | @expo/metro-config; override deliberado sobre `~8.4.32` |

`postcss` se añadió durante #126 el 2026-07-23 cuando `npm audit` incorporó
[GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) (lectura arbitraria de
archivos, high). La versión parcheada mínima es 8.5.12; 8.5.10 también había corregido
[GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93);
se fijó 8.5.22, último parche disponible del mismo major, con licencia MIT y los mismos engines
compatibles. Aunque `@expo/metro-config@54.0.17` declara `~8.4.32`, el override no cambia Expo SDK y
queda condicionado a typecheck, lint, Jest, backend, build web y `expo install --check`. Rollback:
retirar solo este override mediante PR y reabrir el riesgo; nunca declarar el scanner verde.

Pendientes de revision mensual (compatible-fix, dev/build; no aplicados en #133 para no desestabilizar
el tooling pineado a SDK 54, que valida `expo install --check`): `@babel/core` (low), `@expo/mcp-tunnel`,
`@expo/prebuild-config`, `@hono/node-server`, `@modelcontextprotocol/sdk`, `expo-dev-launcher`,
`expo-mcp` (moderate). Se aplican en el proximo ciclo si su override no rompe la toolchain; si lo rompe,
pasan a bucket 3 o a excepcion documentada.

### Bucket 2 - Riesgo aceptado y monitoreado (sin fix upstream limpio)

Riesgos sin un parche de version que los cierre, aceptados con rationale y monitoreados. No se silencian.

- **SheetJS: cuelgue sincronico del parser ante un `.xlsx` corrupto/malicioso.** Verificado el
  2026-07-22: `XLSX.read` (0.20.3) sobre una cabecera ZIP-deflate truncada de ~14 bytes no termina
  (bucle sincronico), incluso con el build parcheado. Es una propiedad preexistente de depender de
  SheetJS para parsear entrada no confiable (0.18.5 se comportaba igual o peor); este change NO la
  introduce.
  - **Modelo de amenaza:** el archivo lo selecciona el propio docente via DocumentPicker (archivo local,
    posiblemente descargado de una fuente no confiable). No hay parseo de archivos de terceros del lado
    servidor. Peor caso: congelamiento del hilo JS que obliga a reiniciar la app. La importacion es
    preview-antes-de-confirmar, por lo que **no hay perdida de datos**. La advisory grave (prototype
    pollution, CVE-2023-30533, que podia corromper el estado de la app) SI queda corregida por 0.20.3.
  - **Registro canonico:** `debt-770acc1e9d53` en `.project-os/debt/registry.json`. El estado y la
    expiracion de su excepcion se consultan solo ahi; este ADR no mantiene una segunda fecha editable.
  - **Mitigaciones vigentes:** tope de 5 MB para no parsear archivos grandes; conversion a error de
    dominio solo cuando el parser lanza; seleccion manual y preview antes de confirmar. El tope y
    `try/catch` no interrumpen un bucle sincrono dentro de `XLSX.read`.
  - **Monitoreo/salida:** revisar mensualmente releases de SheetJS y la excepcion canonica. Si vence
    sin fix o aislamiento multiplataforma aprobado, desactivar import `.xlsx` mediante PR normal,
    conservando CSV, exportacion, assessment, item, excepcion y notices.

### Bucket 3 - Upgrade mayor condicionado al proximo Expo SDK

Advisories cuyo unico fix es un semver major del arbol Expo. Se difieren al change de upgrade de SDK
(fuera de alcance de #133). Enumeradas, no silenciadas.

Estado 2026-07-23 (13 moderate, todas gated por `expo@57` / `expo-dev-client@57` /
`expo-notifications@57` / `jest-expo@57`): `@expo/cli`, `@expo/config`, `@expo/config-plugins`,
`@expo/metro-config`, `expo`, `expo-asset`, `expo-constants`, `expo-dev-client`, `expo-manifests`,
`expo-notifications`, `jest-expo`, `uuid`, `xcode`. Todas son tooling dev/build/CLI o
runtime que solo se mueve con el bump de SDK; no se corrigen con overrides sin romper SDK 54.

## Dependencia xlsx (fuera del registro npm)

`xlsx` se instala desde la copia vendorizada `vendor/sheetjs/xlsx-0.20.3.tgz`, descargada del tarball
oficial `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` y fijada por SHA-256, metadata e
`integrity` en `package-lock.json`. El registro npm quedo
congelado en 0.18.5 (SheetJS abandono el registro). El monitoreo de esta dependencia entra en la
revision mensual: comprobar nuevas versiones en cdn.sheetjs.com y advisories aplicables.

## Evidencia (antes / despues en #133)

- Antes (2026-07-22): `npm audit` 28 advisories = 7 high, 20 moderate, 1 low.
- Despues: 21 advisories = 0 high, 20 moderate, 1 low. Se eliminaron `xlsx` (upgrade CDN) y las 6 high
  transitivas (overrides). Las moderate/low restantes quedan en buckets 1 y 3.
- Revisión 2026-07-23 durante #126: una advisory nueva de `postcss` elevó temporalmente el reporte a
  21 = 1 high, 19 moderate, 1 low. El override 8.5.22 lo dejó en 20 = 0 high, 19 moderate, 1 low.
- `npx expo install --check`: "Dependencies are up to date" antes y despues (Expo SDK 54 intacto).
- Lockfile reproducible: `npm ci` no produce drift en un segundo run.

## Rollback

- El rollback de esta correccion nunca borra el assessment, item, excepcion ni notices. Si vendoring
  falla, un PR normal puede restaurar temporalmente HTTPS con `integrity`; nunca una version vulnerable.
- Si un override rompe Metro/jest/Expo, se retira ese override puntual en un PR de correccion y el
  paquete pasa a bucket 3 o a excepcion documentada; nunca se silencia en silencio.
- Si el tope de tamano de importacion produce falsos positivos, se ajusta el umbral en un PR documentado.
