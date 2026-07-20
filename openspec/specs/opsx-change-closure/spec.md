# opsx-change-closure Specification

## Purpose

Define el cierre de un change OpenSpec mediante PR hacia la rama protegida: la espera determinista de checks, la clasificacion de sus estados por evidencia y la prohibicion de push directo al target.
## Requirements
### Requirement: El cierre de un change ocurre solo mediante PR hacia la rama protegida

El repositorio SHALL exponer un unico comando local de cierre que publique la rama del change, cree o reutilice un PR hacia el target protegido y ordene el merge a GitHub. El comando SHALL NOT hacer checkout, merge ni push directo sobre el target. El comando SHALL abortar antes de publicar nada cuando la rama actual sea el target, una rama protegida, un `HEAD` desprendido o tenga cambios sin commitear.

#### Scenario: Rama de change lista

- **WHEN** el operador ejecuta el cierre desde una rama de change con el arbol limpio
- **THEN** el comando publica la rama, crea o reutiliza un PR hacia el target y deja el merge en manos de GitHub, sin escribir en el target de forma local

#### Scenario: Rama protegida o arbol sucio

- **WHEN** el operador ejecuta el cierre desde el target, una rama protegida, `HEAD` desprendido o con cambios sin commitear
- **THEN** el comando aborta con un mensaje que nombra la condicion y no publica ni mergea nada

### Requirement: La espera de checks distingue por evidencia los estados del PR

El comando de cierre SHALL clasificar el resultado de la consulta de checks en cuatro estados excluyentes: aprobados, pendientes, aun no registrados y fallidos. La clasificacion SHALL usar como evidencia el par formado por el codigo de salida y la salida de error de la consulta, dado que el codigo de salida por si solo no distingue "aun no registrados" de "fallidos".

Solo la salida de error que declare explicitamente que el PR no reporta checks SHALL clasificarse como "aun no registrados". Cualquier otra terminacion distinta de cero, exitosa o no reconocida, SHALL clasificarse como fallo.

#### Scenario: Checks aprobados

- **WHEN** la consulta de checks termina con exito
- **THEN** el estado es aprobados y el cierre continua hacia el merge

#### Scenario: Checks pendientes

- **WHEN** la consulta de checks termina con el codigo reservado para checks pendientes
- **THEN** el estado es pendientes y el comando sigue esperando a que terminen

#### Scenario: Checks aun no registrados

- **WHEN** la consulta falla y su salida de error declara que el PR no reporta checks
- **THEN** el estado es aun no registrados y el comando reintenta en vez de concluir que el PR no tiene checks

#### Scenario: Checks fallidos

- **WHEN** la consulta falla sin declarar que el PR no reporta checks
- **THEN** el estado es fallidos y el comando aborta sin mergear

#### Scenario: Salida de error no reconocida

- **WHEN** la consulta falla con una salida de error que el comando no reconoce
- **THEN** el estado es fallidos y el comando aborta, sin tratar la condicion como ausencia de checks

### Requirement: El comando sondea de forma acotada antes de concluir que no hay checks

El comando de cierre SHALL reintentar la consulta de checks mientras el estado sea "aun no registrados", limitado por un deadline y un intervalo configurables. El sondeo SHALL detenerse en cuanto el estado deje de ser "aun no registrados". El comando SHALL NOT reintentar checks fallidos ni relanzar workflows.

El sondeo SHALL cubrir unicamente la ventana previa al registro de los checks: una vez que el PR reporta checks, la espera a que terminen SHALL conservar la exigencia vigente sobre los checks requeridos, sin acortarla ni filtrarla.

#### Scenario: Checks que aparecen tarde

- **WHEN** las primeras consultas indican que el PR aun no reporta checks y una consulta posterior, dentro del deadline, ya los reporta
- **THEN** el comando continua con la espera normal a que terminen y el cierre procede sin intervencion manual

#### Scenario: Checks fallidos durante el sondeo

- **WHEN** una consulta durante el sondeo clasifica como fallidos
- **THEN** el comando aborta de inmediato sin agotar el deadline y sin reintentar

#### Scenario: Sondeo desactivado

- **WHEN** el operador fija el deadline del sondeo en cero
- **THEN** el comando concluye en la primera consulta, reproduciendo el comportamiento previo al sondeo

### Requirement: Agotar el sondeo aborta con diagnostico y nunca mergea

Cuando el sondeo agote su deadline sin que el PR reporte checks, el comando SHALL abortar con un diagnostico accionable que identifique el PR, el commit evaluado, el tiempo esperado y la via de verificacion. El comando SHALL NOT mergear, y SHALL NOT interpretar la ausencia de checks como checks aprobados.

Ningun fallo del paso de checks SHALL presentarse como un volcado de pila sin diagnostico.

#### Scenario: Timeout sin checks

- **WHEN** el deadline del sondeo se agota y el PR sigue sin reportar checks
- **THEN** el comando aborta con un diagnostico que nombra PR, commit, tiempo esperado y que revisar, y el PR permanece sin mergear

#### Scenario: Fallo con diagnostico legible

- **WHEN** el paso de checks falla por cualquier causa
- **THEN** el comando informa la causa en un mensaje accionable en vez de un volcado de pila crudo

### Requirement: El merge y la limpieza ocurren solo tras checks aprobados

El comando SHALL ordenar el merge unicamente despues de que la espera de checks termine en aprobados, y SHALL atar el merge al commit evaluado. El comando SHALL actualizar el target local y borrar la rama local solo tras confirmar el merge remoto.

El modo de previsualizacion SHALL terminar antes de esperar CI, sin crear efectos irreversibles.

#### Scenario: Merge tras aprobacion

- **WHEN** la espera de checks termina en aprobados
- **THEN** el comando ordena el merge atado al commit evaluado y, tras confirmarlo, actualiza el target local y borra la rama local

#### Scenario: Previsualizacion

- **WHEN** el operador ejecuta el cierre en modo previsualizacion
- **THEN** el comando reporta lo que haria y termina antes de esperar CI, sin mergear ni borrar ramas

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

### Requirement: El cierre ejecuta una red de seguridad de deuda posterior al merge

Cuando el motor de deuda esta configurado, el comando de cierre SHALL ejecutar, despues de confirmar
el merge remoto y actualizar el target local, una comprobacion final de deuda que recalcula el estado
del registro y sincroniza el expediente GitHub segun el modo configurado. Un resultado FAIL de esta
comprobacion SHALL reflejarse en la salida y en el exit code del cierre con causa y recuperacion; un
WARN SHALL reflejarse en la salida con su causa sin alterar el exit code. Ningun resultado SHALL
revertir el merge ya realizado ni presentarse como exito cuando no lo es. Si el motor no esta
configurado, el cierre SHALL reportar la comprobacion como omitida de forma explicita.

#### Scenario: Cierre que detecta una pausa aun no reconocida

- **WHEN** el merge remoto termina, un plan esta pausado y su expediente aun no lo refleja (el issue de
  remediacion se crea en esta ejecucion o la sincronizacion requerida falla)
- **THEN** el cierre reporta el trigger y el issue o el fallo de sincronizacion
- **AND** termina con exit code distinto de cero explicando que el merge ya ocurrio y que sigue

#### Scenario: Cierre con pausa ya reconocida

- **WHEN** el merge remoto termina y los planes pausados ya tienen su expediente al dia (issue de
  remediacion existente y sincronizacion sin cambios, o modos advisory/off con registro local)
- **THEN** la comprobacion reporta la pausa como WARN visible con su causa
- **AND** el cierre termina con exito sin presentar la pausa como resuelta

#### Scenario: Cierre limpio

- **WHEN** el merge remoto termina y el registro no tiene triggers activos
- **THEN** la red de seguridad reporta PASS y el cierre conserva su salida habitual

#### Scenario: Motor ausente

- **WHEN** el repositorio no tiene politica de deuda configurada
- **THEN** el cierre reporta la comprobacion de deuda como omitida y continua sin fallo

