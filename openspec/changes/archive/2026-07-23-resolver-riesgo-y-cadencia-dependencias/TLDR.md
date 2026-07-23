# TLDR: resolver-riesgo-y-cadencia-dependencias

## Intencion del Proposal (por que existe)

`xlsx@0.18.5` es la unica advisory high que se envia al docente: dos fallos de LECTURA (prototype pollution CVE-2023-30533 y ReDoS CVE-2024-22363) sin fix en npm, solo en el CDN oficial de SheetJS. Un archivo malicioso importado puede contaminar el prototipo o colgar la app. Ademas `npm audit` reporta 6 high transitivas dev/build y 20 moderate del arbol Expo sin cadencia de accion. Este change (issue #133, epic #129) resuelve `debt-6c9672a48059` y `debt-d73a5844fae3` reduciendo riesgo real sin romper Expo SDK 54 ni ocultar advisories.

## Enfoque del Design (como se resuelve)

Cuatro decisiones: actualizar `xlsx` a 0.20.3 desde el tarball oficial de SheetJS (drop-in, misma API, Apache-2.0, fijado por integrity); endurecer solo la ruta de lectura no confiable con tope de tamano y error controlado; aplicar overrides dirigidos a las 6 high dev/build (sin `npm audit fix`, sin subir SDK) verificando la toolchain; y escribir un ADR de cadencia con tres buckets (parches compatibles, advisories aceptadas, upgrades SDK-gated). Se descartaron exceljs, read-excel-file y papaparse por mantenimiento, compat RN y costo de migracion.

## Comportamiento esperado del Spec (que se promete)

La importacion parsea solo con un build parcheado (>= 0.20.2, integrity en lockfile), rechaza archivos enormes antes de parsear y produce error controlado ante entrada invalida sin colgar la app ni contaminar `Object.prototype`. La exportacion conserva su contrato y formatos. La cadencia queda documentada: los parches compatibles se aplican via overrides sin tocar Expo SDK, el lockfile es reproducible (`npm ci` sin drift) y ninguna advisory diferida se silencia: queda enumerada en el ADR o con excepcion valida.

## Plan practico de Tasks (en que orden se hace)

Cinco grupos: primero el upgrade de `xlsx` desde el CDN con evidencia de audit antes/despues; luego el endurecimiento de los dos servicios de importacion con sus tests y fixtures negativos (archivo enorme, invalido, contaminacion de prototipo); tercero los overrides dirigidos verificando typecheck/lint/tests/expo-check; cuarto el ADR de cadencia con los tres buckets; al final typecheck, lint, tests afectados, test:debt-control, agent:harness:check, openspec:validate, segundo `npm ci` sin drift, revision adversarial, assessment de remediacion y gate de archive. Cada tarea se marca solo con evidencia.

## Resumen integral del change

Change de saneamiento del plan de harness que corrige en la fuente las dos advisories high de `xlsx` (unica deuda de seguridad en runtime), endurece la lectura de archivos no confiables, parchea las 6 high dev/build via overrides sin romper Expo SDK 54, y deja una cadencia escrita que separa parches compatibles de upgrades mayores sin ocultar nada. No agrega dependencias ni licencias nuevas y no genera deuda nueva: su assessment resuelve dos hallazgos de #129 y baja el presupuesto del plan pausado de 3/5 hacia la reanudacion, dejando solo la Ola 3.
