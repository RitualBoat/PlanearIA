## ADDED Requirements

### Requirement: Cada consumidor fija e identifica su release

Un repositorio consumidor SHALL registrar nombre, versión exacta, schema y checksum o identidad
verificable de la release que administra sus archivos. SHALL NOT tratar `latest`, una instalación global
o el contenido copiado de un template como estado instalado reproducible.

#### Scenario: Consumidor sano

- **WHEN** doctor o upgrade inspecciona un repositorio preparado
- **THEN** identifica la release exacta y su schema desde estado versionado
- **AND** puede resolver el contrato CLI sin depender de PlanearIA

#### Scenario: Solo existe una instalación global

- **WHEN** no hay release fijada pero el comando está disponible globalmente
- **THEN** el diagnóstico reporta WARN o FAIL según la operación solicitada
- **AND** proporciona recuperación con paquete/version exactos

### Requirement: Upgrade check es determinista y no muta

La versión destino del CLI SHALL comparar estado, owners, hashes y migraciones antes de escribir. El
modo `upgrade --check` SHALL producir el mismo plan para las mismas entradas, SHALL enumerar validaciones
y rollback, y SHALL NOT modificar archivos, Git, GitHub, credenciales o instalaciones.

#### Scenario: Migración soportada

- **WHEN** se ejecuta `upgrade --check` hacia una versión exacta con migración conocida
- **THEN** informa archivos, owners, cambios, migraciones, comandos de validación y punto de rollback
- **AND** termina sin diferencias en el working tree

#### Scenario: Schema futuro

- **WHEN** el estado del consumidor usa un schema más nuevo que el CLI destino
- **THEN** el check falla antes de escribir
- **AND** indica usar una versión compatible o restaurar la release correcta

#### Scenario: Plan repetido

- **WHEN** el check se ejecuta dos veces sin cambiar entradas
- **THEN** produce un resultado semánticamente idéntico
- **AND** no crea timestamps, lockfiles o metadata incidental dentro del repositorio

### Requirement: Upgrade apply preserva ownership y recuperación

`upgrade --apply` SHALL reutilizar las transacciones, owners y hashes del constructor. SHALL aplicar solo
una migración explícita conocida, detenerse ante colisiones no administradas y registrar suficiente
estado para resume o rollback. SHALL NOT borrar trabajo humano ni rutas ajenas.

#### Scenario: Aplicación exitosa

- **WHEN** el repositorio está limpio y el plan no tiene conflictos
- **THEN** aplica la migración, ejecuta validaciones y registra la nueva release
- **AND** un segundo check reporta cero drift

#### Scenario: Fallo parcial

- **WHEN** una validación o escritura falla después de iniciar la transacción
- **THEN** el estado queda marcado como incompleto con causa y comandos de resume/rollback
- **AND** una reejecución no repite ciegamente operaciones ya confirmadas

#### Scenario: Archivo editado por una persona

- **WHEN** un hash administrado ya no coincide con el valor esperado
- **THEN** apply o rollback detiene esa ruta y reporta la colisión
- **AND** conserva la edición humana

### Requirement: La automatización Git crea PR sin mergear ramas protegidas

Con `--open-pr`, el CLI SHALL verificar Git y `gh`, crear o reutilizar una rama
`chore/project-os-v<version>`, aplicar y validar la actualización, commitear únicamente sus superficies,
publicar la rama y crear o reutilizar un PR. SHALL NOT hacer push directo, aprobar ni mergear el PR.

#### Scenario: PR creado

- **WHEN** el working tree está limpio, `gh` está autenticado y las validaciones pasan
- **THEN** el CLI crea una rama/commit/PR trazables a la versión destino
- **AND** la rama protegida permanece sin cambios hasta revisión y CI

#### Scenario: PR ya existente

- **WHEN** existe un PR abierto para la misma rama, versión y head
- **THEN** el comando reutiliza ese PR y devuelve su URL
- **AND** no crea un duplicado

#### Scenario: GitHub no autenticado

- **WHEN** `gh` no existe, no está autenticado o carece de scope
- **THEN** la actualización local no afirma haber publicado una rama o PR
- **AND** reporta causa, estado y pasos manuales sin iniciar OAuth

#### Scenario: Working tree con cambios

- **WHEN** existen cambios ajenos antes de crear la rama
- **THEN** el comando aborta antes de aplicar
- **AND** pide aislar o clasificar el trabajo existente

### Requirement: PlanearIA se convierte en consumidor sin runtime duplicado

Después de una release pública sana, PlanearIA SHALL fijar el paquete upstream y ejecutar solo smokes de
contrato consumidor. La suite completa y el source canónico SHALL vivir en upstream. Durante la
transición SHALL existir un SHA de corte y una única dirección autorizada para cambios.

#### Scenario: Corte de ownership

- **WHEN** la primera release upstream y npm han pasado sus gates
- **THEN** PlanearIA actualiza wrappers/lockfile a esa versión y retira la copia canónica embebida
- **AND** la documentación registra fecha, SHA de corte, release y rollback

#### Scenario: Cambio solicitado después del corte

- **WHEN** una mejora afecta runtime, blueprint, schemas o CLI
- **THEN** se implementa primero mediante PR en upstream
- **AND** PlanearIA la adopta después mediante upgrade/version fijada

#### Scenario: Release upstream defectuosa

- **WHEN** los smokes de PlanearIA fallan con la nueva versión
- **THEN** su PR de adopción no se mergea o se revierte a la última versión sana
- **AND** la corrección se publica como una versión nueva en upstream

### Requirement: Rollback de consumidor usa releases inmutables

El rollback SHALL permitir volver a la última versión sana fijada y restaurar únicamente archivos
administrados cuya integridad coincide. Una release defectuosa SHALL deprecarse y corregirse con una
versión nueva; SHALL NOT borrarse, sobrescribirse o reetiquetarse silenciosamente.

#### Scenario: Volver a versión sana

- **WHEN** una adopción produce una regresión antes o después del merge
- **THEN** un PR normal fija la versión anterior y ejecuta la migración inversa soportada
- **AND** conserva evidencia de la versión defectuosa y del recovery

#### Scenario: No existe migración inversa segura

- **WHEN** el CLI no puede restaurar una ruta sin perder una edición posterior
- **THEN** el rollback se detiene y solicita resolución humana
- **AND** no usa `git reset --hard` ni borra la ruta
