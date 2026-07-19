# sync-status-presentation Specification

## Purpose
Define como PlanearIA traduce el estado de sincronizacion y de guardado a lenguaje visible: una sola fuente de derivacion, siete estados con precedencia explicita, un vocabulario compartido por toda superficie, tono nunca alarmante y estado perceptible sin depender del color. Es capa de presentacion: el motor de sincronizacion, sus colas y su almacenamiento pertenecen a `src/sync` y no viven aqui.
## Requirements
### Requirement: Una sola fuente traduce el estado de sincronizacion a lenguaje visible

El sistema SHALL derivar toda presentacion del estado de sincronizacion y guardado desde una unica funcion de mapeo alimentada por el contexto global de sincronizacion. Ninguna pantalla, componente ni hook SHALL derivar por su cuenta el titulo, el detalle, el icono ni el tono de un estado de sincronizacion. La presentacion SHALL ser una lectura derivada: el sistema SHALL NOT introducir estado de sincronizacion propio, colas, clientes HTTP ni suscripciones de conectividad adicionales para mostrarla.

#### Scenario: Dos superficies muestran el mismo estado

- **WHEN** el estado de sincronizacion es el mismo y se observan dos superficies distintas de la app
- **THEN** ambas presentan el mismo titulo, el mismo icono y el mismo tono para ese estado

#### Scenario: Una superficie intenta derivar estado por su cuenta

- **WHEN** se inspecciona el codigo de las superficies que muestran estado de sincronizacion
- **THEN** ninguna contiene literales de copy de estado, de color de estado ni tablas de decision propias, y todas obtienen su presentacion de la fuente unica

#### Scenario: La presentacion no crea estado de sincronizacion

- **WHEN** se monta cualquier superficie de presentacion de sincronizacion
- **THEN** no se abre ninguna cola, cliente HTTP ni suscripcion de conectividad adicional, y el motor de sincronizacion no cambia de comportamiento

### Requirement: El estado presentado cubre las siete situaciones reales del docente

El sistema SHALL resolver el estado presentado con una precedencia explicita, donde la primera condicion que aplica determina el resultado: sincronizacion desactivada, sin conexion, sesion expirada, sincronizando, servidor no disponible, cambios pendientes y todo sincronizado.

La sincronizacion desactivada SHALL tener la maxima precedencia: cuando el contexto reporta que la sincronizacion no esta habilitada, el sistema SHALL presentar que el trabajo esta guardado en el dispositivo, y SHALL NOT presentarlo como sincronizado ni como fallo.

La falta de conexion SHALL tener precedencia sobre la sesion expirada, porque sin conexion la accion de reingreso no puede completarse.

#### Scenario: El docente trabaja como invitado o sin API configurada

- **WHEN** el contexto reporta que la sincronizacion no esta habilitada
- **THEN** la presentacion indica que el trabajo esta guardado en este dispositivo, en tono neutro, y no afirma que esta sincronizado

#### Scenario: El docente pierde la conexion con la sesion expirada

- **WHEN** el dispositivo esta sin conexion y ademas la sesion fue rechazada
- **THEN** la presentacion muestra la falta de conexion y no ofrece la accion de reingreso, que seria imposible de completar

#### Scenario: La sesion del docente expira estando en linea

- **WHEN** el dispositivo tiene conexion, la sincronizacion esta habilitada y la sesion fue rechazada
- **THEN** la presentacion indica que la sesion expiro y ofrece la accion de volver a iniciar sesion

#### Scenario: El servidor no responde

- **WHEN** el dispositivo tiene conexion pero el servidor no es alcanzable
- **THEN** la presentacion indica que el trabajo quedo guardado en este dispositivo, explica la causa en el detalle y ofrece reintentar

#### Scenario: Hay trabajo en cola

- **WHEN** no aplica ninguna condicion anterior y existen operaciones pendientes de subir
- **THEN** la presentacion indica cuantos cambios estan por sincronizar

#### Scenario: Todo esta al dia

- **WHEN** la sincronizacion esta habilitada, hay conexion, la sesion es valida, no hay ciclo en curso y no hay operaciones pendientes
- **THEN** la presentacion indica que todo esta sincronizado

### Requirement: Ningun estado de sincronizacion se presenta como fallo del docente

El sistema SHALL presentar los estados de sincronizacion en tonos neutro, informativo, de aviso o de exito, y SHALL NOT usar el tono de error para ninguno de ellos. El tono de error SHALL reservarse para el fallo de guardado local, que es el unico caso donde el trabajo del docente corre riesgo real.

El sistema SHALL conservar los textos tranquilizadores vigentes que explican que el trabajo se guarda en el dispositivo y que el docente puede seguir trabajando. El sistema SHALL NOT presentar la falta de conexion ni la indisponibilidad del servidor como error.

#### Scenario: El servidor no responde y el docente esta trabajando

- **WHEN** el servidor no es alcanzable
- **THEN** el titulo comunica que el trabajo esta a salvo en el dispositivo, el tono es de aviso y no de error, y el texto no atribuye el fallo al docente

#### Scenario: El docente pierde la conexion

- **WHEN** el dispositivo queda sin conexion
- **THEN** el texto conserva la formulacion vigente que indica que puede seguir trabajando y que sus cambios se guardan en este dispositivo

#### Scenario: El guardado local falla

- **WHEN** una operacion de guardado en el dispositivo no se completa
- **THEN** el estado de guardado se presenta en tono de error, porque el trabajo si corre riesgo

### Requirement: El estado de guardado se distingue del estado de sincronizacion

El sistema SHALL presentar el estado de guardado local de un documento por separado del estado de sincronizacion global. La superficie de guardado SHALL recibir su estado desde quien edita el documento y SHALL NOT derivarlo del conteo global de pendientes ni construir una maquina de autoguardado propia.

Un documento guardado en el dispositivo SHALL poder presentarse como guardado aunque el estado global sea sin conexion.

#### Scenario: El docente guarda sin conexion

- **WHEN** el docente guarda un documento y el dispositivo esta sin conexion
- **THEN** la superficie de guardado indica que quedo guardado, mientras la superficie global indica que no hay conexion, sin contradecirse

#### Scenario: El editor esta guardando

- **WHEN** el editor reporta que la operacion de guardado esta en curso
- **THEN** la superficie de guardado lo indica y declara su estado ocupado de forma accesible

### Requirement: El estado es perceptible sin depender del color

El sistema SHALL exponer para cada estado una etiqueta accesible completa que comunique la situacion por texto, incluido el conteo cuando aplique, de modo que sea comprensible sin percibir color ni icono. Toda superficie de estado SHALL declarar su rol accesible, y SHALL declarar de forma explicita su estado ocupado durante la sincronizacion, sin depender de que la plataforma web lo derive.

La superficie ambiente de estado SHALL NOT anunciarse como alerta, para no interrumpir al lector de pantalla en cada ciclo periodico de sincronizacion. Las superficies accionables de estado SHALL ofrecer un area de toque de al menos 44 pt.

Toda superficie de estado SHALL consumir color, tipografia, espaciado y radios desde los tokens y el tema en runtime, y SHALL NOT introducir paletas nuevas ni valores estaticos de color.

#### Scenario: El docente usa lector de pantalla

- **WHEN** el estado de sincronizacion cambia y el docente navega con lector de pantalla
- **THEN** la etiqueta accesible comunica la situacion completa por texto, sin requerir color ni icono

#### Scenario: La app esta sincronizando

- **WHEN** hay un ciclo de sincronizacion en curso
- **THEN** la superficie declara su estado ocupado de forma explicita, tambien en web

#### Scenario: El ciclo periodico se repite

- **WHEN** el ciclo periodico de sincronizacion cambia el estado ambiente varias veces seguidas
- **THEN** la superficie ambiente no se anuncia como alerta ni interrumpe la lectura en curso

#### Scenario: El docente cambia tema, tamano de fuente o daltonismo

- **WHEN** el docente cambia el tema, la escala tipografica o el modo de daltonismo
- **THEN** las superficies de estado adoptan el cambio en caliente y ninguna conserva color estatico

### Requirement: El movimiento del estado respeta la preferencia del docente

El sistema SHALL NOT mantener animacion en bucle permanente para representar la sincronizacion en curso. Las transiciones entre estados SHALL desactivarse cuando la preferencia efectiva de reducir movimiento este activa, sirviendo el cambio de estado sin transicion y sin perdida de informacion.

#### Scenario: La sincronizacion esta en curso

- **WHEN** un ciclo de sincronizacion corre durante el intervalo periodico
- **THEN** la superficie no sostiene una animacion en bucle permanente

#### Scenario: El docente pidio reducir movimiento

- **WHEN** la preferencia efectiva de reducir movimiento esta activa y el estado cambia
- **THEN** el cambio se presenta sin transicion animada y comunica la misma informacion
