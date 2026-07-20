# project-constructor-bootstrap Specification

## Purpose
TBD - created by archiving change constructor-proyectos-nuevos. Update Purpose after archive.
## Requirements
### Requirement: El bootstrap parte de un repositorio vacío sin presuponer producto

El constructor SHALL poder preparar un repositorio Git vacío y escribible que no contenga `package.json`,
código fuente ni respuestas de discovery. SHALL instalar únicamente archivos y dependencias de
gobernanza/tooling declarados por el núcleo universal, y SHALL NOT preguntar por el producto, seleccionar
stack, activar perfiles técnicos ni instalar frameworks, bases de datos, proveedores cloud o servicios de
producto.

#### Scenario: Repositorio Git vacío

- **WHEN** se ejecuta el bootstrap sobre una fixture que solo contiene su directorio `.git`
- **THEN** crea el núcleo universal y sus metadatos de estado
- **AND** la validación termina sin requerir código, stack ni respuestas sobre el producto

#### Scenario: Bootstrap independiente del producto

- **WHEN** finaliza `PROMPT_00_BOOTSTRAP_ENTORNO`
- **THEN** el estado generado no contiene un perfil de producto o stack activado
- **AND** no se han instalado dependencias clasificadas como framework, base de datos, proveedor cloud o
  runtime de producto

#### Scenario: Directorio no apto

- **WHEN** el destino no es un repositorio Git, no es escribible o contiene una colisión con un archivo no
  administrado
- **THEN** el preflight falla antes de sobrescribir contenido
- **AND** explica la causa y la recuperación concreta

### Requirement: El bootstrap declara ownership antes de modificar archivos

El constructor SHALL mantener un manifiesto canónico que clasifique cada ruta como propiedad del
constructor, espejo generado, propiedad de la CLI de OpenSpec o archivo controlado por el usuario. SHALL
modificar automáticamente solo rutas bajo ownership del constructor. Los workflows OPSX SHALL conservar
ownership separado de la CLI oficial de OpenSpec y SHALL NOT ser renderizados por el sincronizador general.

#### Scenario: Plan de escritura sin conflictos

- **WHEN** el preflight evalúa un destino sin colisiones
- **THEN** muestra para cada archivo planeado su ruta, owner, operación y fuente canónica
- **AND** permite identificar los workflows OPSX como propiedad de OpenSpec

#### Scenario: Archivo no administrado ocupa una ruta planeada

- **WHEN** una ruta de salida contiene un archivo cuyo contenido y ownership no coinciden con el estado del
  constructor
- **THEN** la ejecución se detiene antes de reemplazarlo
- **AND** solicita adopción o resolución explícita sin atribuirse silenciosamente su propiedad

#### Scenario: Verificación de drift

- **WHEN** `sync --check` encuentra que un archivo administrado difiere de su fuente canónica
- **THEN** termina con código distinto de cero y muestra un diff determinista
- **AND** no modifica el archivo

### Requirement: Una ejecución parcial puede reanudarse con seguridad

El constructor SHALL registrar suficiente estado para reanudar una ejecución interrumpida. Una nueva
ejecución con la misma versión y configuración SHALL reconciliar los artefactos ya escritos y completar
únicamente operaciones pendientes. SHALL NOT duplicar bloques, plantillas, dependencias ni entradas de
configuración.

#### Scenario: Fallo inducido después de una escritura parcial

- **WHEN** una fixture interrumpe el bootstrap después de aplicar solo un subconjunto conocido de
  operaciones
- **THEN** el siguiente run completa el bootstrap
- **AND** el resultado final coincide byte por byte con una ejecución limpia equivalente

#### Scenario: Cambio humano después de la interrupción

- **WHEN** un archivo administrado fue modificado por el usuario después de la ejecución parcial
- **THEN** la reanudación informa un conflicto y no sobrescribe esa modificación
- **AND** conserva un procedimiento explícito para adoptar, restaurar o excluir la ruta

### Requirement: El segundo run no produce drift

El bootstrap SHALL ser idempotente para una versión, configuración y estado de entrada iguales. Después de
un run exitoso, un segundo run SHALL terminar correctamente sin modificar archivos, lockfiles ni metadata,
y `sync --check` SHALL confirmar paridad.

#### Scenario: Segundo run sobre la fixture completada

- **WHEN** se captura el estado del repositorio después del primer run y se ejecuta nuevamente el mismo
  bootstrap
- **THEN** el segundo run informa cero operaciones materiales
- **AND** `git diff` y la comparación de hashes no muestran cambios inesperados

#### Scenario: Entrada canónica modificada deliberadamente

- **WHEN** cambia la versión o configuración canónica del constructor
- **THEN** el dry-run identifica únicamente las rutas afectadas y la migración aplicable
- **AND** no presenta esa actualización esperada como idempotencia fallida

### Requirement: OpenSpec se instala y ejecuta localmente de forma reproducible

El núcleo SHALL declarar una versión exacta compatible de OpenSpec en el manifiesto y lockfile del
repositorio generado. Toda invocación SHALL resolver el ejecutable local fijado y SHALL NOT usar una
instalación global, `@latest` ni un fallback de descarga implícita. Los workflows generados por OpenSpec
SHALL conservar su fuente y ownership oficiales.

#### Scenario: OpenSpec local disponible

- **WHEN** se valida el repositorio después de instalar sus dependencias fijadas
- **THEN** la versión resuelta coincide con el manifiesto y lockfile
- **AND** los comandos OpenSpec se ejecutan mediante el binario local

#### Scenario: Solo existe OpenSpec global

- **WHEN** falta la dependencia local aunque exista un binario global compatible
- **THEN** la validación falla con una recuperación para restaurar el lockfile y la instalación local
- **AND** no usa el binario global para producir un falso verde

#### Scenario: Regeneración de workflows OPSX

- **WHEN** una actualización explícita de OpenSpec regenera sus workflows
- **THEN** el constructor mantiene esos archivos fuera del renderer general
- **AND** verifica su contrato mediante el checker separado definido para OpenSpec

### Requirement: Las actualizaciones son versionadas, predecibles y reversibles

El constructor SHALL comparar la versión instalada con la versión solicitada, calcular un plan de
migración determinista y ofrecer dry-run antes de cambiar el repositorio. El rollback SHALL revertir
únicamente operaciones registradas por el constructor: restaurará el contenido administrado previo y
eliminará archivos creados por ese run solo si no fueron modificados posteriormente. SHALL NOT borrar
archivos no administrados ni trabajo del usuario.

#### Scenario: Actualización con migración conocida

- **WHEN** se solicita actualizar un bootstrap anterior a una versión con migración soportada
- **THEN** el dry-run enumera archivos, migraciones, validaciones y punto de rollback
- **AND** la aplicación deja el repositorio en paridad con la nueva versión

#### Scenario: Rollback del bootstrap inicial

- **WHEN** se solicita revertir el último run y sus archivos creados permanecen sin cambios humanos
- **THEN** elimina únicamente esos archivos registrados y restaura el estado previo
- **AND** conserva `.git` y cualquier contenido ajeno al constructor

#### Scenario: Rollback encuentra una edición posterior

- **WHEN** un archivo afectado por el run ya no coincide con el hash registrado
- **THEN** el rollback se detiene para esa ruta y reporta el conflicto
- **AND** no descarta la edición posterior

