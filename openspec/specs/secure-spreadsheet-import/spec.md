# secure-spreadsheet-import Specification

## Purpose
TBD - created by archiving change resolver-riesgo-y-cadencia-dependencias. Update Purpose after archive.
## Requirements
### Requirement: Parseo con build de SheetJS parcheado

La importacion de hojas de calculo (`XLSX.read` sobre archivos elegidos por el docente) SHALL usar SheetJS `0.20.3`, parcheado contra CVE-2023-30533 y CVE-2024-22363, obtenido del tarball oficial y consumido desde una copia vendorizada verificada. Esta versión corrige esas advisories, pero MUST NOT presentarse como solución al bloqueo síncrono residual ante ciertos ZIP corruptos.

#### Scenario: La version instalada corrige ambas advisories

- **WHEN** se inspecciona la dependencia `xlsx` resuelta por package y lockfile
- **THEN** usa `0.20.3` desde el tarball local cuyo origen oficial y checksum están verificados

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

Los servicios de importacion SHALL convertir en un error de dominio controlado y accionable las excepciones que el parser lance por una estructura inválida. El contrato MUST distinguir esas excepciones de un bloqueo síncrono dentro de `XLSX.read`, que no devuelve control y por tanto no puede ser interrumpido ni capturado por `try/catch`; el tamaño máximo tampoco elimina ese riesgo.

#### Scenario: Archivo con estructura invalida produce error controlado

- **WHEN** la importación recibe un archivo cuya estructura provoca que el parser lance una excepción
- **THEN** termina con un error de dominio controlado y no propaga la excepción

#### Scenario: El riesgo de bloqueo no se presenta como eliminado

- **WHEN** se revisan mensajes, comentarios, documentación y tests de la importación
- **THEN** distinguen el error lanzado del bloqueo síncrono y no prometen que el límite o `try/catch` eviten todos los cuelgues

#### Scenario: Reproducción peligrosa queda aislada

- **WHEN** se verifica el buffer ZIP truncado que puede bloquear SheetJS
- **THEN** se ejecuta únicamente en un proceso hijo con timeout y terminación controlada

### Requirement: La exportacion conserva su comportamiento

La exportacion de Alumnos y Grupos (`XLSX.write` sobre datos propios de la app) SHALL mantener su contrato y formatos de salida (`.xlsx`, PDF) sin cambios observables.

#### Scenario: Exportar a Excel sigue produciendo el mismo archivo

- **WHEN** el docente exporta una lista de alumnos o un grupo a Excel
- **THEN** se genera un workbook con las mismas hojas y columnas que antes del change

