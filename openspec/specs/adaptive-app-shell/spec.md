# adaptive-app-shell Specification

## Purpose
TBD - created by archiving change app-shell-navegacion. Update Purpose after archive.
## Requirements
### Requirement: La app abre en el Escritorio del docente

Tras autenticarse y superado el onboarding, el sistema SHALL abrir la app en el hub de Inicio (Escritorio) y SHALL NOT abrir en el feed social. La pantalla de Escritorio de este requisito es un placeholder temporal declarado como tal; el Escritorio completo pertenece al change `escritorio-docente`.

#### Scenario: El docente abre la app autenticado

- **WHEN** el docente con sesion valida y onboarding visto abre la app
- **THEN** la app muestra el hub de Inicio (Escritorio) como destino activo, con el resto de hubs accesibles desde la navegacion primaria

#### Scenario: El placeholder declara su naturaleza temporal y ofrece salidas

- **WHEN** el docente ve el Escritorio placeholder
- **THEN** encuentra un aviso explicito de que es una version temporal y accesos directos que abren Office, Clases, Asistente y Mas, sin tarjetas vacias ni datos simulados

#### Scenario: Un docente sin sesion no entra al shell

- **WHEN** una persona sin sesion valida abre la app con el onboarding ya visto
- **THEN** la app muestra la pantalla de inicio de sesion y no monta la navegacion primaria ni sus hubs

### Requirement: La navegacion primaria se adapta al ancho y nunca se duplica

El sistema SHALL presentar exactamente una superficie de navegacion primaria a cualquier ancho de ventana: barra inferior en movil (<768), navigation rail en tablet (768-1279) y sidebar con etiquetas en escritorio (>=1280). El sistema SHALL NOT mostrar barra de navegacion y rail simultaneamente en ningun ancho. La superficie SHALL derivarse de la fuente reactiva de breakpoints establecida por `reactive-breakpoints`, de modo que el cambio ocurra al redimensionar sin recargar.

#### Scenario: El docente usa el telefono

- **WHEN** el ancho util es menor a 768
- **THEN** la navegacion primaria se muestra como barra inferior con los cinco destinos y no existe rail ni sidebar montado

#### Scenario: El docente usa la tablet

- **WHEN** el ancho util esta entre 768 y 1279
- **THEN** la navegacion primaria se muestra como rail lateral y no existe barra inferior montada

#### Scenario: El docente usa la web en pantalla grande

- **WHEN** el ancho util es 1280 o mayor
- **THEN** la navegacion primaria se muestra como sidebar lateral con etiquetas junto al icono y no existe barra inferior montada

#### Scenario: El docente redimensiona la ventana cruzando un breakpoint

- **WHEN** el docente redimensiona la ventana de 1000 a 500 puntos de ancho mientras esta dentro de un hub
- **THEN** el rail se sustituye por la barra inferior sin recargar y el hub activo y su historial se conservan

### Requirement: Cada experiencia es un hub con navegacion anidada

El sistema SHALL organizar la navegacion en cinco hubs (Inicio, Office, Clases, Asistente y Mas), cada uno con su propio historial de navegacion anidado. La raiz de navegacion SHALL conservar como maximo 10 rutas hermanas. Toda ruta retirada de la raiz SHALL quedar registrada dentro de un hub, y ninguna ruta existente SHALL eliminarse del grafo de navegacion.

#### Scenario: Cada hub conserva su propio historial

- **WHEN** el docente entra a un detalle dentro de Clases, cambia a Office y regresa a Clases
- **THEN** Clases sigue en el detalle donde lo dejo, y no vuelve al inicio del hub

#### Scenario: Volver desde el primer nivel de un hub no sale de la app

- **WHEN** el docente esta en la pantalla inicial de un hub y solicita volver
- **THEN** el sistema aplica el comportamiento de retroceso del shell y no deja al docente en una pantalla sin navegacion primaria

#### Scenario: Las pantallas legacy siguen alcanzables

- **WHEN** el docente busca las pantallas que antes eran tabs propias (feed, social, contenido, cuenta)
- **THEN** las alcanza desde los hubs Mas y Office, con la misma funcionalidad que antes del cambio

#### Scenario: Un destino de otra experiencia se alcanza desde cualquier hub

- **WHEN** el docente sigue una accion que lleva de una experiencia a otra, como abrir un grupo desde la biblioteca o los recursos desde una clase
- **THEN** el sistema abre el destino en el hub que lo posee y la navegacion primaria refleja el hub activo

### Requirement: El chrome del shell reune notificaciones, ayuda y cuenta

El sistema SHALL presentar las acciones de notificaciones, ayuda y cuenta en la barra superior del shell, y SHALL NOT montar una capa flotante de navegacion superpuesta al contenido. El indicador de notificaciones SHALL mostrar el conteo de no leidas provisto por el contexto de notificaciones, sin modificarlo. El rediseno de la pantalla de notificaciones, su agrupacion por experiencia y sus deep links pertenecen al change `notificaciones-chrome` y SHALL NOT resolverse aqui.

#### Scenario: El docente tiene avisos sin leer

- **WHEN** existen notificaciones no leidas
- **THEN** la accion de notificaciones de la barra superior muestra el conteo y al activarse abre la pantalla de notificaciones vigente

#### Scenario: El docente no tiene avisos sin leer

- **WHEN** no existen notificaciones no leidas
- **THEN** la accion de notificaciones se muestra sin indicador de conteo y sigue abriendo la pantalla de notificaciones

#### Scenario: El docente gestiona su cuenta

- **WHEN** el docente abre el menu de cuenta de la barra superior
- **THEN** puede ir a su perfil, a cuenta y seguridad, o cerrar sesion, y las dos primeras opciones lo dejan dentro del hub Mas

#### Scenario: El chrome no tapa el contenido

- **WHEN** el docente trabaja en cualquier pantalla del shell
- **THEN** las acciones del chrome ocupan su propio espacio en el layout y no se superponen al contenido de la pantalla

### Requirement: Volver tras guardar regresa al origen real

El sistema SHALL devolver al docente a la pantalla desde la que abrio un formulario de creacion de grupo, tarea o recurso al terminar de guardar, usando el historial del hub. El sistema SHALL NOT depender de un parametro de ruta que declare el origen. Cuando no exista historial previo, el sistema SHALL llevar al docente a la pantalla inicial del hub correspondiente.

#### Scenario: El docente crea un grupo desde Clases

- **WHEN** el docente abre la creacion de grupo desde el hub de Clases y guarda
- **THEN** vuelve a la pantalla de Clases desde la que salio

#### Scenario: El docente crea un grupo desde la lista de grupos

- **WHEN** el docente abre la creacion de grupo desde la lista de grupos y guarda
- **THEN** vuelve a la lista de grupos, y no a otra pantalla fija

#### Scenario: El docente llega a un formulario sin historial previo

- **WHEN** el docente abre un formulario de creacion mediante un enlace directo, sin pantalla previa en el hub
- **THEN** al guardar aterriza en la pantalla inicial del hub correspondiente y no queda en una pantalla sin salida

### Requirement: El shell es accesible y respeta las preferencias del docente

Los destinos de la navegacion primaria SHALL exponer rol de pestana, etiqueta accesible y estado seleccionado. Toda accion del shell (destinos y acciones del chrome) SHALL ofrecer un area de toque de al menos 44 pt. En web, el foco SHALL ser visible y la navegacion primaria SHALL ser recorrible por teclado. El shell SHALL consumir color, tipografia, espaciado, radios, elevacion y z-index desde los tokens y el tema en runtime, y SHALL NOT introducir paletas nuevas ni valores estaticos de color. La transicion entre destinos SHALL desactivarse cuando la preferencia efectiva de reducir movimiento este activa.

#### Scenario: El docente usa lector de pantalla

- **WHEN** el docente recorre la navegacion primaria con un lector de pantalla
- **THEN** cada destino se anuncia como pestana, con su nombre y si esta seleccionado

#### Scenario: El docente cambia el tema o el tamano de fuente

- **WHEN** el docente cambia a tema oscuro, ajusta el tamano de fuente o activa un modo de daltonismo
- **THEN** el shell y su chrome adoptan el cambio en caliente, sin reiniciar la app

#### Scenario: El docente pide reducir el movimiento

- **WHEN** la preferencia efectiva de reducir movimiento esta activa y el docente cambia de destino
- **THEN** el cambio ocurre sin animacion de transicion y el resultado visual es equivalente

#### Scenario: El docente navega con teclado en web

- **WHEN** el docente recorre la navegacion primaria con el teclado en web
- **THEN** el elemento enfocado se distingue visualmente y puede activarse sin usar el raton

### Requirement: El shell se comporta ante fallos y falta de conexion

El shell SHALL permanecer montado y navegable cuando el dispositivo esta sin conexion o cuando una pantalla interna falla, de modo que el docente nunca quede atrapado sin navegacion primaria. El shell SHALL NOT introducir estados de carga propios para los hubs, que son lanzadores sin carga asincrona; la senal global de conexion y sincronizacion sigue siendo responsabilidad de las superficies de sync ya existentes.

#### Scenario: El docente trabaja sin conexion

- **WHEN** el dispositivo pierde la conexion mientras el docente navega
- **THEN** la navegacion primaria y el chrome siguen operando, el docente puede cambiar de hub, y la senal global de sin conexion se muestra como hasta ahora

#### Scenario: Una pantalla interna falla

- **WHEN** una pantalla dentro de un hub muestra su estado de error
- **THEN** la navegacion primaria sigue visible y utilizable para salir de esa pantalla

#### Scenario: Los hubs no simulan carga

- **WHEN** el docente abre cualquier hub
- **THEN** la pantalla del hub se muestra de inmediato con sus accesos, sin esqueletos ni indicadores de carga artificiales

