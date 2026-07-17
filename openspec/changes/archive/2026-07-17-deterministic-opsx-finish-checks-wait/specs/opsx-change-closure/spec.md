# opsx-change-closure

## ADDED Requirements

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
