# Spec delta: cross-surface-assignment

## ADDED Requirements

### Requirement: Un solo selector resuelve asignar y adjuntar en toda la app

El sistema SHALL resolver la accion de asignar o adjuntar un elemento existente a un destino academico mediante un unico componente selector compartido, alimentado por un unico ViewModel. Ninguna superficie SHALL construir su propio selector de destino, ni su propio dialogo de confirmacion de asignacion, ni duplicar la logica de resolucion de destinos.

El selector SHALL recibir por contrato los elementos a asignar, de modo que cualquier superficie pueda montarlo sin conocer su implementacion interna, y SHALL NOT depender de una pantalla concreta ni obligar a navegar fuera del contexto de trabajo del docente.

#### Scenario: Dos superficies distintas ofrecen asignar

- **WHEN** dos superficies distintas de la app ofrecen asignar un elemento
- **THEN** ambas presentan el mismo selector, con la misma estructura de destinos y el mismo lenguaje de confirmacion

#### Scenario: Una superficie intenta construir su propio selector

- **WHEN** se inspecciona el codigo de las superficies que asignan mediante el selector compartido
- **THEN** ninguna declara su propia lista de destinos, su propio dialogo de confirmacion ni su propia ejecucion de la asignacion

#### Scenario: Asignar sin abandonar el trabajo

- **WHEN** el docente inicia una asignacion desde la superficie donde esta trabajando
- **THEN** el selector se abre sobre esa superficie y, al cerrarse, el docente permanece donde estaba

### Requirement: El destino se elige en cascada y los niveles finos son opcionales

El sistema SHALL ofrecer el destino en tres niveles jerarquicos: clase, unidad dentro de esa clase y actividad dentro de esa clase. La unidad y la actividad SHALL ser opcionales: una asignacion con solo la clase elegida SHALL ser valida y completa.

Cada nivel SHALL ofrecer unicamente destinos pertenecientes al nivel superior ya elegido, y SHALL cargarse a partir de los datos locales del usuario en sesion. Cambiar un nivel superior SHALL invalidar la eleccion de los niveles inferiores.

El sistema SHALL mantener coherente la marca de actividad: cuando se elige una actividad como destino, el elemento SHALL quedar referenciado a esa actividad y marcado como asignado a una actividad; cuando no se elige actividad, el elemento SHALL NOT quedar marcado como asignado a una actividad ni conservar una referencia a una actividad anterior.

El nivel de actividad SHALL ofrecerse unicamente cuando todos los elementos por asignar pueden referenciar una actividad. El sistema SHALL NOT ofrecer un nivel de destino cuya eleccion la escritura descartaria: ofrecerlo produciria una confirmacion que nombra un destino que no se aplica.

#### Scenario: El docente elige solo la clase

- **WHEN** el docente elige una clase y confirma sin elegir unidad ni actividad
- **THEN** la asignacion se ejecuta y el elemento queda asignado a esa clase

#### Scenario: El docente afina hasta la unidad

- **WHEN** el docente elige una clase y despues una unidad de esa clase
- **THEN** el selector solo ofrece unidades de la clase elegida y el elemento queda asignado a esa clase y a esa unidad

#### Scenario: El docente cambia de clase despues de elegir unidad

- **WHEN** el docente ya eligio una unidad y despues cambia la clase
- **THEN** la unidad y la actividad elegidas se descartan y solo se ofrecen las de la clase nueva

#### Scenario: El docente elige una actividad como destino

- **WHEN** el docente elige una actividad y confirma
- **THEN** el elemento queda referenciado a esa actividad y marcado como asignado a una actividad

#### Scenario: El docente asigna sin elegir actividad

- **WHEN** el docente confirma una asignacion sin actividad elegida sobre un elemento que antes estaba asignado a una actividad
- **THEN** el elemento deja de estar marcado como asignado a una actividad y no conserva la referencia anterior

#### Scenario: Un elemento no puede referenciar una actividad

- **WHEN** alguno de los elementos por asignar no admite referencia a una actividad
- **THEN** el selector no ofrece el nivel de actividad, de modo que el docente no puede elegir un destino que la escritura descartaria

### Requirement: Toda asignacion queda encolada en el motor de sincronizacion

El sistema SHALL registrar cada asignacion como una operacion en la cola del motor de sincronizacion vigente, en el mismo acto en que la escribe localmente. Ninguna superficie SHALL escribir una asignacion directamente en almacenamiento sin encolarla.

El sistema SHALL NOT crear colas, clientes HTTP, almacenes ni estado de sincronizacion propios para lograrlo: SHALL usar el motor existente.

#### Scenario: El docente asigna y despues la app sincroniza

- **WHEN** el docente asigna un elemento y a continuacion ocurre un ciclo de sincronizacion cuya lista remota aun no refleja esa asignacion
- **THEN** la asignacion local se conserva, por estar encolada, y se sube al servidor

#### Scenario: El docente asigna sin conexion

- **WHEN** el docente asigna un elemento sin conexion
- **THEN** la asignacion queda guardada localmente y encolada, y se sube sola al recuperar la conexion, sin intervencion del docente

#### Scenario: Se revisa el camino de escritura de una asignacion

- **WHEN** se inspecciona cualquier camino de codigo que escribe una asignacion
- **THEN** ese camino encola la operacion en el motor de sincronizacion y no abre colas, clientes ni almacenes propios

#### Scenario: Se asigna un elemento de un tipo cuya clave de almacenamiento tuvo una version legacy

- **WHEN** se asigna un elemento creado por la app vigente
- **THEN** la escritura ocurre sobre la clave de almacenamiento que la app usa para leer ese tipo de elemento, y la asignacion es efectiva

### Requirement: La asignacion requiere confirmacion explicita con el destino nombrado

El sistema SHALL NOT escribir ninguna asignacion antes de una confirmacion explicita del docente. El texto de confirmacion SHALL nombrar el destino elegido y la cantidad de elementos afectados, y SHALL NOT limitarse a una formula generica.

La accion de confirmar SHALL estar deshabilitada mientras no exista al menos una clase elegida y al menos un elemento por asignar.

#### Scenario: El docente abre el selector y lo cierra

- **WHEN** el docente abre el selector, elige un destino y cierra sin confirmar
- **THEN** no se escribe ninguna asignacion y no se encola ninguna operacion

#### Scenario: El docente ve que va a hacer antes de hacerlo

- **WHEN** el docente tiene elementos y destino elegidos
- **THEN** la confirmacion nombra el destino elegido y cuantos elementos se van a asignar

#### Scenario: No hay destino elegido

- **WHEN** el docente no ha elegido clase
- **THEN** la accion de confirmar esta deshabilitada y anunciada como deshabilitada

### Requirement: El resultado se afirma segun el hecho real

El sistema SHALL informar el resultado de la asignacion distinguiendo si quedo sincronizada o si quedo guardada en el dispositivo a la espera de subir. El sistema SHALL NOT afirmar que una asignacion se completo cuando no se modifico ningun elemento, ni presentar como sincronizado lo que sigue en cola.

Cuando el resultado dependa del estado de sincronizacion, el sistema SHALL expresarlo con el vocabulario de la fuente unica de presentacion de sincronizacion, y SHALL NOT introducir textos propios para la falta de conexion o el servidor no disponible.

#### Scenario: La asignacion sube al servidor

- **WHEN** el docente confirma con el servidor alcanzable y la cola queda vacia
- **THEN** el resultado informa que la asignacion quedo sincronizada

#### Scenario: La asignacion queda en cola

- **WHEN** el docente confirma sin conexion o con el servidor no alcanzable
- **THEN** el resultado informa que quedo guardada en el dispositivo y se asignara al reconectar, con el vocabulario compartido de sincronizacion

#### Scenario: No se modifico ningun elemento

- **WHEN** una asignacion confirmada no modifica ningun elemento
- **THEN** el sistema no afirma que la asignacion se completo e informa el resultado real

### Requirement: El selector funciona sin conexion y presenta sus estados

El sistema SHALL permitir asignar sin conexion: la falta de conexion SHALL presentarse como informacion y SHALL NOT deshabilitar la accion de confirmar.

El selector SHALL presentar de forma disenada su estado de carga, su estado vacio con una salida accionable, y su estado de error con reintento.

#### Scenario: El docente asigna en modo avion

- **WHEN** el docente abre el selector sin conexion
- **THEN** el selector informa la falta de conexion, permite elegir destino y permite confirmar

#### Scenario: El docente aun no tiene clases

- **WHEN** el docente abre el selector, la carga de destinos termino y no tiene ninguna clase
- **THEN** el selector presenta un estado vacio que explica la situacion y ofrece una salida para crear una clase

#### Scenario: Los destinos todavia estan cargando

- **WHEN** el selector abre y la fuente de clases aun no termino de cargar
- **THEN** el selector presenta su estado de carga y SHALL NOT afirmar que el docente no tiene clases

#### Scenario: Falla la carga de destinos

- **WHEN** la carga de destinos falla
- **THEN** el selector informa el error y ofrece reintentar, sin cerrar la hoja ni perder los elementos seleccionados

### Requirement: El selector es operable y comprensible sin depender del color

El sistema SHALL anunciar cada opcion de destino con su nombre y su estado de seleccion mediante propiedades de accesibilidad explicitas, sin depender del color ni de la marca visual para comunicar la eleccion.

Mientras el selector esta abierto, el foco SHALL permanecer dentro de el, y el selector SHALL poder cerrarse tanto desde su control de cierre como desde el fondo. Todo control interactivo SHALL ofrecer un area tactil de al menos 44 puntos en ambos lados.

Toda transicion introducida por el selector SHALL ofrecer una variante sin movimiento cuando la preferencia del sistema o de la app pide reducir el movimiento, conservando el mismo estado final.

#### Scenario: Un lector de pantalla recorre las opciones

- **WHEN** un lector de pantalla recorre las opciones de destino
- **THEN** cada opcion anuncia su nombre y si esta elegida, sin depender del color

#### Scenario: El docente navega con teclado en web

- **WHEN** el docente abre el selector en web y navega con teclado
- **THEN** el foco permanece dentro del selector, es visible en cada control y el selector puede cerrarse desde el teclado

#### Scenario: La preferencia de reducir movimiento esta activa

- **WHEN** la preferencia de reducir movimiento esta activa
- **THEN** el selector alcanza el mismo estado final sin recorrido animado
