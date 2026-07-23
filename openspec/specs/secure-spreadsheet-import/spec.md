# secure-spreadsheet-import Specification

## Purpose
TBD - created by archiving change resolver-riesgo-y-cadencia-dependencias. Update Purpose after archive.
## Requirements
### Requirement: Parseo con build de SheetJS parcheado

La importacion de hojas de calculo (`XLSX.read` sobre archivos elegidos por el docente) SHALL usar un build de SheetJS parcheado contra CVE-2023-30533 (prototype pollution) y CVE-2024-22363 (ReDoS), es decir version `>= 0.20.2`, obtenido del tarball oficial de SheetJS y fijado por `integrity` en el lockfile.

#### Scenario: La version instalada corrige ambas advisories

- **WHEN** se inspecciona la version de `xlsx` resuelta en el lockfile
- **THEN** es `>= 0.20.2` y su entrada declara `resolved` (tarball oficial) e `integrity`

#### Scenario: El prototipo global no queda contaminado tras importar

- **WHEN** un servicio de importacion parsea un archivo de entrada
- **THEN** `Object.prototype` no gana propiedades inyectadas por el contenido del archivo

### Requirement: Tope de tamano antes de parsear entrada no confiable

Los servicios de importacion (`alumnoImportService`, `grupoImportService`) SHALL rechazar, antes de invocar el parser, cualquier archivo cuyo tamano exceda un maximo declarado, devolviendo un error controlado que las pantallas muestran como estado de error. El limite MUST evaluarse tanto sobre el tamano informado por el selector como sobre el tamano real leido.

#### Scenario: Archivo enorme es rechazado sin parsear

- **WHEN** el docente selecciona un archivo cuyo tamano supera el maximo permitido
- **THEN** la importacion termina con un error controlado ("archivo demasiado grande") y no invoca al parser

#### Scenario: Archivo dentro del limite se procesa

- **WHEN** el docente selecciona un archivo valido dentro del limite de tamano
- **THEN** la importacion parsea las filas y devuelve validos y errores por fila como hoy

### Requirement: Error controlado cuando el parser rechaza la entrada

Los servicios de importacion SHALL convertir cualquier fallo del parser (archivo con estructura invalida o que no es una hoja de calculo) en un error de dominio controlado y accionable, sin propagar una excepcion sin capturar ni exponer datos de otro usuario.

Nota: un `.xlsx` deliberadamente corrupto por la ruta ZIP-inflate puede provocar un cuelgue sincronico del parser SheetJS; es un riesgo residual preexistente documentado en `Documentacion/02-operacion/CADENCIA_DEPENDENCIAS.md` (bucket 2). El tope de tamano acota su amplitud y la advisory grave de prototype pollution queda corregida por el build parcheado; el peor caso es un congelamiento que obliga a reiniciar, sin perdida de datos (import es preview-antes-de-confirmar).

#### Scenario: Archivo con estructura invalida produce error controlado

- **WHEN** la importacion recibe un archivo cuya estructura el parser rechaza (por ejemplo un contenedor CFB truncado)
- **THEN** termina con un error de dominio controlado y no propaga una excepcion sin capturar

### Requirement: La exportacion conserva su comportamiento

La exportacion de Alumnos y Grupos (`XLSX.write` sobre datos propios de la app) SHALL mantener su contrato y formatos de salida (`.xlsx`, PDF) sin cambios observables.

#### Scenario: Exportar a Excel sigue produciendo el mismo archivo

- **WHEN** el docente exporta una lista de alumnos o un grupo a Excel
- **THEN** se genera un workbook con las mismas hojas y columnas que antes del change

