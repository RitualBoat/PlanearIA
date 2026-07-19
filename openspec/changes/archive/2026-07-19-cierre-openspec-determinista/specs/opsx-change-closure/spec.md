## ADDED Requirements

### Requirement: El archive de un change tiene un unico comando y un unico owner de la sincronizacion de specs

El repositorio SHALL exponer un unico comando local que ejecute el paso de archive de un change:
sincronizacion de specs principales, movimiento del directorio a `archive/` y consolidacion en git.
La sincronizacion de las specs principales SHALL tener un unico owner, la CLI de OpenSpec durante el
archive. El comando SHALL NOT reimplementar la aplicacion de deltas ni mover el directorio por medios
propios cuando la CLI ya ofrece esa operacion con degradacion segura en el sistema de archivos local.

Ningun workflow de agente SHALL recomendar sincronizar las specs principales como paso previo al
archive, ni SHALL prescribir un movimiento manual del directorio del change.

#### Scenario: Archive de un change con spec no sincronizada

- **WHEN** el operador ejecuta el comando de archive sobre un change cuyas deltas aun no se aplicaron a las specs principales
- **THEN** el comando delega la aplicacion de deltas y el movimiento del directorio a la CLI, y el change queda archivado con las specs principales actualizadas, sin intervencion manual

#### Scenario: Workflow de agente sin la recomendacion que rompe

- **WHEN** un agente lee el workflow de archive generado y normalizado
- **THEN** el workflow nombra el comando unico de archive, y no ofrece sincronizar antes ni mover el directorio a mano

### Requirement: El estado de sincronizacion de las deltas se clasifica en tres estados excluyentes

El comando de archive SHALL clasificar, antes de escribir nada, el estado de sincronizacion de las
deltas del change en tres estados excluyentes: `pendiente`, `sincronizada` y `parcial`. La
clasificacion SHALL decidirse por la presencia de los encabezados de requirement en las specs
principales, que es el mismo criterio con el que la CLI decide abortar.

Una operacion `MODIFIED` cuya requirement existe en la spec principal SHALL tratarse como neutra, dado
que su aplicacion reemplaza el bloque completo y es idempotente. Una delta compuesta unicamente de
operaciones neutras SHALL clasificarse como `pendiente`.

El estado `pendiente` SHALL archivar aplicando las deltas. El estado `sincronizada` SHALL archivar
omitiendo la aplicacion de deltas. El estado `parcial` SHALL abortar.

#### Scenario: Deltas sin aplicar

- **WHEN** ninguna operacion no neutra de las deltas esta aplicada en las specs principales
- **THEN** el estado es `pendiente` y el archive se ejecuta aplicando las deltas

#### Scenario: Deltas ya aplicadas a mano

- **WHEN** todas las operaciones no neutras de las deltas ya estan aplicadas en las specs principales
- **THEN** el estado es `sincronizada` y el archive se ejecuta omitiendo la aplicacion de deltas, sin conflicto ni duplicacion de requirements

#### Scenario: Sincronizacion parcial

- **WHEN** unas operaciones no neutras estan aplicadas y otras no, o una operacion resulta indeterminada
- **THEN** el estado es `parcial`, el comando aborta nombrando la capacidad y la requirement discrepante, y no escribe ninguna spec ni mueve el change

### Requirement: El archive verifica la rama antes de escribir

El comando de archive SHALL abortar antes de leer specs o mover archivos cuando `HEAD` este en la rama
target, en una rama protegida o desprendido, y el mensaje SHALL nombrar la condicion encontrada. El
comando SHALL abortar tambien cuando existan cambios sin commitear fuera del directorio de OpenSpec,
para no arrastrar trabajo ajeno al commit del archive.

#### Scenario: Archive desde rama protegida

- **WHEN** el operador ejecuta el archive con `HEAD` en la rama target, en otra rama protegida o desprendido
- **THEN** el comando aborta nombrando la condicion y no sincroniza, mueve ni commitea nada

#### Scenario: Trabajo ajeno sin commitear

- **WHEN** el arbol tiene cambios sin commitear fuera del directorio de OpenSpec
- **THEN** el comando aborta y no crea un commit de archive que los incluya

### Requirement: El archive consolida su salida en un commit de la rama del change

El comando de archive SHALL dejar la salida del archive rastreada y commiteada en la rama del change,
de modo que el comando de cierre por PR encuentre el arbol limpio. El comando SHALL NOT hacer commit,
push ni merge sobre la rama target protegida.

El comando de archive SHALL ejecutar el gate de readiness de archive antes de actuar y SHALL detenerse
cuando ese gate reporte fallo, sin reimplementarlo ni relajarlo.

#### Scenario: Salida consolidada

- **WHEN** el archive termina correctamente
- **THEN** el directorio archivado y las specs principales quedan rastreados y commiteados en la rama del change, y el arbol de trabajo queda limpio

#### Scenario: Gate de readiness en fallo

- **WHEN** el gate de readiness de archive reporta fallo para el change
- **THEN** el comando se detiene sin sincronizar, mover ni commitear

### Requirement: Reejecutar el archive es un no-op verificable o una recuperacion segura

El comando de archive SHALL clasificar el estado del repositorio antes de actuar y SHALL ser seguro de
reejecutar. Reejecutarlo sobre un change ya archivado y commiteado SHALL terminar con exito sin crear
un segundo directorio archivado ni un segundo commit. Reejecutarlo sobre un change archivado pero sin
commitear SHALL consolidar y commitear la salida existente sin repetir el archive.

Un estado de repositorio que el comando no pueda clasificar SHALL abortar con diagnostico, y SHALL NOT
tratarse como exito. El comando SHALL NOT ofrecer una bandera que omita la clasificacion.

#### Scenario: Reejecucion sobre archive completo

- **WHEN** el operador reejecuta el archive sobre un change ya archivado y commiteado
- **THEN** el comando informa el commit existente y termina con exito, sin duplicar el archive, la spec ni el commit

#### Scenario: Reejecucion sobre archive sin commitear

- **WHEN** el operador reejecuta el archive sobre un change ya movido a `archive/` pero cuya salida no esta commiteada
- **THEN** el comando consolida y commitea esa salida sin repetir el movimiento ni la sincronizacion

#### Scenario: Estado de repositorio no clasificable

- **WHEN** el directorio activo del change y su directorio archivado existen a la vez
- **THEN** el comando aborta con un diagnostico que nombra ambos caminos, sin escribir nada
