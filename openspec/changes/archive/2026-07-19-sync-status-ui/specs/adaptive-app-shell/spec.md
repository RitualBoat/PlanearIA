# Spec delta: adaptive-app-shell

## MODIFIED Requirements

### Requirement: El chrome del shell reune notificaciones, ayuda y cuenta

El sistema SHALL presentar las acciones de notificaciones, ayuda y cuenta en la barra superior del shell, y SHALL NOT montar una capa flotante de navegacion superpuesta al contenido. El indicador de notificaciones SHALL mostrar el conteo de no leidas provisto por el contexto de notificaciones, sin modificarlo. El rediseno de la pantalla de notificaciones, su agrupacion por experiencia y sus deep links pertenecen al change `notificaciones-chrome` y SHALL NOT resolverse aqui.

La barra superior del shell SHALL presentar ademas el indicador global de sincronizacion, que obtiene su presentacion de la fuente unica definida por `sync-status-presentation` y SHALL NOT derivarla por su cuenta. El indicador SHALL ocupar su propio espacio en el layout del chrome, con la misma regla que el resto de las acciones. En el breakpoint movil el indicador SHALL poder servirse en variante compacta, conservando la etiqueta accesible completa.

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

#### Scenario: El docente consulta el estado de sincronizacion desde cualquier hub

- **WHEN** el docente esta en cualquier hub del shell
- **THEN** la barra superior muestra el indicador global de sincronizacion con la presentacion de la fuente unica

#### Scenario: El chrome se sirve en pantalla angosta

- **WHEN** el shell se muestra en el breakpoint movil
- **THEN** el indicador de sincronizacion se sirve en variante compacta, conserva su etiqueta accesible completa y el chrome no desborda horizontalmente

### Requirement: El shell se comporta ante fallos y falta de conexion

El shell SHALL permanecer montado y navegable cuando el dispositivo esta sin conexion o cuando una pantalla interna falla, de modo que el docente nunca quede atrapado sin navegacion primaria. El shell SHALL NOT introducir estados de carga propios para los hubs, que son lanzadores sin carga asincrona.

La senal global de conexion y sincronizacion sigue siendo responsabilidad de las superficies de sync, y SHALL usar el vocabulario, los iconos y los tonos de la fuente unica definida por `sync-status-presentation`. El shell SHALL NOT presentar la falta de conexion como error ni introducir un vocabulario propio para ella.

#### Scenario: El docente trabaja sin conexion

- **WHEN** el dispositivo pierde la conexion mientras el docente navega
- **THEN** la navegacion primaria y el chrome siguen operando, el docente puede cambiar de hub, y la senal global de sin conexion se muestra con el vocabulario de la fuente unica, en tono de aviso y no de error

#### Scenario: Una pantalla interna falla

- **WHEN** una pantalla dentro de un hub muestra su estado de error
- **THEN** la navegacion primaria sigue visible y utilizable para salir de esa pantalla

#### Scenario: Los hubs no simulan carga

- **WHEN** el docente abre cualquier hub
- **THEN** la pantalla del hub se muestra de inmediato con sus accesos, sin esqueletos ni indicadores de carga artificiales
