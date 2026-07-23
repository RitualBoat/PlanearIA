## ADDED Requirements

### Requirement: Cada consumidor fija e identifica su release

Un consumidor SHALL registrar paquete, versión exacta, schema e identidad verificable de la release que
administra sus archivos. SHALL NOT tratar `latest`, una instalación global, un path local o una rama Git
como identidad reproducible.

#### Scenario: Consumidor sano

- **WHEN** el doctor inspecciona un repositorio actualizado
- **THEN** manifiesto, lockfile, instalación y state coinciden en la versión exacta
- **AND** los hashes administrados corresponden a esa release

#### Scenario: Solo existe instalación global

- **WHEN** falta la dependencia fijada aunque `project-os` exista en PATH
- **THEN** el doctor registra `FAIL`
- **AND** no usa el binario global para producir un falso verde

### Requirement: Upgrade check es determinista y read-only

La versión destino del CLI SHALL comparar estado, owners, hashes, schemas y migraciones antes de escribir.
`upgrade --check` SHALL producir el mismo plan para entradas iguales, enumerar validaciones/rollback y
SHALL NOT modificar archivos, Git, GitHub, credenciales, instalaciones, assessments o registro de deuda.

#### Scenario: Migración soportada

- **WHEN** se solicita una versión destino con camino conocido
- **THEN** el plan enumera operaciones, schemas, evidencia y rollback
- **AND** no cambia el working tree

#### Scenario: Schema futuro

- **WHEN** el repositorio declara un schema mayor que el CLI destino
- **THEN** el check falla antes de escribir
- **AND** explica que debe usarse una versión compatible

#### Scenario: Plan repetido

- **WHEN** se ejecuta dos veces con el mismo estado
- **THEN** diff, orden y códigos semánticos son iguales
- **AND** no aparecen timestamps o paths temporales en la comparación contractual

### Requirement: Upgrade apply preserva ownership, deuda y recuperación

`upgrade --apply` SHALL reutilizar transacciones, owners y hashes. SHALL modificar solo rutas administradas
y migrar schemas explícitamente. SHALL NOT borrar trabajo humano, archivos del proyecto, assessments de
deuda ni estado no perteneciente a la operación.

#### Scenario: Aplicación exitosa

- **WHEN** el plan es compatible y no hay colisiones
- **THEN** la transacción termina `completed` y las validaciones pasan
- **AND** un nuevo `--check` produce cero drift

#### Scenario: Fallo parcial

- **WHEN** una fixture interrumpe el upgrade
- **THEN** el journal permite resume o rollback determinista
- **AND** la recuperación no depende de `git reset --hard`

#### Scenario: Archivo editado por una persona

- **WHEN** el hash actual difiere del estado administrado
- **THEN** el upgrade bloquea esa ruta antes de sobrescribir
- **AND** ofrece adopción, exclusión o restauración explícitas

#### Scenario: Assessment existente

- **WHEN** un upgrade migra el schema del motor de deuda
- **THEN** conserva contenido e identidad de assessments históricos
- **AND** valida que el registro resultante los refleje

### Requirement: La automatización Git crea PR sin mergear ramas protegidas

Con `--open-pr`, el CLI SHALL verificar Git/gh, crear o reutilizar rama versionada, aplicar, validar,
commitear, publicar la rama y crear o reutilizar un PR. SHALL NOT hacer push directo, aprobar ni mergear.

#### Scenario: PR creado

- **WHEN** Git está limpio, gh autenticado y no existe PR equivalente
- **THEN** crea una rama acotada y un PR hacia la rama configurada
- **AND** devuelve URL, commit y comandos de recuperación

#### Scenario: PR ya existente

- **WHEN** la rama/version ya tiene un PR abierto compatible
- **THEN** reutiliza ese PR idempotentemente
- **AND** no crea duplicados

#### Scenario: GitHub no autenticado

- **WHEN** gh no puede leer o escribir el repositorio
- **THEN** se detiene sin afirmar que creó el PR
- **AND** conserva cambios locales y recovery redactado

#### Scenario: Working tree con cambios

- **WHEN** existen cambios no clasificados antes de `--open-pr`
- **THEN** el preflight falla antes de crear rama o commit
- **AND** no mueve, guarda ni descarta trabajo ajeno

### Requirement: PlanearIA se convierte en consumidor sin runtime duplicado

Después de una release pública sana, PlanearIA SHALL fijar el paquete y ejecutar solo smokes de contrato
para constructor y deuda. Suite completa y source canónico SHALL vivir upstream. Durante la transición
SHALL existir SHA de corte y dirección única de cambios.

#### Scenario: Corte de ownership

- **WHEN** upstream, GitHub Release y npm han pasado gates
- **THEN** PlanearIA fija la versión exacta y prueba sus wrappers
- **AND** retira `tools/project-constructor` y `tools/debt-control` como sources editables

#### Scenario: Cambio solicitado después del corte

- **WHEN** PlanearIA necesita modificar comportamiento del Engineering OS
- **THEN** el cambio nace mediante issue/SDD/PR en upstream
- **AND** PlanearIA solo adopta una release posterior

#### Scenario: Upstream aún no está sano

- **WHEN** falta package, provenance, CI o rollback probado
- **THEN** PlanearIA conserva temporalmente el runtime embebido congelado
- **AND** no crea una dependencia rota ni elimina su recovery

### Requirement: Rollback de consumidor usa releases inmutables

Rollback SHALL volver a la última versión sana fijada y restaurar solo archivos administrados cuya
integridad coincide. Una release defectuosa SHALL deprecarse y corregirse con una versión nueva; SHALL NOT
borrarse, sobrescribirse o reetiquetarse.

#### Scenario: Volver a versión sana

- **WHEN** una adopción nueva falla y existe versión previa compatible
- **THEN** un PR fija la versión anterior y aplica su rollback soportado
- **AND** tests contractuales demuestran la recuperación

#### Scenario: No existe migración inversa segura

- **WHEN** el CLI no puede restaurar un schema sin pérdida
- **THEN** bloquea el rollback automático
- **AND** ofrece recovery manual que preserva assessments y trabajo del consumidor
