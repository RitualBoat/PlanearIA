# base-component-library Specification

## Purpose
Define la biblioteca de componentes presentacionales base de PlanearIA: que componentes existen, que estados presentan, como consumen los tokens de `design-tokens` en runtime, que garantiza su accesibilidad (rol, etiqueta, area tactil de 44pt y foco visible en web) y como respetan la reduccion de movimiento. Es la capa entre los tokens y las pantallas; la navegacion primaria pertenece a `adaptive-app-shell` y no vive aqui.
## Requirements
### Requirement: La biblioteca base expone un conjunto cerrado de componentes presentacionales

El sistema SHALL exponer en `src/components/base/` diez componentes presentacionales reutilizables: `Screen`, `Card`, `Button`, `Input`, `Chip`, `Sheet`, `Toast`, `Banner`, `EmptyState` y `Skeleton`, accesibles desde un barrel unico. Los componentes SHALL ser presentacionales: no leen almacenamiento, no llaman al backend ni conocen entidades de dominio.

La biblioteca SHALL NOT incluir la navegacion primaria (`AppShell`, `TabBar`, `SidebarRail`, `TopBar`), entregada por `adaptive-app-shell`, ni los grupos de componentes de IA, de sincronizacion o de datos, que pertenecen a sus propios changes.

#### Scenario: Un autor ensambla una pantalla sin decidir estilos

- **WHEN** un autor necesita un boton, una tarjeta o un campo de texto para una pantalla nueva
- **THEN** lo importa desde la biblioteca base y obtiene un componente con estados y accesibilidad ya resueltos, sin definir colores, radios ni espaciados propios

#### Scenario: La navegacion primaria no se duplica

- **WHEN** se revisa el contenido de la biblioteca base
- **THEN** no existe en ella ningun componente de navegacion primaria, porque esa superficie pertenece a `adaptive-app-shell`

#### Scenario: Los componentes no acceden a datos

- **WHEN** se revisa cualquier componente de la biblioteca base
- **THEN** no lee AsyncStorage, no invoca servicios de red ni importa repositorios de dominio: recibe todo por props

### Requirement: Los componentes consumen tokens en runtime y nunca color estatico

Todo componente de la biblioteca base SHALL derivar su presentacion de los tokens vigentes en runtime: color desde los tokens del tema activo, y espaciado, radios, tipografia, elevacion, movimiento y z-index desde los tokens de `design-tokens`. Ningun archivo de la biblioteca SHALL importar la paleta estatica legacy `COLORS`. La tipografia SHALL consumirse a traves del helper de escalado, de modo que respete el modo de fuente activo.

#### Scenario: El docente cambia de tema claro a oscuro

- **WHEN** el docente cambia el tema mientras un componente de la biblioteca esta montado
- **THEN** el componente se redibuja con los colores del tema nuevo, sin reiniciar la app

#### Scenario: El docente activa un modo de fuente mayor

- **WHEN** el docente selecciona un modo de fuente mayor
- **THEN** el texto de los componentes de la biblioteca escala su tamano y su interlineado por el factor activo

#### Scenario: El docente usa un modo de daltonismo

- **WHEN** hay un modo de daltonismo activo
- **THEN** los componentes reciben la paleta ya filtrada, porque toman el color del punto de consumo unico del tema y no de una paleta propia

#### Scenario: Ningun componente importa la paleta estatica legacy

- **WHEN** se inspeccionan los archivos de la biblioteca base
- **THEN** ninguno importa `COLORS`, y la restriccion es verificable de forma automatica

### Requirement: Los controles interactivos presentan sus estados y los declaran a la accesibilidad

Todo componente interactivo de la biblioteca SHALL presentar de forma visualmente distinguible los estados que le apliquen entre normal, pressed, disabled y loading, y SHALL declararlos en su estado de accesibilidad. Un control deshabilitado SHALL NOT ejecutar su accion. Un control en estado loading SHALL NOT ejecutar su accion de nuevo y SHALL anunciarse como ocupado.

#### Scenario: El docente presiona un boton

- **WHEN** el docente mantiene presionado un boton habilitado
- **THEN** el boton presenta su estado pressed y, al soltar, ejecuta su accion una sola vez

#### Scenario: El docente toca un control deshabilitado

- **WHEN** el docente toca un control en estado disabled
- **THEN** el control no ejecuta su accion y se anuncia como deshabilitado a la tecnologia de asistencia

#### Scenario: Una accion esta en curso

- **WHEN** un boton esta en estado loading
- **THEN** muestra su indicador de progreso, se anuncia como ocupado y no vuelve a ejecutar su accion aunque se toque otra vez

#### Scenario: Un campo de texto reporta un error

- **WHEN** un campo recibe un mensaje de error
- **THEN** presenta el error de forma visible junto al campo y lo asocia al control para la tecnologia de asistencia, sin depender solo del color para comunicarlo

### Requirement: Los cuatro estados de pantalla tienen componente y salida accionable

El sistema SHALL cubrir los cuatro estados de pantalla con la biblioteca base: **loading** mediante un componente de esqueleto, y **empty**, **error** y **offline** mediante un componente de estado con variante explicita para cada uno. Cada variante de estado SHALL presentar un icono o ilustracion con intencion, un mensaje propio de la variante y al menos una accion de salida. Ningun estado SHALL quedar como pantalla en blanco ni como texto suelto sin salida.

#### Scenario: Una coleccion esta cargando

- **WHEN** una vista espera datos
- **THEN** presenta esqueletos con la forma aproximada del contenido que llegara, no una pantalla en blanco

#### Scenario: Una coleccion esta vacia

- **WHEN** una vista no tiene elementos que mostrar
- **THEN** presenta el estado vacio con su mensaje propio y una accion que permite crear el primer elemento o salir de la vista

#### Scenario: Una operacion falla

- **WHEN** una vista no pudo obtener sus datos por un error
- **THEN** presenta la variante de error con su mensaje propio y una accion de reintento

#### Scenario: El dispositivo esta sin conexion

- **WHEN** una vista no puede operar porque el dispositivo esta sin conexion
- **THEN** presenta la variante offline, indica que el trabajo local se conserva y ofrece una accion de reintento

#### Scenario: Las variantes se distinguen entre si

- **WHEN** se comparan las variantes empty, error y offline
- **THEN** cada una presenta su propio icono y su propio mensaje, sin reutilizar el texto de otra variante

### Requirement: Los controles cumplen el area tactil minima de 44 puntos

Todo control interactivo de la biblioteca SHALL ofrecer un area tactil de al menos 44x44 puntos. Cuando la forma visual del control sea menor a 44 puntos, el sistema SHALL extender el area tactil sin alterar el tamano visual. Este criterio SHALL mantenerse aunque sea mas estricto que el minimo AA de WCAG 2.2, porque coincide con el nivel AAA y con las guias de plataforma.

#### Scenario: Un control de tamano completo

- **WHEN** se mide el area tactil de un boton o de un campo de texto
- **THEN** su alto efectivo es de al menos 44 puntos

#### Scenario: Un control visualmente compacto

- **WHEN** un control cuya forma visual mide menos de 44 puntos, como un chip compacto o un boton de icono, se mide en su area tactil
- **THEN** el area tactil alcanza 44x44 puntos mediante extension, y el tamano visual del control no cambia

### Requirement: Todo control declara rol y etiqueta, y muestra foco visible en web

Todo componente interactivo de la biblioteca SHALL declarar su rol de accesibilidad y una etiqueta accesible legible. Cuando un control se presenta solo con icono, SHALL declarar igualmente una etiqueta textual. En web, todo control enfocable SHALL presentar un indicador de foco visible derivado de los tokens del tema, y SHALL NOT suprimir el indicador de foco sin proveer un reemplazo visible.

#### Scenario: Un lector de pantalla recorre un control

- **WHEN** una tecnologia de asistencia enfoca un control de la biblioteca
- **THEN** anuncia su rol y su etiqueta, y no lo presenta como un elemento sin nombre

#### Scenario: Un control solo con icono

- **WHEN** un control se presenta unicamente con un icono, sin texto visible
- **THEN** declara una etiqueta accesible que describe su accion

#### Scenario: El docente navega con teclado en web

- **WHEN** el docente desplaza el foco con el teclado hasta un control enfocable en web
- **THEN** el control presenta un indicador de foco visible que contrasta con su fondo en el tema activo

#### Scenario: El foco sale del control

- **WHEN** el foco abandona un control enfocado
- **THEN** el indicador de foco desaparece y el control vuelve a su presentacion normal

### Requirement: Toda animacion respeta la reduccion de movimiento

Todo componente de la biblioteca que anime SHALL consultar la primitiva unica de reduce-motion de `design-tokens` y, cuando reporte activo, SHALL presentar una variante estatica equivalente que llegue al mismo estado final sin transicion. Las animaciones SHALL implementarse con la libreria de animacion vigente del proyecto, con los presets de movimiento de `design-tokens`. El sistema SHALL NOT introducir librerias de animacion de DOM.

#### Scenario: El docente pidio reducir movimiento

- **WHEN** el ajuste de reducir movimiento esta activo, por el sistema operativo o por la preferencia in-app
- **THEN** los componentes alcanzan su estado final sin transicion animada, y el esqueleto de carga se presenta como bloque solido sin destello

#### Scenario: Ninguna senal de reduccion activa

- **WHEN** ni el ajuste del sistema ni la preferencia in-app piden reducir movimiento
- **THEN** los componentes presentan sus micro-interacciones normalmente

#### Scenario: Cada componente animado comunica estado

- **WHEN** se revisa una micro-interaccion de la biblioteca
- **THEN** comunica estado o confirma una accion, y no es puramente decorativa

### Requirement: La biblioteca se documenta con un catalogo verificable que no llega a produccion

El sistema SHALL ofrecer una pantalla catalogo que presente cada componente de la biblioteca con sus estados, para servir de superficie de revision y de validacion visual por breakpoint. El catalogo SHALL montarse unicamente en compilaciones de desarrollo y SHALL NOT quedar alcanzable para el docente en produccion. El catalogo SHALL registrarse dentro de un hub existente y SHALL NOT agregar rutas a la raiz de navegacion.

#### Scenario: Una persona revisa la biblioteca en desarrollo

- **WHEN** se abre la app en modo desarrollo y se navega al catalogo
- **THEN** encuentra cada componente de la biblioteca renderizado con sus estados, incluidos loading, empty, error y offline

#### Scenario: El docente usa la app publicada

- **WHEN** el docente recorre la app en una compilacion de produccion
- **THEN** no encuentra la pantalla de catalogo por ninguna ruta, porque no se registra fuera de desarrollo

#### Scenario: La raiz de navegacion no crece

- **WHEN** se cuenta la cantidad de rutas hermanas en la raiz de navegacion tras agregar el catalogo
- **THEN** el numero no aumenta, porque el catalogo vive dentro de un hub existente

### Requirement: La biblioteca es aditiva y no altera pantallas ni componentes vigentes

Crear la biblioteca base SHALL ser una adicion de fundacion, no un cambio de comportamiento de la app. El change SHALL NOT modificar pantallas existentes, SHALL NOT borrar ni reescribir los componentes vigentes que se solapan en proposito, SHALL NOT cambiar el contrato publico de los contextos de tema, tamano de fuente, daltonismo ni preferencias de accesibilidad, y SHALL NOT agregar dependencias nuevas de runtime.

#### Scenario: Las pantallas vigentes no cambian

- **WHEN** el docente abre cualquier pantalla existente tras el change
- **THEN** la ve y la usa igual que antes, porque ninguna consume todavia la biblioteca base

#### Scenario: Los componentes que se solapan se conservan

- **WHEN** se revisan los componentes vigentes cuyo proposito coincide con uno de la biblioteca base
- **THEN** siguen presentes y sin modificar, y su migracion queda declarada como trabajo posterior

#### Scenario: Los contextos protegidos conservan su contrato

- **WHEN** una pantalla consume los contextos de tema, tamano de fuente, daltonismo o preferencias de accesibilidad
- **THEN** recibe exactamente el mismo valor y comportamiento que antes del change

#### Scenario: No se adoptan dependencias nuevas

- **WHEN** se revisa la superficie de dependencias tras el change
- **THEN** no se agrego ninguna dependencia de runtime nueva, y las superficies translucidas usan el token de superposicion solido como fallback

### Requirement: Las capas modales exponen un ancla de medicion propia del panel

Todo componente de la biblioteca base que se apoye en la capa modal de la plataforma SHALL exponer un
identificador de prueba estable sobre **el panel visible que el docente ve**, distinto del identificador
del fondo oscurecido y distinto de cualquier contenedor que la plataforma web inserte por su cuenta.

El identificador SHALL derivarse del identificador que el consumidor ya entrega al componente, de modo
que el contrato publico del componente no crezca y todo consumidor que ya lo entrega obtenga el ancla
sin modificar su codigo.

La verificacion visual de estos componentes SHALL medir ese ancla propia. La verificacion SHALL NOT
apoyarse en atributos de accesibilidad para localizar el panel cuando la plataforma web pueda haberlos
colocado en un contenedor envolvente: el envoltorio ocupa el viewport completo y devuelve mediciones
plausibles que describen un elemento distinto del que se quiere medir.

#### Scenario: Se mide la forma de una capa modal en navegador

- **WHEN** se mide en navegador el panel de un componente de la biblioteca que usa la capa modal
- **THEN** la medicion se ancla en el identificador propio del panel y devuelve las dimensiones del panel, no las de la ventana

#### Scenario: Un consumidor ya entrega identificador al componente

- **WHEN** una superficie monta el componente entregandole un identificador de prueba
- **THEN** el panel queda anclado automaticamente, sin que esa superficie declare nada adicional

#### Scenario: El fondo y el panel se distinguen

- **WHEN** se inspeccionan los identificadores que emite el componente
- **THEN** el fondo oscurecido y el panel exponen anclas distintas, de modo que medir una nunca devuelve la otra

### Requirement: La forma por breakpoint de las capas modales esta cubierta por regresion en los limites

El sistema SHALL cubrir con prueba automatica la forma que cada capa modal de la biblioteca adopta en
cada rango de breakpoint, verificando los anchos de frontera de los rangos y no solo un ancho
representativo por rango.

La prueba SHALL obtener la clasificacion del ancho desde la fuente reactiva de breakpoints vigente y
SHALL NOT declarar los limites como constantes propias, de modo que mover un rango en la fuente haga
fallar tambien esta cobertura en vez de dejarla verde afirmando sobre un limite inexistente.

La prueba SHALL afirmar la forma observable completa (dimension del panel, alineacion del contenedor
que lo coloca y tratamiento de las esquinas que lo anclan a un borde) y SHALL NOT limitarse a la
dimension, porque una dimension correcta con alineacion incorrecta sigue siendo un layout incorrecto.

#### Scenario: Se mueve un limite de breakpoint

- **WHEN** alguien modifica el limite de un rango en la fuente reactiva de breakpoints
- **THEN** la cobertura de forma de las capas modales falla, porque deriva su clasificacion de esa misma fuente

#### Scenario: Un ancho de frontera cambia de forma

- **WHEN** una capa modal adopta en el ancho limite de un rango la forma del rango contiguo
- **THEN** la prueba de ese ancho falla y nombra la propiedad que difiere

#### Scenario: El panel mide bien pero se coloca mal

- **WHEN** el panel conserva su dimension correcta pero el contenedor que lo coloca cambia su alineacion
- **THEN** la prueba falla, porque afirma la forma observable y no solo la dimension

